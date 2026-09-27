import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { UploadZone } from './UploadZone'
import { AudioPlayer } from './AudioPlayer'
import { TranscriptView } from './TranscriptView'
import { SpeakerTimeline } from './SpeakerTimeline'
import { TagManager } from './TagManager'
import { InsightPanel } from '../analysis/InsightPanel'
import { ProgressOrb } from '../extras/ProgressOrb'
import { EmptyState } from '../extras/EmptyState'
import { GlassCard } from '../glass/GlassCard'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'
import { useDeepgram } from '../../hooks/useDeepgram'
import { useAnalyze } from '../../hooks/useAnalyze'
import { useSettingsStore } from '../../store/settings.store'
import { format } from 'date-fns'
import { audioUrl } from '../../../core/utils/audioUrl'

export function MeetingPage() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const activeMeetingId = useUIStore((s) => s.activeMeetingId)
  const createMeeting = useMeetingsStore((s) => s.createMeeting)
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting)
  const addTag = useMeetingsStore((s) => s.addTag)
  const removeTag = useMeetingsStore((s) => s.removeTag)
  const updateNotes = useMeetingsStore((s) => s.updateNotes)
  const { transcribe } = useDeepgram()
  const analyze = useAnalyze()
  const settings = useSettingsStore((s) => s.settings)
  const [seekTo, setSeekTo] = useState<number | null>(null)

  const activeMeeting = meetings.find((m) => m.id === activeMeetingId)

  const handleFile = useCallback(async (file: File) => {
    // File.path is gone from the runtime; the bridge resolves the real path
    const filePath = window.eves?.pathForFile(file)
    if (!filePath) {
      useUIStore.getState().addToast({ type: 'error', title: 'Upload failed', message: 'Could not resolve the file location' })
      return
    }
    const id = `upload-${Date.now()}`
    createMeeting({
      id,
      title: file.name.replace(/\.[^.]+$/, ''),
      date: new Date().toISOString(),
      duration: 0,
      audioPath: filePath,
      audioUrl: audioUrl(filePath),
      source: 'upload',
      tags: [],
      notes: '',
      isTranscribing: false,
      isAnalyzing: false,
      transcriptionProgress: 0
    })
    useUIStore.getState().setActiveMeeting(id)

    if (settings.autoTranscribe) {
      const result = await transcribe(id, filePath)
      if (result && settings.autoAnalyze) await analyze(id)
    }
  }, [createMeeting, transcribe, analyze, settings])

  const handleWordClick = (time: number) => setSeekTo(time)

  // Transcribe a recording that already exists on disk
  const handleTranscribeExisting = useCallback(async (id: string, filePath: string) => {
    const result = await transcribe(id, filePath)
    if (result && settings.autoAnalyze) await analyze(id)
  }, [transcribe, analyze, settings.autoAnalyze])

  if (!activeMeeting && meetings.length === 0) {
    return (
      <motion.div
        style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center' }}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <UploadZone onFile={handleFile} />
        </div>
        <EmptyState message="No meeting selected" subtext="Upload a recording or select one from the dashboard" />
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'auto' }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="glass-scrollbar"
    >
      {/* Upload zone always visible at top */}
      <UploadZone onFile={handleFile} />

      {activeMeeting && (
        <>
          {/* Meeting title + progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeMeeting.title}</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{format(new Date(activeMeeting.date), 'MMM d, yyyy • HH:mm')}</span>
            </div>
            {activeMeeting.isTranscribing && (
              <ProgressOrb progress={activeMeeting.transcriptionProgress} label="Transcribing" />
            )}
            {activeMeeting.isAnalyzing && (
              <ProgressOrb progress={50} label="Analyzing" />
            )}
            {/* Audio but no transcript — a recovered session, or one where the live
                stream died. Without this the recording is unreadable. */}
            {activeMeeting.audioPath && !activeMeeting.transcription && !activeMeeting.isTranscribing && (
              <button
                onClick={() => handleTranscribeExisting(activeMeeting.id, activeMeeting.audioPath)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(0, 245, 255, 0.1)',
                  border: '1px solid rgba(0, 245, 255, 0.4)',
                  borderRadius: '6px',
                  color: '#00F5FF',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  textShadow: '0 0 8px rgba(0, 245, 255, 0.5)'
                }}
              >
                ./transcribe_audio
              </button>
            )}
            {activeMeeting.transcription && !activeMeeting.isAnalyzing && (
              <button
                onClick={() => analyze(activeMeeting.id)}
                title="Summary, decisions and action items with the EVES brain"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(126, 231, 135, 0.08)',
                  border: '1px solid rgba(126, 231, 135, 0.4)',
                  borderRadius: '6px',
                  color: '#7ee787',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  textShadow: '0 0 8px rgba(126, 231, 135, 0.5)'
                }}
              >
                {activeMeeting.analysis ? './re_analyze' : './analyze_meeting'}
              </button>
            )}
          </div>

          {/* Audio player */}
          {(activeMeeting.audioUrl || activeMeeting.audioPath) && (
          <AudioPlayer
            src={activeMeeting.audioUrl || audioUrl(activeMeeting.audioPath)}
            peaks={activeMeeting.peaks}
            knownDuration={activeMeeting.duration}
            transcription={activeMeeting.transcription}
            onReady={(dur) => { if (Math.abs(dur - activeMeeting.duration) > 1) updateMeeting(activeMeeting.id, { duration: dur }) }}
            seekTo={seekTo}
          />
          )}

          {/* Two column layout: transcript + analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {activeMeeting.transcription && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TranscriptView transcription={activeMeeting.transcription} onWordClick={handleWordClick} />
                <SpeakerTimeline transcription={activeMeeting.transcription} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TagManager
                tags={activeMeeting.tags}
                suggestedTags={activeMeeting.analysis?.suggestedTags}
                onAddTag={(tag) => addTag(activeMeeting.id, tag)}
                onRemoveTag={(tagId) => removeTag(activeMeeting.id, tagId)}
              />
              {activeMeeting.analysis && <InsightPanel analysis={activeMeeting.analysis} />}
              <GlassCard style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Notes</h4>
                <textarea
                  value={activeMeeting.notes}
                  onChange={(e) => updateNotes(activeMeeting.id, e.target.value)}
                  placeholder="Add your own notes..."
                  style={{ width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', padding: '10px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
