import { AnimatePresence, motion } from 'framer-motion'
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
import { MeetingTypeBadge } from './MeetingTypeBadge'
import { SentimentPulse } from './SentimentPulse'
import { GlassBadge } from '../glass/GlassBadge'
import type { Meeting } from '../../types'

interface MeetingComparisonProps {
  meetings: [Meeting, Meeting] | null
  onClose: () => void
}

export function MeetingComparison({ meetings, onClose }: MeetingComparisonProps) {
  return (
    <AnimatePresence>
      {meetings && (
        <motion.div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card"
            style={{ width: '760px', maxHeight: '80vh', overflow: 'auto', padding: '32px' }}
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="gradient-text" style={{ fontSize: '20px', fontWeight: 700 }}>Meeting Comparison</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {meetings.map((m, i) => (
                <div key={i} className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{m.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>{m.date}</div>
                  {m.analysis && (
                    <>
                      <div style={{ marginBottom: '8px' }}><MeetingTypeBadge type={m.analysis.meetingType} /></div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <SentimentPulse mood={m.analysis.overallMood} />
                        <GlassBadge color={m.analysis.urgency === 'CRITICAL' ? 'rose' : m.analysis.urgency === 'HIGH' ? 'amber' : 'gray'}>
                          {m.analysis.urgency}
                        </GlassBadge>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Topic overlap */}
            {meetings[0].analysis && meetings[1].analysis && (
              <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shared Topics</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {meetings[0].analysis.mainTopics
                    .filter((t) => meetings[1].analysis!.mainTopics.some((t2) => t2.topic === t.topic))
                    .map((t, i) => (
                      <GlassBadge key={i} color="cyan">{t.topic}</GlassBadge>
                    ))}
                </div>
              </div>
            )}

            {/* Action items count comparison */}
            {meetings[0].analysis && meetings[1].analysis && (
              <div className="glass-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Items</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={[
                    { name: meetings[0].title.slice(0, 15), items: meetings[0].analysis.actionItems.length },
                    { name: meetings[1].title.slice(0, 15), items: meetings[1].analysis.actionItems.length }
                  ]}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="items" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
