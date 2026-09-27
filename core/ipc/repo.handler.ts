import { ipcMain, dialog } from '../runtime'
import * as fs from 'fs'
import * as path from 'path'
import { getSettings, modelSwitcher } from '../utils/store'
import { getMeeting } from '../utils/meetings'
import { completeJson } from '../utils/llm'
import { llmTarget, meetingMaterial, toolPromptHeader, withModelFallback, type ContextBlock } from '../utils/brain'
import { stylePath } from '../../src/lib/paths'
import { PROVIDERS } from '../../src/lib/providers'
import type { RepoInfo, RepoFileNode, RepoSynthesisResult, IpcResult } from '../../src/types'

const IGNORED_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'out', '.next', '.nuxt', '.turbo', 'target', 'bin', 'obj', '.idea', '.vscode',
  'vendor', '__pycache__', '.venv', 'venv', 'env', '.cache', 'coverage', '.output', 'uploads', 'logs', 'tmp', 'temp'
])
const IGNORED_FILES = new Set(['.ds_store', 'thumbs.db', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'])
const VISIBLE_DOTFILES = new Set(['.env.example', '.cursorrules'])
const BINARY_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.pdf', '.zip', '.tar', '.gz',
  '.mp3', '.wav', '.ogg', '.mp4', '.mov', '.avi', '.ttf', '.woff', '.woff2', '.eot', '.pyc', '.class', '.db', '.sqlite',
  '.db-wal', '.db-shm', '.xlsx', '.xls', '.docx', '.pptx', '.pkl', '.parquet'
])
// Only source-like files are ever read into a prompt; names that look like secrets never are.
const READABLE = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.rs', '.java', '.kt', '.rb', '.php', '.cs', '.vue', '.svelte', '.css', '.scss', '.sql', '.md', '.yml', '.yaml', '.toml'])
const SECRET_NAME = /secret|token|credential|password|passwd|private|\.env|\.pem$|\.key$|service[-_]?account/i
/** Files that tell a coding agent how this repo wants to be worked on */
const AGENT_RULES = /^(code_agent_rules|agents|claude|gemini|conventions|contributing)\.md$|^\.cursorrules$/i
const CATALOGS = ['INDEX.md', 'index.md', 'CATALOG.md', 'README.md']

interface ScanStats { files: number; dirs: number }

function scanDir(dirPath: string, basePath: string, depth: number, maxDepth: number, stats: ScanStats, maxFiles: number): RepoFileNode[] {
  if (depth > maxDepth || stats.files >= maxFiles) return []
  let entries: fs.Dirent[] = []
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
  // Files of this level are indexed before descending, so a huge sub-folder can't
  // eat the file budget and hide root files (README, INDEX.md, manifests).
  entries.sort((a, b) => Number(a.isDirectory()) - Number(b.isDirectory()) || a.name.localeCompare(b.name))

  const nodes: RepoFileNode[] = []
  for (const entry of entries) {
    if (stats.files >= maxFiles) break
    const name = entry.name
    if (name.startsWith('.') && !VISIBLE_DOTFILES.has(name)) continue
    const fullPath = path.join(dirPath, name)
    const relPath = path.relative(basePath, fullPath).replace(/\\/g, '/')

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(name.toLowerCase())) continue
      stats.dirs++
      nodes.push({ name, path: relPath, type: 'directory', children: scanDir(fullPath, basePath, depth + 1, maxDepth, stats, maxFiles) })
    } else if (entry.isFile()) {
      const ext = path.extname(name).toLowerCase()
      if (IGNORED_FILES.has(name.toLowerCase()) || BINARY_EXTENSIONS.has(ext)) continue
      stats.files++
      let size = 0
      try { size = fs.statSync(fullPath).size } catch { /* vanished mid-scan */ }
      nodes.push({ name, path: relPath, type: 'file', extension: ext, size })
    }
  }
  // display order stays directories first
  return nodes.sort((a, b) => Number(b.type === 'directory') - Number(a.type === 'directory'))
}

const flatten = (nodes: RepoFileNode[]): string[] =>
  nodes.flatMap((n) => (n.type === 'file' ? [n.path] : flatten(n.children ?? [])))

const readText = (file: string, maxChars: number) => {
  try {
    return fs.readFileSync(file, 'utf-8').slice(0, maxChars)
  } catch {
    return ''
  }
}

