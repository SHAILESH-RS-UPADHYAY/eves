import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { UploadCloud, Shield, FileText, Settings, RefreshCw, Columns2, Trash2, Search } from 'lucide-react'
import { useUIStore } from '../../store/ui.store'
import { useMeetingsStore } from '../../store/meetings.store'

interface Command {
  id: string
  label: string
  icon: typeof UploadCloud
  shortcut?: string
  section: 'Actions' | 'Navigation'
  danger?: boolean
  action: () => void
}

export function CommandPalette() {
  const isOpen = useUIStore((s) => s.isCommandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen)
  const setPage = useUIStore((s) => s.setPage)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)
  const meetings = useMeetingsStore((s) => s.meetings)
  const deleteMeeting = useMeetingsStore((s) => s.deleteMeeting)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useHotkeys('ctrl+k, cmd+k', (e) => { e.preventDefault(); setOpen(!isOpen) })
  useHotkeys('escape', () => setOpen(false), { enableOnTags: ['INPUT'] })

  const commands: Command[] = useMemo(() => {
    const base: Command[] = [
      { id: 'upload', label: 'Upload new recording', icon: UploadCloud, shortcut: '⌘U', section: 'Actions', action: () => { setPage('meetings'); setOpen(false) } },
      { id: 'stealth', label: 'Toggle stealth mode', icon: Shield, shortcut: '⌘⇧S', section: 'Actions', action: () => { setOpen(false) } },
      { id: 'notion', label: 'Export to Notion', icon: FileText, shortcut: '⌘N', section: 'Actions', action: () => { setPage('integrations'); setOpen(false) } },
      { id: 'settings', label: 'Open settings', icon: Settings, shortcut: '⌘,', section: 'Actions', action: () => { setSettingsOpen(true); setOpen(false) } },
      { id: 'drive', label: 'Sync from Drive', icon: RefreshCw, section: 'Actions', action: () => { setPage('integrations'); setOpen(false) } },
      { id: 'compare', label: 'Compare two meetings', icon: Columns2, section: 'Actions', action: () => { setOpen(false) } },
      { id: 'clear', label: 'Clear all data', icon: Trash2, section: 'Actions', danger: true, action: () => { meetings.forEach((m) => deleteMeeting(m.id)); setOpen(false) } },
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: Search, section: 'Navigation', action: () => { setPage('dashboard'); setOpen(false) } },
      { id: 'nav-meetings', label: 'Go to Meetings', icon: Search, section: 'Navigation', action: () => { setPage('meetings'); setOpen(false) } },
      { id: 'nav-transcripts', label: 'Go to Transcripts', icon: Search, section: 'Navigation', action: () => { setPage('transcripts'); setOpen(false) } },
      { id: 'nav-integrations', label: 'Go to Integrations', icon: Search, section: 'Navigation', action: () => { setPage('integrations'); setOpen(false) } }
    ]
    if (!query) return base
    return base.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
  }, [query, meetings, deleteMeeting, setPage, setSettingsOpen, setOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, commands.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); commands[selectedIndex]?.action() }
  }

  const sections = ['Actions', 'Navigation'] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9995 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            style={{
              position: 'fixed',
              top: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              maxHeight: '480px',
              background: 'rgba(8,11,18,0.95)',
              backdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '16px',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.1), 0 32px 64px rgba(0,0,0,0.6)',
              zIndex: 9996,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Search or run a command..."
              style={{
                width: '100%',
                height: '56px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '18px',
                color: 'var(--text-primary)',
                padding: '0 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            />
            <div style={{ overflow: 'auto', maxHeight: '380px' }} className="glass-scrollbar">
              {sections.map((section) => {
                const sectionCommands = commands.filter((c) => c.section === section)
                if (sectionCommands.length === 0) return null
                return (
                  <div key={section}>
                    <div style={{ padding: '12px 20px 4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{section}</div>
                    {sectionCommands.map((cmd) => {
                      const idx = commands.indexOf(cmd)
                      const Icon = cmd.icon
                      const isSelected = idx === selectedIndex
                      return (
                        <div
                          key={cmd.id}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => cmd.action()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(124,58,237,0.12)' : 'transparent',
                            borderLeft: isSelected ? '2px solid var(--accent-violet)' : '2px solid transparent',
                            color: cmd.danger ? 'var(--accent-rose)' : 'var(--text-primary)'
                          }}
                        >
                          <Icon size={16} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: '14px' }}>{cmd.label}</span>
                          {cmd.shortcut && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{cmd.shortcut}</span>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
