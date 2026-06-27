import { HardDrive, FileText } from 'lucide-react'

const integrations = [
  { icon: HardDrive, name: 'Google Drive', desc: 'Browse and download audio files directly. Upload summaries back automatically.', color: '#06B6D4', endpoint: 'drivemcp.googleapis.com' },
  { icon: FileText, name: 'Notion', desc: 'Export structured meeting pages with action item checkboxes and speaker profiles.', color: '#7C3AED', endpoint: 'mcp.notion.com' }
]

export function IntegrationsSection() {
  return (
    <section style={{ padding: '120px 32px', flexDirection: 'column' }}>
      <h2 className="gradient-text" style={{ fontSize: '42px', fontWeight: 800, textAlign: 'center', marginBottom: '60px' }}>
        Connected to your tools
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '700px', width: '100%' }}>
        {integrations.map((int, i) => {
          const Icon = int.icon
          return (
            <div key={i} className="glass-card" style={{ padding: '32px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${int.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Icon size={24} style={{ color: int.color }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{int.name}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>{int.desc}</p>
              <code style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{int.endpoint}</code>
            </div>
          )
        })}
      </div>
    </section>
  )
}
