import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'
import { GlassBadge } from '../glass/GlassBadge'
import type { Tag } from '../../types'

interface TagManagerProps {
  tags: Tag[]
  suggestedTags?: string[]
  onAddTag: (tag: Tag) => void
  onRemoveTag: (tagId: string) => void
}

const colorOptions = ['#7C3AED', '#06B6D4', '#F43F5E', '#F59E0B', '#14B8A6', '#6366F1']
const emojiOptions = ['📌', '🎯', '💡', '⚠️', '✅', '🔥', '📊', '🤝', '⭐', '🏷️']

export function TagManager({ tags, suggestedTags = [], onAddTag, onRemoveTag }: TagManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('🏷️')
  const [color, setColor] = useState(colorOptions[0])

  const handleAdd = () => {
    if (!label.trim()) return
    onAddTag({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: label.trim(),
      emoji,
      color
    })
    setLabel('')
    setEmoji('🏷️')
    setColor(colorOptions[0])
    setIsAdding(false)
  }

  return (
    <GlassCard style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags</h4>
        <button onClick={() => setIsAdding(!isAdding)} style={{ background: 'none', border: 'none', color: 'var(--accent-violet-mid)', cursor: 'pointer' }}>
          <Plus size={16} />
        </button>
      </div>

      {/* Existing tags */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {tags.map((tag) => (
          <div key={tag.id} style={{ position: 'relative', group: true } as any}>
            <GlassBadge color="violet">
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
              <X
                size={12}
                style={{ cursor: 'pointer', opacity: 0.5 }}
                onClick={() => onRemoveTag(tag.id)}
              />
            </GlassBadge>
          </div>
        ))}
        {tags.length === 0 && !isAdding && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No tags yet.</span>
        )}
      </div>

      {/* Suggested tags */}
      {suggestedTags.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Suggested: </span>
          {suggestedTags.slice(0, 5).map((t) => (
            <button
              key={t}
              onClick={() => onAddTag({ id: `${Date.now()}-${t}`, label: t, emoji: '🏷️', color: colorOptions[0] })}
              style={{ background: 'none', border: '1px dashed rgba(124,58,237,0.3)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: 'var(--accent-violet-mid)', cursor: 'pointer', marginRight: '4px' }}
            >
              + {t}
            </button>
          ))}
        </div>
      )}

      {/* Add new tag form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Tag name..."
              style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {emojiOptions.map((em) => (
                <button key={em} onClick={() => setEmoji(em)} style={{ fontSize: '16px', padding: '2px 6px', border: emoji === em ? '1px solid var(--accent-violet)' : '1px solid transparent', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}>{em}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {colorOptions.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ width: '20px', height: '20px', borderRadius: '50%', border: color === c ? '2px solid #fff' : 'none', background: c, cursor: 'pointer' }} />
              ))}
            </div>
            <button onClick={handleAdd} style={{ padding: '6px 12px', background: 'var(--gradient-brand)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Add Tag</button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
