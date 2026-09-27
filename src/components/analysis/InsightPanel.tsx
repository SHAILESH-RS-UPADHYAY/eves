import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, AlertTriangle, ThumbsUp, HelpCircle } from 'lucide-react'
import { GlassPanel } from '../glass/GlassPanel'
import { GlassBadge } from '../glass/GlassBadge'
import { IntentRadar } from './IntentRadar'
import { SentimentFlow } from './SentimentFlow'
import { KeyMoments } from './KeyMoments'
import { ActionItems } from './ActionItems'
import { WordCloud } from './WordCloud'
import { SpeakerAvatar } from '../extras/SpeakerAvatar'
import type { MeetingAnalysis } from '../../types'

interface InsightPanelProps {
  analysis: MeetingAnalysis
}

export function InsightPanel({ analysis }: InsightPanelProps) {
  const [actionItems, setActionItems] = useState(analysis.actionItems)

  const toggleAction = (index: number) => {
    setActionItems((prev) => prev.map((a, i) => i === index ? { ...a, completed: !a.completed } : a))
  }

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* TL;DR */}
      <GlassPanel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-violet-mid)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TL;DR</span>
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.5, color: 'var(--text-primary)' }}>{analysis.tldr}</p>
      </GlassPanel>

      {/* Summary */}
      <GlassPanel title="Summary">
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{analysis.summary}</p>
      </GlassPanel>

      {/* Action items */}
      <ActionItems items={actionItems} onToggle={toggleAction} />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <IntentRadar intentions={analysis.intentions} />
        <SentimentFlow points={analysis.sentimentByMinute} />
      </div>

      {/* Key moments */}
      <KeyMoments sentimentPoints={analysis.sentimentByMinute} />

      {/* Word cloud */}
      <WordCloud wordFrequency={analysis.wordFrequency} />

      {/* Concerns */}
      {analysis.concerns.length > 0 && (
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-rose)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Concerns</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.concerns.map((c, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '12px', borderLeft: '2px solid rgba(244,63,94,0.2)' }}>{c}</li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {/* Agreements */}
      {analysis.agreements.length > 0 && (
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ThumbsUp size={16} style={{ color: 'var(--accent-teal)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Agreements</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.agreements.map((a, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '12px', borderLeft: '2px solid rgba(20,184,166,0.2)' }}>{a}</li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {/* Open questions */}
      {analysis.openQuestions.length > 0 && (
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HelpCircle size={16} style={{ color: 'var(--accent-amber)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Open Questions</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.openQuestions.map((q, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '12px', borderLeft: '2px solid rgba(245,158,11,0.2)' }}>{q}</li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {/* Speaker profiles */}
      {analysis.speakerProfiles.length > 0 && (
        <GlassPanel title="Speaker Profiles">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analysis.speakerProfiles.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <SpeakerAvatar name={s.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                    {s.role && <GlassBadge color="gray" size="sm">{s.role}</GlassBadge>}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{Math.round(s.talkTimePercent)}% talk</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.communicationStyle}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Agenda: {s.agenda}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Power dynamics */}
      {analysis.powerDynamics && (
        <GlassPanel title="Power Dynamics">
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{analysis.powerDynamics}</p>
        </GlassPanel>
      )}
    </motion.div>
  )
}
