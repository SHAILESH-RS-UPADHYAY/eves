import { Github, Download } from 'lucide-react'

export function DownloadCTA() {
  return (
    <section style={{
      padding: '120px 32px',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h2 style={{
          fontSize: '48px', fontWeight: 800,
          background: 'var(--gradient-text)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          Your meetings deserve intelligence.
        </h2>
        <p style={{
          fontSize: '18px', color: 'var(--text-secondary)',
          maxWidth: '500px', margin: '0 auto 40px'
        }}>
          Free. Private. Local. No subscriptions. No cloud.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button style={{
            padding: '16px 32px',
            background: 'var(--gradient-brand)',
            border: 'none', borderRadius: '12px',
            color: '#fff', fontSize: '16px', fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 0 60px rgba(124,58,237,0.4)'
          }}>
            <Download size={20} /> Download EVES
          </button>
          <a href="https://github.com" target="_blank" style={{
            padding: '16px 32px',
            background: 'var(--glass-2)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontSize: '16px', fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <Github size={20} /> GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
