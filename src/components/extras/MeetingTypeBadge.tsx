import { GlassBadge } from '../glass/GlassBadge'
import type { MeetingType } from '../../types'

const typeConfig: Record<MeetingType, { color: 'rose' | 'cyan' | 'amber' | 'teal' | 'violet' | 'gray'; emoji: string }> = {
  SALES: { color: 'rose', emoji: '💰' },
  ONE_ON_ONE: { color: 'cyan', emoji: '👤' },
  PLANNING: { color: 'amber', emoji: '📋' },
  STANDUP: { color: 'teal', emoji: '⚡' },
  INTERVIEW: { color: 'violet', emoji: '🎯' },
  NEGOTIATION: { color: 'rose', emoji: '🤝' },
  OTHER: { color: 'gray', emoji: '📝' }
}

interface MeetingTypeBadgeProps {
  type: MeetingType
}

export function MeetingTypeBadge({ type }: MeetingTypeBadgeProps) {
  const config = typeConfig[type]
  return (
    <GlassBadge color={config.color}>
      <span>{config.emoji}</span>
      <span>{type.replace(/_/g, ' ')}</span>
    </GlassBadge>
  )
}
