export function Footer() {
  return (
    <footer style={{
      padding: '32px',
      textAlign: 'center',
      borderTop: '1px solid var(--line)',
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      flexWrap: 'wrap',
      background: 'var(--bg-deep)'
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>EVES © 2026</span>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Built with Deepgram + Groq</span>
      <a href="https://github.com/SHAILESH-RS-UPADHYAY/eves" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>GitHub</a>
    </footer>
  )
}