const JS_STACK: [string, string][] = [
  ['typescript', 'TypeScript'], ['react', 'React'], ['next', 'Next.js'], ['vue', 'Vue.js'], ['@angular/core', 'Angular'],
  ['svelte', 'Svelte'], ['tailwindcss', 'Tailwind CSS'], ['@reduxjs/toolkit', 'Redux Toolkit'], ['zustand', 'Zustand'],
  ['@tanstack/react-query', 'React Query'], ['express', 'Express'], ['fastify', 'Fastify'], ['@nestjs/core', 'NestJS'],
  ['vite', 'Vite'], ['prisma', 'Prisma'], ['mongoose', 'MongoDB'], ['socket.io', 'Socket.IO']
]
const PY_STACK: [string, string][] = [
  ['fastapi', 'FastAPI'], ['django', 'Django'], ['flask', 'Flask'], ['sqlalchemy', 'SQLAlchemy'], ['pydantic', 'Pydantic'],
  ['langchain', 'LangChain'], ['langgraph', 'LangGraph'], ['torch', 'PyTorch'], ['tensorflow', 'TensorFlow'],
  ['redis', 'Redis'], ['celery', 'Celery'], ['apscheduler', 'APScheduler'], ['uvicorn', 'Uvicorn']
]
const OTHER_MANIFESTS: [string, string][] = [
  ['go.mod', 'Go'], ['cargo.toml', 'Rust'], ['pom.xml', 'Java/Kotlin'], ['build.gradle', 'Java/Kotlin'],
  ['build.gradle.kts', 'Java/Kotlin'], ['dockerfile', 'Docker'], ['docker-compose.yml', 'Docker']
]

/** Stack + manifests from the root and one level down (monorepos keep frontend/ and backend/ apart). */
function detectStack(root: string, files: string[]) {
  const stack = new Set<string>()
  const deps: string[] = []
  const manifests: string[] = []
  const shallow = files.filter((f) => f.split('/').length <= 2)

  for (const rel of shallow.filter((f) => path.basename(f) === 'package.json')) {
    try {
      const pkg = JSON.parse(readText(path.join(root, rel), 200_000))
      const all = { ...pkg.dependencies, ...pkg.devDependencies }
      stack.add('Node.js')
      JS_STACK.forEach(([dep, label]) => all[dep] && stack.add(label))
      deps.push(...Object.keys(pkg.dependencies ?? {}))
      const scripts = Object.entries<string>(pkg.scripts ?? {}).map(([k, v]) => `${k}: ${v}`).slice(0, 12)
      manifests.push(`${rel} (${pkg.name ?? 'unnamed'})${scripts.length ? ` — scripts: ${scripts.join(' | ')}` : ''}`)
    } catch { /* malformed manifest */ }
  }
  for (const rel of shallow.filter((f) => /^(requirements\.txt|pyproject\.toml|pipfile)$/i.test(path.basename(f)))) {
    const text = readText(path.join(root, rel), 50_000).toLowerCase()
    stack.add('Python')
    PY_STACK.forEach(([dep, label]) => text.includes(dep) && stack.add(label))
    manifests.push(rel)
  }
  for (const rel of shallow) {
    const hit = OTHER_MANIFESTS.find(([name]) => path.basename(rel).toLowerCase() === name)
    if (hit) stack.add(hit[1])
  }
  return { techStack: [...stack], keyDependencies: [...new Set(deps)].slice(0, 15), manifestSummary: manifests.join('\n') }
}

// ─── Index (cached — prompts ask for it on every message) ───
interface RepoIndex { info: RepoInfo; files: string[]; at: number }
const indexCache = new Map<string, RepoIndex>()
const INDEX_TTL = 5 * 60_000

export function indexRepo(root: string, fresh = false): RepoIndex {
  const cached = indexCache.get(root)
  if (cached && !fresh && Date.now() - cached.at < INDEX_TTL) return cached

  const stats: ScanStats = { files: 0, dirs: 0 }
  const tree = scanDir(root, root, 0, 6, stats, 2500)
  const files = flatten(tree)
  const readmeFile = files.find((f) => /^readme(\.md|\.txt)?$/i.test(f))
  const { techStack, keyDependencies, manifestSummary } = detectStack(root, files)
  const index: RepoIndex = {
    files,
    at: Date.now(),
    info: {
      rootPath: root,
      name: path.basename(root),
      totalFiles: stats.files,
      totalDirectories: stats.dirs,
      techStack: techStack.length ? techStack : ['Codebase'],
      keyDependencies,
      manifestSummary,
      readmeSummary: readmeFile ? readText(path.join(root, readmeFile), 6000).split('\n').slice(0, 150).join('\n').trim() : undefined,
      treePreview: tree,
      catalog: CATALOGS.find((c) => fs.existsSync(path.join(root, c))),
      skillCount: files.filter((f) => /(^|\/)SKILL\.md$/i.test(f)).length
    }
  }
  indexCache.set(root, index)
  return index
}

