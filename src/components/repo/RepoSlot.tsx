import { motion, AnimatePresence } from 'framer-motion'
import { FolderGit2, BookMarked, RefreshCw, FolderOpen, Unlink, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useRepoLink } from '../../hooks/useRepoLink'
import { useSettingsStore } from '../../store/settings.store'
import { stylePath } from '../../lib/paths'
import type { RepoRole } from '../../store/repo.store'

const mono = '"Courier New", Consolas, monospace'

const ROLES = {
  company: {
    title: 'COMPANY_REPO',
    accent: '#22d3ee',
    Icon: FolderGit2,
    empty: 'Attach the repository you work on — EVES maps the meeting onto its real files.'
  },
  vault: {
    title: 'SKILL_VAULT',
    accent: '#c678dd',
    Icon: BookMarked,
    empty: 'Attach your reference repo (e.g. github_skills). EVES reads its INDEX.md and tells Codex / Claude / Cursor which skills to load.'
  }
}

/** Attachment "cartridge" for one repository — the path persists across restarts. */
export function RepoSlot({ role }: { role: RepoRole }) {
  const { path, info, scanning, attach, rescan, detach } = useRepoLink(role)
  const pathStyle = useSettingsStore((s) => s.settings.promptPathStyle)
  const { title, accent, Icon, empty } = ROLES[role]
  const linked = !!path

  const tag = scanning ? 'INDEXING' : info ? (role === 'vault' ? `${info.skillCount ?? 0} skills` : `${info.totalFiles} files`) : linked ? 'LINKED' : 'EMPTY'
  const chips = role === 'vault'
    ? (info?.treePreview ?? []).filter((n) => n.type === 'directory').slice(0, 6).map((n) => n.name)
    : [...(info?.techStack ?? [])].slice(0, 6)

  return (
    <div
      className="atom-glass atom-glass-hover"
      style={{ position: 'relative', overflow: 'hidden', padding: '13px 15px 13px 19px', fontFamily: mono }}
    >
      {/* cartridge spine: glows while linked, sweeps while indexing */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: linked ? `linear-gradient(180deg, ${accent}, transparent 50%, ${accent})` : 'rgba(171,178,191,0.15)',
        backgroundSize: '100% 200%',
        animation: scanning ? 'vaultSpine 1.1s linear infinite' : undefined,
        boxShadow: linked ? `0 0 12px ${accent}` : 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
        <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `${accent}14`, border: `1px solid ${accent}44` }}>
          <Icon size={14} style={{ color: accent }} />
          {scanning && <span style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: `1px dashed ${accent}`, animation: 'spin 2s linear infinite' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '1px', textShadow: `0 0 8px ${accent}55` }}>▌ {title}</div>
          <div style={{ fontSize: '9px', color: 'rgba(171,178,191,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {info?.name ?? (linked ? path.split(/[\\/]/).pop() : 'not attached')}
          </div>
        </div>
        <span style={{ fontSize: '8px', color: accent, border: `1px solid ${accent}44`, borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{tag}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {linked ? (
          <motion.div key="linked" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div title={path} style={{ fontSize: '9.5px', padding: '6px 8px', borderRadius: '5px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(171,178,191,0.1)', color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ color: accent }}>prompt path: </span>{stylePath(path, pathStyle)}
            </div>

            {role === 'vault' && info && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9.5px', color: info.catalog ? '#7ee787' : '#ffcb6b' }}>
                {info.catalog ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                {info.catalog ? `${info.catalog} catalog detected — read on every prompt` : 'no INDEX.md / README.md — EVES will use the folder list'}
              </div>
            )}

            {chips.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {chips.map((c) => (
                  <span key={c} style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '999px', color: accent, background: `${accent}10`, border: `1px solid ${accent}33` }}>{c}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px' }}>
              <SlotButton accent={accent} onClick={attach} icon={<FolderOpen size={11} />} label="SWITCH" />
              <SlotButton accent={accent} onClick={rescan} icon={<RefreshCw size={11} className={scanning ? 'animate-spin' : ''} />} label="RESCAN" />
              <SlotButton accent="#ff5370" onClick={detach} icon={<Unlink size={11} />} label="DETACH" />
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: '9.5px', lineHeight: 1.6, color: 'rgba(171,178,191,0.6)', marginBottom: '9px' }}>{empty}</p>
            <motion.button
              onClick={attach}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontFamily: mono, fontSize: '10.5px', fontWeight: 700, letterSpacing: '1px', color: accent, background: `${accent}12`, border: `1px dashed ${accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FolderOpen size={13} /> ATTACH {role === 'vault' ? 'SKILL VAULT' : 'COMPANY REPO'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SlotButton({ accent, onClick, icon, label }: { accent: string; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '5px 0', borderRadius: '5px', cursor: 'pointer', fontFamily: mono, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', color: accent, background: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}33`, transition: 'background 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}18`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
    >
      {icon}{label}
    </button>
  )
}
