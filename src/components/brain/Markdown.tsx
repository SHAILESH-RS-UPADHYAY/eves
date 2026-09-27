import { useState, type ReactNode } from 'react'
import { Copy, Check, Play, Code2 } from 'lucide-react'
import { parseMarkdown } from '../../lib/markdown'

const mono = '"Courier New", Consolas, monospace'
const C = { cyan: '#22d3ee', green: '#7ee787', yellow: '#ffcb6b', purple: '#c678dd', fg: '#d6dde8', mut: 'rgba(171,178,191,0.55)' }

/** `code`, **bold**, *italic* and [mm:ss] timestamps. */
function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\d{1,2}:\d{2}(?::\d{2})?\])/g).map((part, i) => {
    if (/^`[^`]+`$/.test(part)) return <code key={i} style={{ fontFamily: mono, fontSize: '0.92em', color: C.green, background: 'rgba(126,231,135,0.08)', border: '1px solid rgba(126,231,135,0.15)', borderRadius: '4px', padding: '0 4px' }}>{part.slice(1, -1)}</code>
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>
    if (/^\*[^*\s][^*]*\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>
    if (/^\[\d{1,2}:\d{2}(?::\d{2})?\]$/.test(part)) return <span key={i} style={{ color: C.yellow, fontFamily: mono, fontSize: '0.9em' }}>{part}</span>
    return part
  })
}

export function CopyButton({ text, label = 'COPY', color = C.cyan }: { text: string; label?: string; color?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '5px', cursor: 'pointer', fontFamily: mono, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', color: done ? C.green : color, background: done ? 'rgba(126,231,135,0.12)' : `${color}14`, border: `1px solid ${done ? 'rgba(126,231,135,0.4)' : `${color}44`}` }}
    >
      {done ? <Check size={10} /> : <Copy size={10} />}{done ? 'COPIED' : label}
    </button>
  )
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const [preview, setPreview] = useState(lang === 'html')
  return (
    <div style={{ margin: '10px 0', borderRadius: '8px', border: '1px solid rgba(34,211,238,0.18)', background: '#05070a', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderBottom: '1px solid rgba(34,211,238,0.1)', background: 'rgba(34,211,238,0.04)' }}>
        <span style={{ fontSize: '9px', fontFamily: mono, color: C.mut, letterSpacing: '1px' }}>{lang || 'text'}</span>
        <span style={{ flex: 1 }} />
        {lang === 'html' && (
          <button
            onClick={() => setPreview(!preview)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '5px', cursor: 'pointer', fontFamily: mono, fontSize: '9px', fontWeight: 700, color: C.purple, background: 'rgba(198,120,221,0.12)', border: '1px solid rgba(198,120,221,0.4)' }}
          >
            {preview ? <Code2 size={10} /> : <Play size={10} />}{preview ? 'SHOW CODE' : 'RENDER PREVIEW'}
          </button>
        )}
        <CopyButton text={text} />
      </div>
      {preview && lang === 'html' ? (
        // sandboxed: no scripts, no same-origin, parent CSP applies
        <iframe title="Frontend preview" sandbox="" srcDoc={text} style={{ width: '100%', height: '460px', border: 'none', background: '#fff', display: 'block' }} />
      ) : (
        <pre className="glass-scrollbar" style={{ margin: 0, padding: '10px 12px', maxHeight: '380px', overflow: 'auto', fontFamily: mono, fontSize: '11px', lineHeight: 1.55, color: '#e6edf3', whiteSpace: 'pre-wrap', userSelect: 'text' }}>{text}</pre>
      )}
    </div>
  )
}

export function Markdown({ text }: { text: string }) {
  return (
    <div style={{ fontSize: '12.5px', lineHeight: 1.65, color: C.fg, userSelect: 'text' }}>
      {parseMarkdown(text).map((b, i) => {
        switch (b.kind) {
          case 'code':
            return <CodeBlock key={i} lang={b.lang} text={b.text} />
          case 'h':
            return (
              <div key={i} style={{ margin: '14px 0 6px', fontFamily: mono, fontWeight: 800, letterSpacing: '0.5px', fontSize: b.level <= 2 ? '13px' : '12px', color: b.level <= 2 ? C.cyan : C.green, textShadow: `0 0 8px ${b.level <= 2 ? C.cyan : C.green}44` }}>
                {b.level <= 2 ? '▌ ' : '▸ '}{inline(b.text)}
              </div>
            )
          case 'list':
            return (
              <ol key={i} style={{ listStyle: 'none', margin: '4px 0 8px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {b.items.map((it, k) => (
                  <li key={k} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: b.ordered ? C.cyan : C.yellow, fontFamily: mono, flexShrink: 0, minWidth: b.ordered ? '18px' : undefined }}>{b.ordered ? `${String(k + 1).padStart(2, '0')}.` : '▸'}</span>
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ol>
            )
          case 'table':
            return (
              <div key={i} className="glass-scrollbar" style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '11.5px' }}>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} style={{ background: r === 0 ? 'rgba(34,211,238,0.07)' : r % 2 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                        {row.map((cell, c) => {
                          const Cell = r === 0 ? 'th' : 'td'
                          return <Cell key={c} style={{ textAlign: 'left', padding: '6px 9px', border: '1px solid rgba(34,211,238,0.12)', color: r === 0 ? C.cyan : C.fg, fontFamily: r === 0 ? mono : undefined, fontWeight: r === 0 ? 700 : 400, verticalAlign: 'top' }}>{inline(cell)}</Cell>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'quote':
            return <div key={i} style={{ borderLeft: `2px solid ${C.purple}`, padding: '2px 10px', margin: '6px 0', color: 'rgba(214,221,232,0.75)' }}>{inline(b.text)}</div>
          case 'hr':
            return <div key={i} style={{ height: '1px', margin: '12px 0', background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.35), transparent)' }} />
          default:
            return <p key={i} style={{ margin: '5px 0' }}>{inline(b.text)}</p>
        }
      })}
    </div>
  )
}
