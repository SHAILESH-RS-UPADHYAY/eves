import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Play, Pause, RotateCcw, RotateCw, Volume2, Gauge } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { GlassCard } from '../glass/GlassCard'
import type { TranscriptionResult } from '../../types'

const speakerColors = [
  'rgba(124,58,237,0.15)',
  'rgba(6,182,212,0.15)',
  'rgba(244,63,94,0.15)',
  'rgba(245,158,11,0.15)'
]

const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
const MAX_REGIONS = 400 // past this the speaker bands are sub-pixel and only cost DOM
const RATE_KEY = 'eves.playbackRate'

function savedRate() {
  try {
    const r = Number(localStorage.getItem(RATE_KEY))
    return r >= 0.5 && r <= 3 ? r : 1
  } catch {
    return 1
  }
}

export function formatClock(total: number) {
  const s = Math.max(0, Math.floor(total))
  const h = Math.floor(s / 3600)
  const m = Math.floor(s / 60) % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}

interface AudioPlayerProps {
  src: string
  /** Waveform captured while recording — skips fetching + decoding the whole file */
  peaks?: number[]
  knownDuration?: number
  transcription?: TranscriptionResult
  onReady?: (duration: number) => void
  seekTo?: number | null
}

export function AudioPlayer({ src, peaks, knownDuration, transcription, onReady, seekTo }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(savedRate)
  const [error, setError] = useState('')
  const speedRef = useRef(speed)
  speedRef.current = speed

  useEffect(() => {
    if (!containerRef.current) return
    // same component, new meeting: drop the previous recording's position
    setError('')
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(124, 58, 237, 0.45)',
      progressColor: '#7C3AED',
      cursorColor: '#06B6D4',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 64,
      normalize: true,
      audioRate: speedRef.current
    })
    wsRef.current = ws

    ws.on('ready', (d) => {
      setDuration(d)
      onReady?.(d)
      const utterances = transcription?.utterances ?? []
      if (utterances.length && utterances.length <= MAX_REGIONS) {
        const regions = ws.registerPlugin(RegionsPlugin.create())
        utterances.forEach((u) => regions.addRegion({
          start: u.start,
          end: u.end,
          color: speakerColors[u.speaker % speakerColors.length],
          drag: false,
          resize: false
        }))
      }
    })
    ws.on('timeupdate', setCurrentTime)
    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))

    // Recorded sessions carry peaks + duration: no fetch and no decode — the
    // media element streams (and range-seeks) the file, so multi-hour recordings
    // open instantly. Uploads without peaks fall back to decoding.
    const loading = peaks?.length && knownDuration
      ? ws.load(src, [peaks], knownDuration)
      : ws.load(src)
    loading.catch(() => setError('Recording could not be loaded — the file may have been moved or deleted.'))

    return () => ws.destroy()
  }, [src])

  useEffect(() => {
    if (seekTo != null && wsRef.current && duration > 0) wsRef.current.setTime(seekTo)
  }, [seekTo, duration])

  const togglePlay = () => wsRef.current?.playPause()

  const skip = (seconds: number) => {
    const ws = wsRef.current
    if (!ws || !duration) return
    ws.setTime(Math.max(0, Math.min(duration, ws.getCurrentTime() + seconds)))
  }

  const changeVolume = (v: number) => {
    setVolume(v)
    wsRef.current?.setVolume(v)
  }

  const changeSpeed = (raw: number) => {
    const s = Math.round(Math.min(3, Math.max(0.5, raw)) * 100) / 100
    setSpeed(s)
    wsRef.current?.setPlaybackRate(s, true) // keep the voice pitch natural at any speed
    try { localStorage.setItem(RATE_KEY, String(s)) } catch { /* private mode */ }
  }

  useHotkeys('space', (e) => { e.preventDefault(); togglePlay() })
  useHotkeys('left', () => skip(-10), [duration])
  useHotkeys('right', () => skip(10), [duration])
  useHotkeys('bracketleft', () => changeSpeed(speed - 0.25), [speed])
  useHotkeys('bracketright', () => changeSpeed(speed + 0.25), [speed])

  return (
    // flexShrink 0: the meeting page is a flex column — without it long transcripts squeeze the controls away
    <GlassCard style={{ padding: '16px', flexShrink: 0 }}>
      <div ref={containerRef} style={{ marginBottom: '12px' }} />
      {error && <p style={{ fontSize: '11px', color: 'var(--accent-rose)', marginBottom: '10px', fontFamily: 'monospace' }}>{error}</p>}

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
        <button onClick={() => skip(-10)} style={controlBtnStyle} title="Back 10s (←)"><RotateCcw size={16} /></button>
        <button
          onClick={togglePlay}
          style={{ ...controlBtnStyle, width: '44px', height: '44px', background: 'var(--gradient-brand)', border: 'none', color: '#fff' }}
          title="Play / pause (Space)"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={() => skip(10)} style={controlBtnStyle} title="Forward 10s (→)"><RotateCw size={16} /></button>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginLeft: '8px' }}>
          {formatClock(currentTime)} / {formatClock(duration)}
        </span>
      </div>

      {/* Volume + speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 140px' }}>
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent-violet)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px' }}>
          {PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              style={{
                padding: '4px 7px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: speed === s ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: speed === s ? 'var(--accent-violet-mid)' : 'var(--text-muted)',
                fontSize: '10px', fontWeight: 600
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Any speed in between: 0.5×–3× in 0.05 steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }} title="Playback speed — [ and ] change it by 0.25">
        <Gauge size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          type="range" min={0.5} max={3} step={0.05} value={speed}
          onChange={(e) => changeSpeed(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent-violet)' }}
        />
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent-violet-mid)', minWidth: '42px', textAlign: 'right' }}>
          {speed.toFixed(2)}x
        </span>
      </div>
    </GlassCard>
  )
}

const controlBtnStyle: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
  color: 'var(--text-primary)', cursor: 'pointer'
}
