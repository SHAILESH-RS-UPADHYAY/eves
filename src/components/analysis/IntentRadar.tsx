import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import { GlassCard } from '../glass/GlassCard'
import type { Intention } from '../../types'

interface IntentRadarProps {
  intentions: Intention[]
}

export function IntentRadar({ intentions }: IntentRadarProps) {
  const data = intentions.map((intent) => ({
    subject: intent.speaker,
    value: intent.sentiment === 'POSITIVE' ? 80 : intent.sentiment === 'NEUTRAL' ? 60 : intent.sentiment === 'CAUTIOUS' ? 40 : 20,
    fullMark: 100
  }))

  return (
    <GlassCard style={{ padding: '16px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Intent Radar</h4>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
