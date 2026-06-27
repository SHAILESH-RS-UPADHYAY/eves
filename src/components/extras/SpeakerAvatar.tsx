import { motion } from 'framer-motion'

const gradientPairs = [
  ['#7C3AED', '#06B6D4'],
  ['#F43F5E', '#F59E0B'],
  ['#14B8A6', '#6366F1'],
  ['#0EA5E9', '#10B981'],
  ['#8B5CF6', '#F43F5E'],
  ['#06B6D4', '#14B8A6']
]

function hashName(name: string): number {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return sum % 6
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

interface SpeakerAvatarProps {
  name: string
  size?: number
  isActive?: boolean
}

export function SpeakerAvatar({ name, size = 36, isActive = false }: SpeakerAvatarProps) {
  const idx = hashName(name)
  const [c1, c2] = gradientPairs[idx]
  const initials = getInitials(name)

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.35}px`,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        border: isActive ? '2px solid var(--accent-violet)' : 'none',
        boxShadow: isActive ? 'var(--shadow-glow-violet)' : 'none',
        transition: 'border 0.3s ease, box-shadow 0.3s ease'
      }}
      whileHover={{ scale: 1.08 }}
    >
      {initials}
    </motion.div>
  )
}
