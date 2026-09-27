import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderGit2,
  FolderOpen,
  RefreshCw,
  Zap,
  Sparkles,
  Copy,
  Check,
  FileCode,
  FilePlus,
  FileMinus,
  FileSearch,
  CheckCircle2,
  Terminal,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Download,
  Layers,
  Cpu,
  SlidersHorizontal
} from 'lucide-react'
import { SectionDivider, ExpandableCard } from '../hacker/CyberKit'
import { CyberArt } from '../hacker/CyberArt'
import { useRepoStore } from '../../store/repo.store'
import { useMeetingsStore } from '../../store/meetings.store'
import { useSettingsStore } from '../../store/settings.store'
import { useUIStore } from '../../store/ui.store'
import { useRepoLink } from '../../hooks/useRepoLink'
import { RepoSlot } from './RepoSlot'
import { PROVIDERS, activeProvider } from '../../lib/providers'
import type { RepoFileNode, AffectedFile } from '../../types'

const mono = '"Courier New", Consolas, monospace'
const C = {
  cyan: '#22d3ee',
  green: '#7ee787',
  red: '#ff5370',
  yellow: '#ffcb6b',
  blue: '#61afef',
  purple: '#c678dd',
  fg: '#abb2bf',
  bgCard: 'rgba(13, 17, 23, 0.7)',
  border: 'rgba(0, 245, 255, 0.12)'
}

function FileTreeNode({ node, depth = 0 }: { node: RepoFileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth === 0)
  const isDir = node.type === 'directory'

  return (
    <div style={{ marginLeft: depth * 12, fontFamily: mono, fontSize: '11px' }}>
      <div
        onClick={() => isDir && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 6px',
          borderRadius: '4px',
          cursor: isDir ? 'pointer' : 'default',
          color: isDir ? C.cyan : 'rgba(255,255,255,0.7)',
          background: 'transparent',
          userSelect: 'none'
        }}
        className="hover:bg-white/5"
      >
        {isDir ? (
          <>
            {isOpen ? <ChevronDown size={12} style={{ color: C.cyan }} /> : <ChevronRight size={12} style={{ color: C.cyan }} />}
            <FolderGit2 size={13} style={{ color: C.cyan }} />
            <span style={{ fontWeight: 600 }}>{node.name}</span>
          </>
        ) : (
          <>
            <span style={{ width: '12px' }} />
            <FileCode size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span>{node.name}</span>
            {node.size ? (
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
                {Math.round(node.size / 1024)}kb
              </span>
            ) : null}
          </>
        )}
      </div>

      {isDir && isOpen && node.children && (
        <div style={{ borderLeft: '1px solid rgba(0, 245, 255, 0.08)', marginLeft: '6px' }}>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function ActionBadge({ action }: { action: AffectedFile['action'] }) {
  const cfg = {
    MODIFY: { color: C.yellow, icon: FileCode, bg: 'rgba(255, 203, 107, 0.12)', border: 'rgba(255, 203, 107, 0.3)' },
    CREATE: { color: C.green, icon: FilePlus, bg: 'rgba(126, 231, 135, 0.12)', border: 'rgba(126, 231, 135, 0.3)' },
    DELETE: { color: C.red, icon: FileMinus, bg: 'rgba(255, 83, 112, 0.12)', border: 'rgba(255, 83, 112, 0.3)' },
    REFERENCE: { color: C.blue, icon: FileSearch, bg: 'rgba(97, 175, 239, 0.12)', border: 'rgba(97, 175, 239, 0.3)' }
  }[action] || { color: C.cyan, icon: FileCode, bg: 'rgba(34, 211, 238, 0.12)', border: 'rgba(34, 211, 238, 0.3)' }

  const Icon = cfg.icon

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 7px',
        borderRadius: '4px',
        fontSize: '9px',
        fontWeight: 700,
        fontFamily: mono,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        letterSpacing: '0.5px'
      }}
    >
      <Icon size={10} />
      {action}
    </span>
  )
}

