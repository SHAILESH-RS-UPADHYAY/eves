import { ipcMain, dialog } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import Groq from 'groq-sdk'
import type { RepoInfo, RepoFileNode, RepoSynthesisResult, IpcResult } from '../../src/types'

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  '.turbo',
  'target',
  'bin',
  'obj',
  '.idea',
  '.vscode',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  'env',
  '.cache',
  'coverage',
  '.output'
])

const IGNORED_FILES = new Set([
  '.DS_Store',
  'thumbs.db',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb'
])

const BINARY_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.svg', '.webp', '.pdf', '.zip', '.tar', '.gz', '.mp3', '.wav', '.ogg',
  '.mp4', '.mov', '.avi', '.ttf', '.woff', '.woff2', '.eot', '.pyc', '.class'
])

interface ScanStats {
  files: number
  dirs: number
}

function scanDir(
  dirPath: string,
  basePath: string,
  depth: number,
  maxDepth: number,
  stats: ScanStats,
  maxFiles: number
): RepoFileNode[] {
  if (depth > maxDepth || stats.files >= maxFiles) return []

  let entries: fs.Dirent[] = []
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }

  const nodes: RepoFileNode[] = []

  // Sort directories first, then alphabetical
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of entries) {
    if (stats.files >= maxFiles) break

    const name = entry.name
    if (name.startsWith('.') && name !== '.env.example') continue

    const fullPath = path.join(dirPath, name)
    const relPath = path.relative(basePath, fullPath).replace(/\\/g, '/')

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(name.toLowerCase())) continue

      stats.dirs++
      const children = scanDir(fullPath, basePath, depth + 1, maxDepth, stats, maxFiles)
      nodes.push({
        name,
        path: relPath,
        type: 'directory',
        children
      })
    } else if (entry.isFile()) {
      if (IGNORED_FILES.has(name.toLowerCase())) continue
      const ext = path.extname(name).toLowerCase()
      if (BINARY_EXTENSIONS.has(ext)) continue

      stats.files++
      let size = 0
      try {
        size = fs.statSync(fullPath).size
      } catch {}

      nodes.push({
        name,
        path: relPath,
        type: 'file',
        extension: ext,
        size
      })
    }
  }

  return nodes
}

function detectTechStack(rootPath: string): { techStack: string[]; keyDependencies: string[]; manifestSummary: string } {
  const stack: Set<string> = new Set()
  const keyDeps: string[] = []
  let manifestSummary = ''

  // 1. Node / JS / TS ecosystem
  const pkgPath = path.join(rootPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    stack.add('Node.js')
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
      const depNames = Object.keys(allDeps)

      if (allDeps['typescript'] || fs.existsSync(path.join(rootPath, 'tsconfig.json'))) stack.add('TypeScript')
      if (allDeps['react'] || allDeps['react-dom']) stack.add('React')
      if (allDeps['next']) stack.add('Next.js')
      if (allDeps['electron']) stack.add('Electron')
      if (allDeps['vue']) stack.add('Vue.js')
      if (allDeps['@angular/core']) stack.add('Angular')
      if (allDeps['svelte']) stack.add('Svelte')
      if (allDeps['tailwindcss']) stack.add('Tailwind CSS')
      if (allDeps['express'] || allDeps['fastify'] || allDeps['koa'] || allDeps['@nestjs/core']) stack.add('Backend API')
      if (allDeps['zustand'] || allDeps['redux'] || allDeps['@reduxjs/toolkit']) stack.add('State Management')
      if (allDeps['vite'] || allDeps['electron-vite']) stack.add('Vite')

      keyDeps.push(...depNames.slice(0, 15))
      manifestSummary = `Project: ${pkg.name || 'unnamed'} v${pkg.version || '1.0.0'} | Scripts: ${Object.keys(pkg.scripts || {}).join(', ')} | Main Deps: ${keyDeps.slice(0, 8).join(', ')}`
    } catch {}
  }

  // 2. Python ecosystem
  if (fs.existsSync(path.join(rootPath, 'requirements.txt')) || fs.existsSync(path.join(rootPath, 'pyproject.toml')) || fs.existsSync(path.join(rootPath, 'Pipfile'))) {
    stack.add('Python')
    try {
      if (fs.existsSync(path.join(rootPath, 'requirements.txt'))) {
        const content = fs.readFileSync(path.join(rootPath, 'requirements.txt'), 'utf-8')
        if (content.includes('fastapi')) stack.add('FastAPI')
        if (content.includes('django')) stack.add('Django')
        if (content.includes('flask')) stack.add('Flask')
        if (content.includes('pytorch') || content.includes('torch')) stack.add('PyTorch')
        if (content.includes('tensorflow')) stack.add('TensorFlow')
      }
    } catch {}
  }

  // 3. Go
  if (fs.existsSync(path.join(rootPath, 'go.mod'))) {
    stack.add('Go')
  }

  // 4. Rust
  if (fs.existsSync(path.join(rootPath, 'Cargo.toml'))) {
    stack.add('Rust')
  }

  // 5. Java / Kotlin
  if (fs.existsSync(path.join(rootPath, 'pom.xml')) || fs.existsSync(path.join(rootPath, 'build.gradle')) || fs.existsSync(path.join(rootPath, 'build.gradle.kts'))) {
    stack.add('Java/Kotlin')
  }

  // 6. Docker / Infra
  if (fs.existsSync(path.join(rootPath, 'Dockerfile')) || fs.existsSync(path.join(rootPath, 'docker-compose.yml'))) {
    stack.add('Docker')
  }

  return {
    techStack: Array.from(stack),
    keyDependencies: keyDeps,
    manifestSummary
  }
}

