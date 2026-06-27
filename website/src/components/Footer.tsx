export function Footer() {
  return (
    <footer style={{
      padding: '32px',
      textAlign: 'center',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      flexWrap: 'wrap',
      background: 'var(--bg-deep)'
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>EVES © 2025</span>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Built with Deepgram + Groq</span>
      <a href="https://github.com" target="_blank" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>MIT License</a>
    </footer>
  )
}
