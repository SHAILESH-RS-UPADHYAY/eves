import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'
import { GlassButton } from '../glass/GlassButton'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import type { TranscriptionResult } from '../../types'

const speakerColors = [
  'rgba(124,58,237,0.15)',
  'rgba(6,182,212,0.15)',
  'rgba(244,63,94,0.15)',
  'rgba(245,158,11,0.15)'
]

const speeds = [0.75, 1, 1.25, 1.5, 2]

interface AudioPlayerProps {
  audioPath: string
  transcription?: TranscriptionResult
  onTimeUpdate?: (time: number) => void
  onReady?: (duration: number) => void
  seekTo?: number | null
}

export function AudioPlayer({ audioPath, transcription, onTimeUpdate, onReady, seekTo }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return

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
      normalize: true
    })

    ws.load(audioPath)
    wsRef.current = ws

    ws.on('ready', () => {
      const dur = ws.getDuration()
      setDuration(dur)
      onReady?.(dur)

      if (transcription) {
        const regions = ws.registerPlugin(RegionsPlugin.create())
        transcription.utterances.forEach((u) => {
          regions.addRegion({
            start: u.start,
            end: u.end,
            color: speakerColors[u.speaker % speakerColors.length],
            drag: false,
            resize: false
          })
        })
      }
    })

    ws.on('audioprocess', (t) => {
      setCurrentTime(t)
      onTimeUpdate?.(t)
    })

    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))

    return () => { ws.destroy() }
  }, [audioPath])

  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && wsRef.current && duration > 0) {
      wsRef.current.seekTo(seekTo / duration)
    }
  }, [seekTo, duration])

  const togglePlay = () => {
    if (!wsRef.current) return
    wsRef.current.playPause()
  }

  const skip = (seconds: number) => {
    if (!wsRef.current) return
    const t = Math.max(0, Math.min(duration, currentTime + seconds))
    wsRef.current.seekTo(t / duration)
    setCurrentTime(t)
  }

  const changeVolume = (v: number) => {
    setVolume(v)
    wsRef.current?.setVolume(v)
  }

  const changeSpeed = (s: number) => {
    setSpeed(s)
    wsRef.current?.setPlaybackRate(s)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <GlassCard style={{ padding: '16px' }}>
      <div ref={containerRef} style={{ marginBottom: '12px' }} />

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
        <button onClick={() => skip(-5)} style={controlBtnStyle}><SkipBack size={16} /></button>
        <button
          onClick={togglePlay}
          style={{ ...controlBtnStyle, width: '44px', height: '44px', background: 'var(--gradient-brand)', border: 'none', color: '#fff' }}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={() => skip(5)} style={controlBtnStyle}><SkipForward size={16} /></button>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginLeft: '8px' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Volume + Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent-violet)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px' }}>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              style={{
                padding: '4px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
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
    </GlassCard>
  )
}

const controlBtnStyle: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
  color: 'var(--text-primary)', cursor: 'pointer'
}