function readReadmeSummary(rootPath: string): string | undefined {
  const possibleNames = ['README.md', 'readme.md', 'README.txt', 'README']
  for (const name of possibleNames) {
    const p = path.join(rootPath, name)
    if (fs.existsSync(p)) {
      try {
        const lines = fs.readFileSync(p, 'utf-8').split('\n').slice(0, 150)
        return lines.join('\n').trim()
      } catch {}
    }
  }
  return undefined
}

function formatTreeForPrompt(nodes: RepoFileNode[], indent = ''): string {
  let result = ''
  for (const node of nodes) {
    if (node.type === 'directory') {
      result += `${indent}📁 ${node.name}/\n`
      if (node.children && node.children.length > 0) {
        result += formatTreeForPrompt(node.children, indent + '  ')
      }
    } else {
      result += `${indent}📄 ${node.name}\n`
    }
  }
  return result
}

export function registerRepoHandlers() {
  // 1. Select Folder via Native Dialog
  ipcMain.handle('repo:select-folder', async (): Promise<IpcResult<string>> => {
    try {
      const res = await dialog.showOpenDialog({
        title: 'Select Repository Folder to Attach',
        properties: ['openDirectory']
      })

      if (res.canceled || res.filePaths.length === 0) {
        return { success: false, error: 'Cancelled' }
      }

      return { success: true, data: res.filePaths[0] }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to open directory picker' }
    }
  })

  // 2. Scan Folder
  ipcMain.handle('repo:scan-folder', async (_e, folderPath: string): Promise<IpcResult<RepoInfo>> => {
    try {
      if (!folderPath || !fs.existsSync(folderPath)) {
        return { success: false, error: 'Directory does not exist' }
      }

      const stats: ScanStats = { files: 0, dirs: 0 }
      const tree = scanDir(folderPath, folderPath, 0, 4, stats, 300)
      const { techStack, keyDependencies, manifestSummary } = detectTechStack(folderPath)
      const readme = readReadmeSummary(folderPath)

      const repoInfo: RepoInfo = {
        rootPath: folderPath,
        name: path.basename(folderPath),
        totalFiles: stats.files,
        totalDirectories: stats.dirs,
        techStack: techStack.length > 0 ? techStack : ['Codebase'],
        keyDependencies,
        manifestSummary,
        readmeSummary: readme,
        treePreview: tree
      }

      return { success: true, data: repoInfo }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to scan repository' }
    }
  })

  // 3. Synthesize Directive & Cursor Prompt
  ipcMain.handle(
    'repo:synthesize',
    async (
      _e,
      args: {
        repoInfo: RepoInfo
        transcript: string
        meetingTitle?: string
        meetingId?: string
        apiKey: string
      }
    ): Promise<IpcResult<RepoSynthesisResult>> => {
      const { repoInfo, transcript, meetingTitle, meetingId, apiKey } = args

      if (!apiKey) {
        return { success: false, error: 'No Groq API key configured. Please enter it in Settings.' }
      }
      if (!transcript || transcript.trim().length === 0) {
        return { success: false, error: 'Meeting transcript is empty. Record a meeting or provide meeting context first.' }
      }
      if (!repoInfo || !repoInfo.rootPath) {
        return { success: false, error: 'No repository folder attached. Please select a codebase folder.' }
      }

      try {
        const groq = new Groq({ apiKey })
        const treeStr = formatTreeForPrompt(repoInfo.treePreview.slice(0, 80))

        const systemPrompt = `You are a Principal Software Architect and Lead Engineering Director.
You are bridging the gap between a high-context engineering meeting and an existing codebase.

You will be provided:
1. REPOSITORY ARCHITECTURE:
   - Root Path: ${repoInfo.rootPath}
   - Project Name: ${repoInfo.name}
   - Detected Tech Stack: ${repoInfo.techStack.join(', ')}
   - Manifest Summary: ${repoInfo.manifestSummary || 'N/A'}
   - File Tree Preview:
${treeStr}

2. MEETING TRANSCRIPT: What the team discussed, architecture decisions, constraints, and instructions.

YOUR TASK:
Analyze the meeting transcript against this actual repository structure.
Return ONLY a valid JSON object matching the schema below. Do NOT output any markdown fences, backticks, or preamble text.

SCHEMA:
{
  "mainGoal": string (1-2 crisp sentences stating the core mission / "Krna kya hai"),
  "executiveSummary": string (Clear explanation of the technical problem, why this change is needed, and the architectural approach),
  "affectedFiles": [
    {
      "path": string (relative path matching the repo tree or newly proposed path),
      "action": "MODIFY" | "CREATE" | "DELETE" | "REFERENCE",
      "reason": string (why this file is affected based on the meeting discussion)
    }
  ],
  "keyDecisionsAndConstraints": [
    string (specific technical decisions made, constraints, or explicitly avoided approaches)
  ],
  "stepByStepPlan": [
    string (ordered, actionable execution steps mapped to the codebase)
  ],
  "suggestedBranchName": string (e.g. "feat/...", "fix/..."),
  "cursorPrompt": string (A production-grade, authoritative prompt designed to be pasted directly into Cursor Composer, Claude Code, or Copilot. It must specify the codebase context, exact files to edit/create, architectural constraints, instructions, and acceptance criteria so the AI coding tool implements it right on the first attempt without hallucinating)
}`

        const userPrompt = `Meeting Title: ${meetingTitle || 'Engineering Discussion'}
Transcript:
${transcript.slice(0, 18000)}`

        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-70b-versatile',
          max_tokens: 4096,
          temperature: 0.15,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })

        const content = completion.choices?.[0]?.message?.content
        if (!content) {
          return { success: false, error: 'Groq returned empty synthesis' }
        }

        let parsed: any
        try {
          parsed = JSON.parse(content)
        } catch {
          return { success: false, error: 'Failed to parse model synthesis into structured JSON' }
        }

        const result: RepoSynthesisResult = {
          id: `synth-${Date.now()}`,
          mainGoal: parsed.mainGoal || 'Implement required architectural changes',
          executiveSummary: parsed.executiveSummary || '',
          repoPath: repoInfo.rootPath,
          repoName: repoInfo.name,
          meetingTitle,
          meetingId,
          affectedFiles: Array.isArray(parsed.affectedFiles) ? parsed.affectedFiles : [],
          keyDecisionsAndConstraints: Array.isArray(parsed.keyDecisionsAndConstraints) ? parsed.keyDecisionsAndConstraints : [],
          stepByStepPlan: Array.isArray(parsed.stepByStepPlan) ? parsed.stepByStepPlan : [],
          cursorPrompt: parsed.cursorPrompt || '',
          suggestedBranchName: parsed.suggestedBranchName || 'feat/meeting-implementation',
          timestamp: Date.now()
        }

        return { success: true, data: result }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Failed to synthesize repository directive' }
      }
    }
  )
}
