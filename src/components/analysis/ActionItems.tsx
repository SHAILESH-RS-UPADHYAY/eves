import { motion } from 'framer-motion'
import { Check, User, Flag } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'
import { GlassBadge } from '../glass/GlassBadge'
import type { ActionItem } from '../../types'

interface ActionItemsProps {
  items: ActionItem[]
  onToggle?: (index: number) => void
}

const priorityColors = {
  HIGH: 'rose' as const,
  MEDIUM: 'amber' as const,
  LOW: 'teal' as const
}

export function ActionItems({ items, onToggle }: ActionItemsProps) {
  if (items.length === 0) return null

  return (
    <GlassCard style={{ padding: '16px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Action Items</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: item.completed ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
              cursor: onToggle ? 'pointer' : 'default'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onToggle?.(i)}
          >
            <button
              style={{
                width: '20px', height: '20px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)',
                background: item.completed ? 'var(--accent-violet)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, marginTop: 1
              }}
            >
              {item.completed && <Check size={12} color="#fff" />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                {item.task}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <User size={10} /> {item.owner}
                </span>
                <GlassBadge color={priorityColors[item.priority]} size="sm">
                  {item.priority}
                </GlassBadge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
