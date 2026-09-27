import { useEffect, useState, type ReactNode } from 'react'
import { CyberArt } from './CyberArt'

/**
 * HackerPanels — extra "cyber-ops" widgets for the dashboard.
 * All self-contained, live-animated, Atom One Dark toned. No network.
 */

const P = {
  cyan: '#22d3ee',
  green: '#7ee787',
  red: '#ff5370',
  yellow: '#ffcb6b',
  orange: '#f78c6c',
  blue: '#61afef',
  purple: '#c678dd',
  fg: '#abb2bf',
  mut: 'rgba(171,178,191,0.45)',
}

const mono = '"Courier New", Consolas, monospace'

function PanelHeader({ label, color = P.cyan, right }: { label: string; color?: string; right?: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '10px', paddingBottom: '8px',
      borderBottom: '1px solid rgba(171,178,191,0.1)',
    }}>
      <span style={{ fontSize: '10px', fontFamily: mono, color, fontWeight: 700, letterSpacing: '1px', textShadow: `0 0 8px ${color}55` }}>
        ▌ {label}
      </span>
      {right}
    </div>
  )
}

const rip = () => `${(Math.random() * 223 + 12 | 0)}.${(Math.random() * 255 | 0)}.${(Math.random() * 255 | 0)}.${(Math.random() * 254 + 1 | 0)}`

