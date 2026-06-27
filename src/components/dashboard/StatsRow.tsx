import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Clock, CheckSquare, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  color: string
  pulse?: boolean
  suffix?: string
}

function useCountUp(target: number, duration: number = 1000) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

function StatCard({ label, value, icon: Icon, color, pulse, suffix }: StatCardProps) {
  const animatedValue = useCountUp(value)

  return (
    <GlassCard interactive style={{ padding: '20px', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{label}</span>
        <Icon size={20} style={{ color }} className={pulse ? 'animate-pulse' : ''} />
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {Math.round(animatedValue)}{suffix}
      </div>
    </GlassCard>
  )
}

interface StatsRowProps {
  totalMeetings: number
  audioHours: number
  pendingActions: number
  speakers: number
}

export function StatsRow({ totalMeetings, audioHours, pendingActions, speakers }: StatsRowProps) {
  return (
    <motion.div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <StatCard label="Total Meetings" value={totalMeetings} icon={Mic} color="#7C3AED" />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <StatCard label="Audio Hours" value={audioHours} icon={Clock} color="#06B6D4" suffix="h" />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <StatCard label="Pending Actions" value={pendingActions} icon={CheckSquare} color="#F43F5E" pulse={pendingActions > 0} />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <StatCard label="Speakers" value={speakers} icon={Users} color="#F59E0B" />
      </motion.div>
    </motion.div>
  )
}

