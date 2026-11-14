import { DownloadButtons } from './DownloadButtons'

export function DownloadCTA() {
  return (
    <section id="download" style={{
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
        background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
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
          Free. Private. Local. Windows and macOS — no subscriptions, no cloud.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <DownloadButtons />
        </div>
      </div>
    </section>
  )
}