/* ════════════════ PACKET SNIFFER ════════════════ */
type Pkt = { id: number; t: string; src: string; dst: string; proto: string; len: number; flag: string; color: string }
export function PacketSniffer() {
  const [rows, setRows] = useState<Pkt[]>([])
  useEffect(() => {
    let id = 0
    const protos = [
      { p: 'TLSv1.3', f: 'ENCRYPTED', c: P.green },
      { p: 'TCP', f: 'ACK', c: P.cyan },
      { p: 'TCP', f: 'SYN', c: P.yellow },
      { p: 'UDP', f: 'STREAM', c: P.blue },
      { p: 'HTTP/2', f: 'GET', c: P.purple },
      { p: 'TCP', f: 'RST DROP', c: P.red },
    ]
    const tick = () => {
      const pr = protos[Math.random() * protos.length | 0]
      const now = new Date()
      const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`
      const row: Pkt = { id: id++, t, src: rip(), dst: '10.0.0.7', proto: pr.p, len: 40 + (Math.random() * 1420 | 0), flag: pr.f, color: pr.c }
      setRows((r) => [row, ...r].slice(0, 8))
    }
    tick()
    const iv = setInterval(tick, 780)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="atom-glass atom-glass-hover" style={{ padding: '14px 16px', fontFamily: mono }}>
      <PanelHeader label="PACKET_SNIFFER.pcap" color={P.cyan}
        right={<span style={{ fontSize: '8px', color: P.green, letterSpacing: '0.5px' }}>● CAPTURING</span>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minHeight: '150px' }}>
        {rows.map((r) => (
          <div key={r.id} style={{ display: 'flex', gap: '8px', fontSize: '9.5px', alignItems: 'center', animation: 'logFadeIn 0.3s ease' }}>
            <span style={{ color: P.mut, width: '78px', flexShrink: 0 }}>{r.t}</span>
            <span style={{ color: P.fg, width: '108px', flexShrink: 0, textAlign: 'right' }}>{r.src}</span>
            <span style={{ color: P.mut }}>→</span>
            <span style={{ color: P.blue, width: '64px', flexShrink: 0 }}>{r.dst}</span>
            <span style={{ color: P.orange, width: '54px', flexShrink: 0 }}>{r.proto}</span>
            <span style={{ color: P.mut, width: '38px', flexShrink: 0 }}>{r.len}b</span>
            <span style={{ color: r.color, fontWeight: 700, textShadow: `0 0 6px ${r.color}44` }}>{r.flag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ NMAP PORT SCAN ════════════════ */
const PORTS = [
  { port: '22/tcp', svc: 'ssh', state: 'open', c: P.green },
  { port: '443/tcp', svc: 'https', state: 'open', c: P.green },
  { port: '8080/tcp', svc: 'http-proxy', state: 'open', c: P.green },
  { port: '3306/tcp', svc: 'mysql', state: 'filtered', c: P.yellow },
  { port: '6379/tcp', svc: 'redis', state: 'open', c: P.green },
  { port: '9229/tcp', svc: 'node-inspect', state: 'filtered', c: P.yellow },
  { port: '23/tcp', svc: 'telnet', state: 'closed', c: P.red },
  { port: '445/tcp', svc: 'smb', state: 'closed', c: P.red },
]
export function PortScan() {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const iv = setInterval(() => setN((v) => (v >= PORTS.length ? 0 : v + 1)), 520)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="atom-glass atom-glass-hover" style={{ padding: '14px 16px', fontFamily: mono }}>
      <PanelHeader label="NMAP_SCAN // 10.0.0.0/24" color={P.green}
        right={<span style={{ fontSize: '8px', color: P.mut }}>{n}/{PORTS.length}</span>} />
      <div style={{ fontSize: '9px', color: P.mut, marginBottom: '6px' }}>
        <span style={{ color: P.green }}>$</span> nmap -sV --open <span style={{ color: P.cyan }}>10.0.0.7</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 70px', gap: '2px 8px', minHeight: '150px', alignContent: 'start' }}>
        <span style={{ fontSize: '8.5px', color: P.mut }}>PORT</span>
        <span style={{ fontSize: '8.5px', color: P.mut }}>SERVICE</span>
        <span style={{ fontSize: '8.5px', color: P.mut, textAlign: 'right' }}>STATE</span>
        {PORTS.slice(0, n).map((p, i) => (
          <div key={i} style={{ display: 'contents', animation: 'logFadeIn 0.3s ease' }}>
            <span style={{ fontSize: '9.5px', color: P.fg }}>{p.port}</span>
            <span style={{ fontSize: '9.5px', color: P.blue }}>{p.svc}</span>
            <span style={{ fontSize: '9.5px', color: p.c, fontWeight: 700, textAlign: 'right', textShadow: `0 0 6px ${p.c}44` }}>{p.state}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ THREAT MAP ════════════════ */
const THREATS = [
  { geo: 'RU', ip: '', sev: 'CRIT', c: P.red },
  { geo: 'CN', ip: '', sev: 'HIGH', c: P.orange },
  { geo: 'BR', ip: '', sev: 'MED', c: P.yellow },
  { geo: 'US', ip: '', sev: 'LOW', c: P.green },
]
export function ThreatMap() {
  const [blocked, setBlocked] = useState(84213)
  const [feed, setFeed] = useState(() => THREATS.map((t) => ({ ...t, ip: rip() })))
  useEffect(() => {
    const iv = setInterval(() => {
      setBlocked((b) => b + (Math.random() * 7 | 0) + 1)
      setFeed((f) => {
        const t = THREATS[Math.random() * THREATS.length | 0]
        return [{ ...t, ip: rip() }, ...f].slice(0, 4)
      })
    }, 1400)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="atom-glass atom-glass-hover" style={{ padding: '14px 16px', fontFamily: mono, position: 'relative', overflow: 'hidden' }}>
      <PanelHeader label="THREAT_MAP // GLOBAL" color={P.red}
        right={<span style={{ fontSize: '8px', color: P.red, letterSpacing: '0.5px' }}>● LIVE</span>} />
      <div style={{ position: 'relative', height: '104px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', border: '1px solid rgba(171,178,191,0.1)' }}>
        <CyberArt variant="network" accent={P.red} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '9px', color: P.mut }}>INTRUSIONS BLOCKED</span>
        <span style={{ fontSize: '14px', color: P.green, fontWeight: 700, textShadow: `0 0 10px ${P.green}55`, fontVariantNumeric: 'tabular-nums' }}>
          {blocked.toLocaleString()}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {feed.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '9px', alignItems: 'center', animation: 'logFadeIn 0.3s ease' }}>
            <span style={{ color: t.c, fontWeight: 700, width: '30px' }}>[{t.geo}]</span>
            <span style={{ color: P.fg, flex: 1 }}>{t.ip}</span>
            <span style={{ color: t.c, fontWeight: 700, textShadow: `0 0 6px ${t.c}44` }}>{t.sev}</span>
            <span style={{ color: P.green }}>BLOCKED</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ AES CIPHER STREAM ════════════════ */
const hexRow = () => Array.from({ length: 16 }).map(() => (Math.random() * 256 | 0).toString(16).padStart(2, '0')).join(' ')
export function CipherStream() {
  const [rows, setRows] = useState<string[]>(() => Array.from({ length: 7 }).map(hexRow))
  useEffect(() => {
    const iv = setInterval(() => setRows((r) => [hexRow(), ...r].slice(0, 7)), 260)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="atom-glass atom-glass-hover" style={{ padding: '14px 16px', fontFamily: mono }}>
      <PanelHeader label="AES-256 // CIPHER_STREAM" color={P.purple}
        right={<span style={{ fontSize: '8px', color: P.purple }}>KEY 0x****</span>} />
      <div style={{ fontSize: '9px', color: P.mut, marginBottom: '6px' }}>
        <span style={{ color: P.green }}>[OK]</span> handshake · <span style={{ color: P.cyan }}>ECDHE-RSA</span> · <span style={{ color: P.yellow }}>GCM</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '140px' }}>
        {rows.map((r, i) => (
          <div key={`${i}-${r.slice(0, 5)}`} style={{
            fontSize: '9.5px', letterSpacing: '0.5px',
            color: i === 0 ? P.green : `rgba(126,231,135,${0.7 - i * 0.09})`,
            textShadow: i === 0 ? `0 0 8px ${P.green}55` : 'none',
            animation: i === 0 ? 'logFadeIn 0.25s ease' : undefined,
          }}>
            <span style={{ color: P.mut }}>{(i * 16).toString(16).padStart(4, '0')}:</span> {r}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ DATA TICKER (marquee) ════════════════ */
export function DataTicker() {
  const items: [string, string][] = [
    ['UPLINK', P.green], ['DEEPGRAM · NOVA-2', P.cyan], ['GROQ · LLaMA-3.1-70B', P.purple],
    ['SENTINEL · LOCAL_VAULT', P.green], ['AES-256-GCM', P.yellow], ['16kHz PCM', P.blue],
    ['0 TELEMETRY', P.green], ['LOCAL-ONLY', P.orange], ['LATENCY 69ms', P.cyan], ['ZERO FOOTPRINT', P.red],
  ]
  const seq = [...items, ...items]
  return (
    <div className="atom-glass" style={{ padding: '9px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '30px', whiteSpace: 'nowrap', width: 'max-content', animation: 'tickerScroll 26s linear infinite', fontFamily: mono }}>
        {seq.map(([txt, c], i) => (
          <span key={i} style={{ fontSize: '10px', color: c, fontWeight: 700, letterSpacing: '1px', textShadow: `0 0 8px ${c}44`, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'rgba(171,178,191,0.25)' }}>//</span> {txt}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ ASCII BANNER ════════════════ */
const ASCII = `  ▓█████ ██▒   █▓▓█████   ██████
  ▓█   ▀▓██░   █▒▓█   ▀ ▒██    ▒
  ▒███  ▓██  █▒░▒███   ░ ▓██▄
  ▒▓█  ▄ ▒██ █░░▒▓█  ▄   ▒   ██▒
  ░▒████▒ ▒▀█░  ░▒████▒▒██████▒▒
  ░░ ▒░ ░ ░ ▐░  ░░ ▒░ ░▒ ▒▓▒ ▒ ░`
export function AsciiBanner() {
  return (
    <div className="atom-glass" style={{ padding: '16px 20px', fontFamily: mono, display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <pre style={{
        margin: 0, fontSize: '9px', lineHeight: 1.15, color: P.green,
        textShadow: `0 0 10px ${P.green}55`, whiteSpace: 'pre', letterSpacing: '0px',
        animation: 'flickerText 4s infinite',
      }}>{ASCII}</pre>
      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', marginBottom: '6px' }}>
          <span className="rgb-text">MEETING INTELLIGENCE // WEAPONIZED</span>
        </div>
        <div style={{ fontSize: '10px', color: P.mut, lineHeight: 1.7 }}>
          <span style={{ color: P.green }}>root@eves</span>:<span style={{ color: P.cyan }}>~</span>$ deployed · <span style={{ color: P.yellow }}>listening on all channels</span> · <span style={{ color: P.red }}>they'll never know</span>
          <span style={{ color: P.cyan, animation: 'cursorBlink 1s step-end infinite' }}> ▊</span>
        </div>
      </div>
    </div>
  )
}
