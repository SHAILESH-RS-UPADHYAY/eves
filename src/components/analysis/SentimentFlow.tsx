import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'
import { GlassCard } from '../glass/GlassCard'
import type { SentimentPoint } from '../../types'

interface SentimentFlowProps {
  points: SentimentPoint[]
}

export function SentimentFlow({ points }: SentimentFlowProps) {
  const data = points.map((p) => ({
    minute: p.minute,
    score: p.score,
    emotion: p.dominantEmotion
  }))

  return (
    <GlassCard style={{ padding: '16px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Sentiment Flow</h4>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="sentiment-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <XAxis dataKey="minute" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
          <YAxis domain={[-1, 1]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ background: 'rgba(8,11,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
          />
          <Line type="monotone" dataKey="score" stroke="url(#sentiment-line)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