export function RepoIntelPage() {
  const {
    selectedMeetingId,
    customTranscript,
    isSynthesizing,
    synthesisResult,
    setSelectedMeetingId,
    setCustomTranscript,
    setSynthesizing,
    setSynthesisResult
  } = useRepoStore()
  const company = useRepoLink('company')
  const attachedRepoPath = company.path
  const repoInfo = company.info
  const isScanning = company.scanning

  const meetings = useMeetingsStore((s) => s.meetings)
  const settings = useSettingsStore((s) => s.settings)
  const addToast = useUIStore((s) => s.addToast)
  const removeToast = useUIStore((s) => s.removeToast)

  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedBranch, setCopiedBranch] = useState(false)
  const [useCustomInput, setUseCustomInput] = useState(false)

  // Active meeting resolution
  const activeMeeting = useMemo(() => {
    if (selectedMeetingId) {
      return meetings.find((m) => m.id === selectedMeetingId)
    }
    // Default to the latest meeting with transcript
    return meetings.find((m) => m.transcription?.transcript && m.transcription.transcript.trim().length > 0)
  }, [meetings, selectedMeetingId])

  const effectiveTranscript = useMemo(() => {
    if (useCustomInput) return customTranscript
    return activeMeeting?.transcription?.transcript || ''
  }, [useCustomInput, customTranscript, activeMeeting])

  const handleSelectFolder = company.attach
  const handleRefreshScan = company.rescan

  // Synthesis: main reads the meeting (condensing long ones), the repo index and the skill vault
  const handleSynthesize = async () => {
    const brain = activeProvider(settings)
    if (!brain) {
      addToast({ type: 'error', title: 'AI key required', message: 'Add a Groq, Gemini or OpenAI key in Settings → API Keys' })
      return
    }
    if (!attachedRepoPath) {
      addToast({ type: 'error', title: 'No Repository Attached', message: 'Attach your company repo folder first' })
      return
    }
    if (!effectiveTranscript.trim()) {
      addToast({ type: 'error', title: 'No Transcript Context', message: 'Select a recorded meeting or paste meeting notes' })
      return
    }

    setSynthesizing(true)
    const toast = addToast({
      type: 'loading',
      title: 'Synthesizing Architecture & Meeting...',
      message: `Mapping the meeting onto repository modules with ${PROVIDERS[brain].label} · ${settings.aiModels[brain]}`
    })
    try {
      const res = await window.eves?.synthesizeRepoDirective(useCustomInput
        ? { transcript: effectiveTranscript, meetingTitle: 'Pasted notes' }
        : { meetingId: activeMeeting?.id, meetingTitle: activeMeeting?.title })
      if (res?.success && res.data) {
        setSynthesisResult(res.data)
        addToast({ type: 'success', title: 'Directive Synthesized!', message: `${res.data.affectedFiles.length} files targeted • prompt ready` })
      } else {
        addToast({ type: 'error', title: 'Synthesis Failed', message: res?.error || 'Unknown error during inference', duration: 8000 })
      }
    } finally {
      removeToast(toast)
      setSynthesizing(false)
    }
  }

  // Copy Prompt
  const handleCopyPrompt = () => {
    if (!synthesisResult?.cursorPrompt) return
    navigator.clipboard.writeText(synthesisResult.cursorPrompt)
    setCopiedPrompt(true)
    addToast({ type: 'success', title: 'Prompt Copied!', message: 'Paste directly into Cursor Composer or Claude' })
    setTimeout(() => setCopiedPrompt(false), 2500)
  }

  // Copy Branch Name
  const handleCopyBranch = () => {
    if (!synthesisResult?.suggestedBranchName) return
    const cmd = `git checkout -b ${synthesisResult.suggestedBranchName}`
    navigator.clipboard.writeText(cmd)
    setCopiedBranch(true)
    addToast({ type: 'info', title: 'Command Copied', message: cmd })
    setTimeout(() => setCopiedBranch(false), 2000)
  }

  // Export as Markdown File
  const handleExportMarkdown = () => {
    if (!synthesisResult) return
    const mdContent = `# REPO DIRECTIVE: ${synthesisResult.mainGoal}
**Repository**: \`${synthesisResult.repoName}\` (${synthesisResult.repoPath})  
**Meeting**: ${synthesisResult.meetingTitle || 'Recorded Session'}  
**Generated At**: ${new Date(synthesisResult.timestamp).toLocaleString()}  
**Suggested Branch**: \`${synthesisResult.suggestedBranchName || 'feat/meeting-impl'}\`

---

## Executive Summary
${synthesisResult.executiveSummary}

---

## Affected Files
| Action | File Path | Rationale |
|:---|:---|:---|
${synthesisResult.affectedFiles.map((f) => `| **${f.action}** | \`${f.path}\` | ${f.reason} |`).join('\n')}

