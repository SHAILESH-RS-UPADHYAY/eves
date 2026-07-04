import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Waves } from 'lucide-react'
import { SectionDivider, ExpandableCard, ConnectionMatrix } from '../hacker/CyberKit'
import { CyberArt } from '../hacker/CyberArt'
import { DataTicker } from '../hacker/HackerPanels'
import { DriveSync } from './DriveSync'
import { NotionExport } from './NotionExport'

const mono = '"Courier New", Consolas, monospace'

function DataFlow() {
  const stats = [
    { Icon: Waves, k: 'THROUGHPUT', v: '16 kHz · PCM', c: '#22d3ee' },
    { Icon: Activity, k: 'PACKETS/S', v: '~1.2k', c: '#7ee787' },
    { Icon: ShieldCheck, k: 'TRANSPORT', v: 'TLS 1.3 · GCM', c: '#ffcb6b' },
  ]
  return (
    <div style={{ fontFamily: mono }}>
      <div style={{ position: 'relative', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(171,178,191,0.12)', marginBottom: '12px' }}>
        <CyberArt variant="network" accent="#22d3ee" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {stats.map((s) => (
          <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '10.5px' }}>
            <s.Icon size={13} style={{ color: s.c }} />
            <span style={{ color: '#61afef', width: '96px' }}>{s.k}</span>
            <span style={{ color: 'rgba(171,178,191,0.5)' }}>::</span>
            <span style={{ color: s.c, fontWeight: 700 }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function IntegrationsPage() {
  return (
    <motion.div
      className="glass-scrollbar"
      style={{ padding: '18px 28px 48px', height: '100%', overflow: 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <SectionDivider label="EXT_SERVICES // UPLINK MATRIX" right={<span style={{ fontSize: '9px', fontFamily: mono, color: 'rgba(171,178,191,0.45)' }}>4 endpoints · encrypted</span>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <ExpandableCard title="CONNECTION_MATRIX" accent="#22d3ee" subtitle="live channel telemetry" tag="RECON" minHeight={330}>
          <ConnectionMatrix />
        </ExpandableCard>
        <ExpandableCard title="DATA_FLOW // NEURAL_UPLINK" accent="#7ee787" subtitle="realtime pipeline" minHeight={330}>
          <DataFlow />
        </ExpandableCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
        <ExpandableCard title="GOOGLE_DRIVE.sync" accent="#7ee787" subtitle="audio archive" minHeight={260}>
          <DriveSync />
        </ExpandableCard>
        <ExpandableCard title="NOTION.export" accent="#f78c6c" subtitle="insight pipeline" minHeight={260}>
          <NotionExport />
        </ExpandableCard>
      </div>

      <DataTicker />
    </motion.div>
  )
}
