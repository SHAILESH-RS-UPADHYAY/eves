import { motion } from 'framer-motion'
import { CheckSquare, Gavel } from 'lucide-react'
import { GlassPanel } from '../glass/GlassPanel'
import { useMeetingsStore } from '../../store/meetings.store'

export function RecentInsights() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const analyzedMeetings = meetings.filter((m) => m.analysis)

  const recentActions = analyzedMeetings
    .flatMap((m) => m.analysis!.actionItems.slice(0, 3).map((a) => ({ ...a, meetingTitle: m.title })))
    .slice(0, 3)

  const recentDecision = analyzedMeetings[0]?.analysis?.keyDecisions?.[0]

  return (
    <GlassPanel title="Recent Insights" style={{ width: '33%', flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Recent action items */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <CheckSquare size={14} style={{ color: 'var(--accent-rose)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Items</span>
          </div>
          {recentActions.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No action items yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentActions.map((a, i) => (
                <motion.div
                  key={i}
                  style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{a.task}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.meetingTitle}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent decision */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Gavel size={14} style={{ color: 'var(--accent-amber)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Decision</span>
          </div>
          {recentDecision ? (
            <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{recentDecision.decision}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{analyzedMeetings[0].title}</div>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No decisions yet.</p>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
