import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download } from 'lucide-react'
import { GlassPanel } from '../glass/GlassPanel'
import { GlassButton } from '../glass/GlassButton'
import { useNotion } from '../../hooks/useNotion'
import { useMeetingsStore } from '../../store/meetings.store'
import { useSettingsStore } from '../../store/settings.store'
import { useUIStore } from '../../store/ui.store'

export function NotionExport() {
  const { databases, isExporting, listDatabases, createPage } = useNotion()
  const meetings = useMeetingsStore((s) => s.meetings)
  const settings = useSettingsStore((s) => s.settings)
  const addToast = useUIStore((s) => s.addToast)
  const [selectedDb, setSelectedDb] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const analyzedMeetings = meetings.filter((m) => m.analysis)

  const handleExport = async () => {
    if (!selectedDb || !selectedMeeting) {
      addToast({ type: 'error', title: 'Missing selection', message: 'Select both a database and a meeting' })
      return
    }
    const meeting = meetings.find((m) => m.id === selectedMeeting)
    if (!meeting?.analysis) return

    const result = await createPage(selectedDb, meeting, meeting.analysis, settings.groqApiKey)
    if (result?.success) {
      setShowConfetti(true)
      addToast({ type: 'success', title: 'Exported to Notion!', message: 'Meeting page created successfully' })
      setTimeout(() => setShowConfetti(false), 3000)
    } else {
      addToast({ type: 'error', title: 'Export failed', message: result?.error })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      style={{ position: 'relative' }}
    >
      <GlassPanel title="Notion Export">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={18} style={{ color: 'var(--accent-violet-mid)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Export Meeting to Notion</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Database</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedDb}
                onChange={(e) => setSelectedDb(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
              >
                <option value="">Select database...</option>
                {databases.map((db) => <option key={db.id} value={db.id} style={{ background: '#1a1a2e' }}>{db.title}</option>)}
              </select>
              <GlassButton size="sm" onClick={() => listDatabases(settings.groqApiKey)}>Load</GlassButton>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Meeting</label>
            <select
              value={selectedMeeting}
              onChange={(e) => setSelectedMeeting(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            >
              <option value="">Select meeting...</option>
              {analyzedMeetings.map((m) => <option key={m.id} value={m.id} style={{ background: '#1a1a2e' }}>{m.title}</option>)}
            </select>
          </div>

          <GlassButton variant="primary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export to Notion'}
            {!isExporting && <Download size={14} />}
          </GlassButton>

          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Endpoint: https://mcp.notion.com/mcp
          </p>
        </div>
      </GlassPanel>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const colors = ['#7C3AED', '#06B6D4', '#F43F5E', '#F59E0B', '#14B8A6']
              const left = Math.random() * 100
              const color = colors[i % colors.length]
              const delay = Math.random() * 0.5
              return (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    bottom: 0,
                    width: 8,
                    height: 8,
                    background: color,
                    borderRadius: '2px'
                  }}
                  initial={{ y: 0, rotate: 0, opacity: 1 }}
                  animate={{ y: -120, rotate: 720, opacity: 0 }}
                  transition={{ duration: 2, delay, ease: 'easeOut' }}
                />
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