// ─── Model context ──────────────────────────────────────────
const queryTerms = (q: string) => [...new Set(q.toLowerCase().match(/[a-z0-9_]{4,}/g) ?? [])]

/** Paths ranked by how many question/meeting terms they contain (file name hits count double). */
function relevantFiles(files: string[], query: string, limit: number) {
  const q = queryTerms(query)
  if (!q.length) return []
  return files
    .map((f) => {
      const lower = f.toLowerCase()
      const base = path.basename(lower)
      return { f, score: q.reduce((s, t) => s + (base.includes(t) ? 2 : lower.includes(t) ? 1 : 0), 0) }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.f.length - b.f.length)
    .slice(0, limit)
    .map((x) => x.f)
}

function directoryIndex(files: string[], maxChars: number) {
  const byDir = new Map<string, string[]>()
  for (const f of files) {
    const dir = path.posix.dirname(f)
    byDir.set(dir, [...(byDir.get(dir) ?? []), path.posix.basename(f)])
  }
  const lines: string[] = []
  let used = 0
  for (const [dir, names] of [...byDir].sort(([a], [b]) => a.localeCompare(b))) {
    const line = `${dir === '.' ? '(root)' : `${dir}/`} (${names.length}): ${names.join(', ')}`.slice(0, 260)
    if (used + line.length > maxChars) {
      lines.push(`… ${byDir.size - lines.length} more directories`)
      break
    }
    lines.push(line)
    used += line.length + 1
  }
  return lines.join('\n')
}

/**
 * What the model sees of a repository, sized to `budget` chars. The company repo
 * gets stack, scripts, agent rules, the files most related to the question and a
 * directory index; the skill vault gets its catalog (INDEX.md) and top level.
 */
export function repoContext(root: string, role: 'company' | 'vault', budget: number, query: string): ContextBlock | null {
  if (!root || !fs.existsSync(root)) return null
  const { info, files } = indexRepo(root)
  const out: string[] = []
  const add = (text: string, max: number) => {
    const room = Math.min(max, budget - out.join('\n').length)
    if (room > 200 && text) out.push(text.length > room ? `${text.slice(0, room)}\n…(trimmed)` : text)
  }

  if (role === 'vault') {
    out.push(`Path: ${root}`, `Skill files found: ${info.skillCount}`)
    if (info.catalog) add(`CATALOG (${info.catalog}):\n${readText(path.join(root, info.catalog), budget)}`, budget * 0.85)
    add(`TOP LEVEL:\n${directoryIndex(files.filter((f) => f.split('/').length <= 2), budget)}`, budget * 0.15)
    return { title: `SKILL VAULT — ${info.name}`, text: out.join('\n') }
  }

  out.push(`Path: ${root}`, `Stack: ${info.techStack.join(', ')}`)
  if (info.manifestSummary) add(`Manifests:\n${info.manifestSummary}`, budget * 0.12)
  for (const rel of files.filter((f) => AGENT_RULES.test(path.basename(f)) && f.split('/').length <= 2)) {
    add(`AGENT RULES (${rel}):\n${readText(path.join(root, rel), budget)}`, budget * 0.15)
  }
  if (info.readmeSummary) add(`README (excerpt):\n${info.readmeSummary}`, budget * 0.1)

  const relevant = relevantFiles(files, query, 15)
  if (relevant.length) {
    add(`FILES MOST RELATED TO THIS TASK:\n${relevant.map((f) => `- ${f}`).join('\n')}`, budget * 0.08)
    // big-context providers also get the opening of the top matches
    if (budget >= 40_000) {
      for (const rel of relevant.filter((f) => READABLE.has(path.extname(f).toLowerCase()) && !SECRET_NAME.test(f)).slice(0, 6)) {
        add(`--- ${rel} (opening) ---\n${readText(path.join(root, rel), 5000)}`, budget * 0.08)
      }
    }
  }
  add(`DIRECTORY INDEX (directory → files):\n${directoryIndex(files, budget)}`, budget)
  return { title: `COMPANY REPOSITORY — ${info.name}`, text: out.join('\n') }
}

export function registerRepoHandlers() {
  ipcMain.handle('repo:select-folder', async (_e, title?: string): Promise<IpcResult<string>> => {
    try {
      const res = await dialog.showOpenDialog({ title: title ?? 'Select repository folder', properties: ['openDirectory'] })
      if (res.canceled || !res.filePaths.length) return { success: false, error: 'Cancelled' }
      return { success: true, data: res.filePaths[0] }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to open directory picker' }
    }
  })

  ipcMain.handle('repo:scan-folder', (_e, folderPath: string): IpcResult<RepoInfo> => {
    try {
      if (!folderPath || !fs.existsSync(folderPath)) return { success: false, error: 'Directory does not exist' }
      return { success: true, data: indexRepo(folderPath, true).info }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to scan repository' }
    }
  })

  // Repo Intel "compile": meeting × company repo → structured directive + coding prompt
  ipcMain.handle('repo:synthesize', async (e, args: { meetingId?: string; transcript?: string; meetingTitle?: string }): Promise<IpcResult<RepoSynthesisResult>> => {
    try {
      const settings = getSettings()
      if (!settings.companyRepoPath) return { success: false, error: 'No repository attached. Select your company repo folder first.' }
      const t = llmTarget(settings)
      const budget = PROVIDERS[t.provider].budget
      const meeting = args.meetingId ? getMeeting(args.meetingId) : null
      const switchModel = modelSwitcher(e.sender, t.provider)
      const onSwitch = (m: string) => { t.model = m; switchModel(m) }
      const material = meeting
        ? (await withModelFallback(t, (target) => meetingMaterial(meeting, target, budget), onSwitch)).text
        : (args.transcript ?? '').slice(0, budget * 0.6)
      if (!material.trim()) return { success: false, error: 'Meeting transcript is empty. Record a meeting or paste notes first.' }

      const company = repoContext(settings.companyRepoPath, 'company', budget * 0.3, material.slice(0, 4000))
      const vault = repoContext(settings.referenceRepoPath, 'vault', budget * 0.15, material.slice(0, 4000))
      const system = `You are a Principal Software Architect bridging an engineering meeting and an existing codebase.
Return ONLY one JSON object — no markdown fences, no prose:
{
  "mainGoal": "1-2 crisp sentences: exactly what has to be done",
  "executiveSummary": "the problem, why the change is needed, and the approach",
  "affectedFiles": [{"path": "relative path from the repository index, or a proposed new path", "action": "MODIFY|CREATE|DELETE|REFERENCE", "reason": "why, based on the meeting"}],
  "keyDecisionsAndConstraints": ["decisions, constraints, explicitly avoided approaches"],
  "stepByStepPlan": ["ordered, actionable steps mapped to the codebase"],
  "suggestedBranchName": "feat/... or fix/...",
  "cursorPrompt": "sections 2+ of a production-grade prompt for Cursor / Claude Code / Codex: mission, meeting context, skills to load (exact vault paths if a vault is given), codebase map, plan, expected result on screen, acceptance criteria with verification commands, rules"
}
Use only paths that exist in the repository index unless marked CREATE. Meetings may mix Hindi and English; write English.

=== ${company?.title ?? 'COMPANY REPOSITORY'} ===
${company?.text ?? ''}
${vault ? `\n=== ${vault.title} ===\n${vault.text}` : ''}`

      const parsed = await withModelFallback(t, (target) => completeJson<Record<string, any>>(target, [
        { role: 'system', content: system },
        { role: 'user', content: `Meeting: ${meeting?.title ?? args.meetingTitle ?? 'Engineering discussion'}\n${material}` }
      ], { maxTokens: 4096 }), onSwitch)

      const info = indexRepo(settings.companyRepoPath).info
      const source = meeting ?? { title: args.meetingTitle ?? 'Pasted notes', date: new Date().toISOString() }
      const header = toolPromptHeader('cursor', source, settings, vault ? indexRepo(settings.referenceRepoPath).info.catalog : undefined)
      const list = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : [])
      return {
        success: true,
        data: {
          id: `synth-${Date.now()}`,
          mainGoal: parsed.mainGoal || 'Implement the changes agreed in the meeting',
          executiveSummary: parsed.executiveSummary || '',
          repoPath: stylePath(settings.companyRepoPath, settings.promptPathStyle),
          repoName: info.name,
          meetingTitle: meeting?.title ?? args.meetingTitle,
          meetingId: args.meetingId,
          affectedFiles: list(parsed.affectedFiles),
          keyDecisionsAndConstraints: list(parsed.keyDecisionsAndConstraints),
          stepByStepPlan: list(parsed.stepByStepPlan),
          cursorPrompt: [header, parsed.cursorPrompt || ''].filter(Boolean).join('\n'),
          suggestedBranchName: parsed.suggestedBranchName || 'feat/meeting-implementation',
          timestamp: Date.now()
        }
      }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to synthesize repository directive' }
    }
  })
}