---

## Key Decisions & Constraints
${synthesisResult.keyDecisionsAndConstraints.map((c) => `- ${c}`).join('\n')}

---

## Step-by-Step Execution Plan
${synthesisResult.stepByStepPlan.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

---

## Cursor / AI Coding Prompt
\`\`\`markdown
${synthesisResult.cursorPrompt}
\`\`\`
`

    const blob = new Blob([mdContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `directive-${synthesisResult.repoName}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    addToast({ type: 'success', title: 'Exported', message: 'Directive markdown file downloaded' })
  }

  return (
    <motion.div
      className="glass-scrollbar"
      style={{ padding: '18px 28px 48px', height: '100%', overflow: 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ─── Header & Main Action Button ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '320px' }}>
          <SectionDivider
            label="REPO_INTEL // CONTEXT_TO_CODE SYNTHESIZER"
            color={C.cyan}
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: mono, fontSize: '10px' }}>
                <span style={{ color: attachedRepoPath ? C.green : 'rgba(255,255,255,0.3)' }}>
                  {attachedRepoPath ? `REPO: ${repoInfo?.name || 'LINKED'}` : 'NO REPO LINKED'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <span style={{ color: effectiveTranscript ? C.cyan : 'rgba(255,255,255,0.3)' }}>
                  {effectiveTranscript ? 'TRANSCRIPT LOADED' : 'AWAITING TRANSCRIPT'}
                </span>
              </div>
            }
          />
        </div>

        {/* ⚡ High-tech Action Trigger Button */}
        <motion.button
          onClick={handleSynthesize}
          disabled={isSynthesizing || !attachedRepoPath || !effectiveTranscript}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 22px',
            borderRadius: '8px',
            background: isSynthesizing
              ? 'rgba(34, 211, 238, 0.15)'
              : (!attachedRepoPath || !effectiveTranscript)
              ? 'rgba(255,255,255,0.04)'
              : 'linear-gradient(135deg, rgba(34,211,238,0.25) 0%, rgba(126,231,135,0.25) 100%)',
            border: (!attachedRepoPath || !effectiveTranscript)
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0, 245, 255, 0.5)',
            boxShadow: (!attachedRepoPath || !effectiveTranscript)
              ? 'none'
              : '0 0 20px rgba(0, 245, 255, 0.25), inset 0 0 12px rgba(126, 231, 135, 0.2)',
            color: (!attachedRepoPath || !effectiveTranscript) ? 'rgba(255,255,255,0.3)' : '#fff',
            cursor: (!attachedRepoPath || !effectiveTranscript || isSynthesizing) ? 'not-allowed' : 'pointer',
            fontFamily: mono,
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '1px',
            position: 'relative',
            overflow: 'hidden',
            textShadow: '0 0 8px rgba(0,245,255,0.6)'
          }}
          whileHover={attachedRepoPath && effectiveTranscript && !isSynthesizing ? { scale: 1.03, boxShadow: '0 0 28px rgba(0,245,255,0.45)' } : {}}
          whileTap={attachedRepoPath && effectiveTranscript && !isSynthesizing ? { scale: 0.97 } : {}}
        >
          {isSynthesizing ? (
            <>
              <RefreshCw size={15} className="animate-spin text-cyan-400" />
              <span>SYNTHESIZING DIRECTIVE...</span>
            </>
          ) : (
            <>
              <Zap size={16} style={{ color: C.yellow, fill: C.yellow }} />
              <span>COMPILE REPO INTENT</span>
            </>
          )}
        </motion.button>
      </div>

      {/* ─── Main Two-Column Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.45fr', gap: '20px', alignItems: 'start' }}>
        {/* ─── LEFT COLUMN: REPOSITORY & MEETING SOURCES ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Card 1: Repository Recon */}
          <ExpandableCard
            title="REPOSITORY_RECON"
            accent={C.cyan}
            subtitle={repoInfo?.name || 'select company directory'}
            tag={repoInfo ? `${repoInfo.totalFiles} files` : 'ATTACH'}
            minHeight={340}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: mono }}>
              {/* Directory selector button / path */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSelectFolder}
                  disabled={isScanning}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: 'rgba(0, 245, 255, 0.08)',
                    border: '1px solid rgba(0, 245, 255, 0.25)',
                    color: C.cyan,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.5px'
                  }}
                  className="hover:bg-cyan-500/20"
                >
                  <FolderOpen size={14} />
                  <span>{attachedRepoPath ? 'SWITCH FOLDER' : 'ATTACH LOCAL REPO FOLDER'}</span>
                </button>

                {attachedRepoPath && (
                  <button
                    onClick={handleRefreshScan}
                    disabled={isScanning}
                    title="Rescan Directory"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer'
                    }}
                    className="hover:bg-white/10"
                  >
                    <RefreshCw size={13} className={isScanning ? 'animate-spin text-cyan-400' : ''} />
                  </button>
                )}
              </div>

              {/* Repo Details Preview */}
              {repoInfo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Path box */}
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(171,178,191,0.1)',
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.6)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ color: C.cyan }}>root: </span>
                    {repoInfo.rootPath}
                  </div>

                  {/* Tech stack badges */}
                  <div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '1px' }}>
                      DETECTED TECH STACK
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {repoInfo.techStack.map((tech) => (
                        <span
                          key={tech}
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(34, 211, 238, 0.08)',
                            border: '1px solid rgba(34, 211, 238, 0.25)',
                            color: C.cyan
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {repoInfo.keyDependencies.slice(0, 5).map((dep) => (
                        <span
                          key={dep}
                          style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255,255,255,0.6)'
                          }}
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Directory Tree Preview */}
                  <div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>FILE TREE TELEMETRY</span>
                      <span>{repoInfo.totalFiles} files • {repoInfo.totalDirectories} dirs</span>
                    </div>
                    <div
                      className="glass-scrollbar"
                      style={{
                        maxHeight: '190px',
                        overflowY: 'auto',
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.45)',
                        border: '1px solid rgba(171,178,191,0.08)'
                      }}
                    >
                      {repoInfo.treePreview.map((node) => (
                        <FileTreeNode key={node.path} node={node} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '30px 16px',
                    textAlign: 'center',
                    border: '1px dashed rgba(0, 245, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.4)'
                  }}
                >
                  <FolderGit2 size={28} style={{ color: 'rgba(0,245,255,0.3)', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '11px', marginBottom: '4px' }}>No repository attached</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>Click 'ATTACH LOCAL REPO FOLDER' to index your company codebase</p>
                </div>
              )}
            </div>
          </ExpandableCard>

          {/* Card 2: Skill vault (reference repo) — its catalog feeds every generated prompt */}
          <RepoSlot role="vault" />

          {/* Card 3: Meeting Context Source */}
          <ExpandableCard
            title="MEETING_CONTEXT"
            accent={C.green}
            subtitle={activeMeeting ? activeMeeting.title : 'select meeting transcript'}
            tag={effectiveTranscript ? `${Math.round(effectiveTranscript.length / 5)} words` : 'IDLE'}
            minHeight={250}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: mono }}>
              {/* Selector / Manual Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SOURCE TRANSCRIPT</span>
                <button
                  onClick={() => setUseCustomInput(!useCustomInput)}
                  style={{
                    fontSize: '9px',
                    color: C.green,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <SlidersHorizontal size={11} />
                  <span>{useCustomInput ? 'USE RECORDED MEETINGS' : 'CUSTOM INPUT'}</span>
                </button>
              </div>

              {!useCustomInput ? (
                <>
                  {meetings.length > 0 ? (
                    <select
                      value={selectedMeetingId || activeMeeting?.id || ''}
                      onChange={(e) => setSelectedMeetingId(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'rgba(3, 3, 6, 0.8)',
                        border: '1px solid rgba(126, 231, 135, 0.25)',
                        color: C.green,
                        fontFamily: mono,
                        fontSize: '11px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {meetings.map((m) => (
                        <option key={m.id} value={m.id} style={{ background: '#0d1117', color: '#fff' }}>
                          {m.title} ({new Date(m.date).toLocaleDateString()}) • {Math.round(m.duration / 60)}m
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '10px 0' }}>
                      No meetings recorded yet. Record a call or switch to custom input.
                    </div>
                  )}

                  {/* Snippet preview */}
                  {effectiveTranscript && (
                    <div
                      className="glass-scrollbar"
                      style={{
                        maxHeight: '120px',
                        overflowY: 'auto',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(126, 231, 135, 0.1)',
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.5
                      }}
                    >
                      {effectiveTranscript.slice(0, 380)}...
                    </div>
                  )}
                </>
              ) : (
                <textarea
                  value={customTranscript}
                  onChange={(e) => setCustomTranscript(e.target.value)}
                  placeholder="Paste engineering meeting notes, transcript, or slack discussion here..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(126, 231, 135, 0.2)',
                    color: '#fff',
                    fontFamily: mono,
                    fontSize: '11px',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: 1.4
                  }}
                />
              )}
            </div>
          </ExpandableCard>
        </div>

        {/* ─── RIGHT COLUMN: SYNTHESIZED GOAL & CURSOR PROMPT ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {synthesisResult ? (
            <>
              {/* 1. PRIMARY DIRECTIVE CARD ("Krna Kya Hai") */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: '10px',
                  background: 'rgba(13, 17, 23, 0.85)',
                  border: '1px solid rgba(126, 231, 135, 0.3)',
                  boxShadow: '0 0 20px rgba(126, 231, 135, 0.08)',
                  position: 'relative',
                  fontFamily: mono
                }}
              >
                {/* Header tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      color: C.green,
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                    TARGET_DIRECTIVE // REPO_ALIGNED
                  </span>

                  {/* Branch & Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {synthesisResult.suggestedBranchName && (
                      <button
                        onClick={handleCopyBranch}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(97, 175, 239, 0.1)',
                          border: '1px solid rgba(97, 175, 239, 0.3)',
                          color: C.blue,
                          fontSize: '9px',
                          cursor: 'pointer'
                        }}
                        title="Click to copy git checkout -b command"
                      >
                        <GitBranch size={10} />
                        <span>{synthesisResult.suggestedBranchName}</span>
                        {copiedBranch ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    )}

                    <button
                      onClick={handleExportMarkdown}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '9px',
                        cursor: 'pointer'
                      }}
                      title="Export Directive as Markdown"
                    >
                      <Download size={10} />
                      <span>EXPORT .MD</span>
                    </button>
                  </div>
                </div>

                {/* Main Goal Headline */}
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: '10px',
                    lineHeight: 1.4,
                    textShadow: '0 0 10px rgba(126,231,135,0.3)'
                  }}
                >
                  {synthesisResult.mainGoal}
                </h2>

                {/* Executive Summary */}
                <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {synthesisResult.executiveSummary}
                </p>

                {/* Constraints / Non-goals if any */}
                {synthesisResult.keyDecisionsAndConstraints.length > 0 && (
                  <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255, 203, 107, 0.05)', border: '1px solid rgba(255, 203, 107, 0.2)' }}>
                    <div style={{ fontSize: '9px', color: C.yellow, fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>
                      ARCHITECTURAL CONSTRAINTS & NON-GOALS
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {synthesisResult.keyDecisionsAndConstraints.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.8)', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                          <span style={{ color: C.yellow }}>▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Affected Files Matrix */}
                {synthesisResult.affectedFiles.length > 0 && (
                  <div>
                    <div style={{ fontSize: '9px', color: C.cyan, fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
                      TARGETED FILES IN REPO ({synthesisResult.affectedFiles.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {synthesisResult.affectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '10px',
                            padding: '6px 10px',
                            borderRadius: '5px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '11px'
                          }}
                        >
                          <ActionBadge action={file.action} />
                          <span style={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all' }}>{file.path}</span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', textAlign: 'right' }}>
                            {file.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PRODUCTION CURSOR / LLM PROMPT CARD */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: '10px',
                  background: 'rgba(13, 17, 23, 0.95)',
                  border: '1px solid rgba(0, 245, 255, 0.35)',
                  boxShadow: '0 0 24px rgba(0, 245, 255, 0.1)',
                  position: 'relative',
                  fontFamily: mono
                }}
              >
                {/* Header + Copy Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={14} style={{ color: C.cyan }} />
                    <span style={{ fontSize: '11px', color: C.cyan, fontWeight: 800, letterSpacing: '1px' }}>
                      CURSOR_COMPOSER // PRODUCTION_PROMPT
                    </span>
                  </div>

                  {/* Prominent Copy Button */}
                  <motion.button
                    onClick={handleCopyPrompt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: copiedPrompt ? 'rgba(126, 231, 135, 0.2)' : 'rgba(0, 245, 255, 0.15)',
                      border: copiedPrompt ? '1px solid rgba(126, 231, 135, 0.4)' : '1px solid rgba(0, 245, 255, 0.4)',
                      color: copiedPrompt ? C.green : C.cyan,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: copiedPrompt ? '0 0 12px rgba(126, 231, 135, 0.3)' : '0 0 12px rgba(0, 245, 255, 0.2)'
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check size={13} />
                        <span>COPIED TO CLIPBOARD!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>COPY CURSOR PROMPT</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Preformatted Prompt Block */}
                <div
                  className="glass-scrollbar"
                  style={{
                    maxHeight: '340px',
                    overflowY: 'auto',
                    padding: '14px',
                    borderRadius: '6px',
                    background: '#05070a',
                    border: '1px solid rgba(0, 245, 255, 0.15)',
                    color: '#e6edf3',
                    fontSize: '11px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    userSelect: 'text'
                  }}
                >
                  {synthesisResult.cursorPrompt}
                </div>

                <div style={{ marginTop: '8px', fontSize: '9.5px', color: 'rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ Pre-seeded with repo file paths, architecture rules, and acceptance criteria</span>
                  <span>Direct paste ready: Ctrl+V into Cursor / Claude Code</span>
                </div>
              </div>

              {/* 3. STEP-BY-STEP CHECKLIST */}
              {synthesisResult.stepByStepPlan.length > 0 && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    background: 'rgba(13, 17, 23, 0.6)',
                    border: '1px solid rgba(171, 178, 191, 0.1)',
                    fontFamily: mono
                  }}
                >
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
                    EXECUTION ROADMAP
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {synthesisResult.stepByStepPlan.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                        <span style={{ color: C.cyan, fontWeight: 700 }}>0{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty state when no synthesis has been triggered yet */
            <div
              style={{
                borderRadius: '10px',
                border: '1px solid rgba(0, 245, 255, 0.15)',
                background: 'rgba(13, 17, 23, 0.7)',
                overflow: 'hidden',
                fontFamily: mono
              }}
            >
              <div style={{ height: '180px', position: 'relative' }}>
                <CyberArt variant="circuit" accent={C.cyan} />
              </div>

              <div style={{ padding: '24px 28px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '14px', color: C.cyan, fontWeight: 800, letterSpacing: '1px', marginBottom: '8px' }}>
                  AWAITING SYNTHESIS EXECUTION
                </h3>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', maxWidth: '460px', margin: '0 auto 18px', lineHeight: 1.6 }}>
                  Connect your company repository folder on the left, pick an EVES meeting transcript, and click{' '}
                  <strong style={{ color: C.yellow }}>COMPILE REPO INTENT</strong> to extract the main directive and generate a zero-hallucination Cursor prompt.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: C.green }}>01.</span> Attach Folder
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: C.green }}>02.</span> Select Meeting
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: C.green }}>03.</span> Compile Directive
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
