import { useCallback, useEffect, useRef, useState } from 'react'
import { useMeetingsStore } from '../store/meetings.store'
import { pillById } from '../components/brain/SpatialPills'
import type { ChatMessage, Meeting, PillId } from '../types'

export interface PendingReply {
  requestId: string
  pill?: PillId
  text: string
  stage: string
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/**
 * The brain conversation for one meeting. The history lives on the meeting
 * (persisted); the reply being streamed lives here until it completes.
 */
export function useBrainChat(meeting?: Meeting) {
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting)
  const [pending, setPending] = useState<PendingReply | null>(null)
  const pendingRef = useRef<PendingReply | null>(null)
  pendingRef.current = pending

  // Deltas arrive hundreds per second — buffer them and paint once per frame
  useEffect(() => {
    let buffer = ''
    let frame = 0
    const flush = () => {
      frame = 0
      const text = buffer
      buffer = ''
      setPending((p) => (p ? { ...p, text: p.text + text } : p))
    }
    const offDelta = window.eves?.onAiDelta((d) => {
      if (d.requestId !== pendingRef.current?.requestId) return
      buffer += d.text
      if (!frame) frame = requestAnimationFrame(flush)
    })
    const offStage = window.eves?.onAiProgress((p) => {
      if (p.key === pendingRef.current?.requestId) setPending((cur) => (cur ? { ...cur, stage: p.stage } : cur))
    })
    return () => {
      cancelAnimationFrame(frame)
      offDelta?.()
      offStage?.()
    }
  }, [])

  const send = useCallback(async (text: string, pill?: PillId) => {
    if (!meeting || pendingRef.current || !window.eves) return
    const question: ChatMessage = { id: newId(), role: 'user', text: pill ? pillById(pill)!.label : text.trim(), pill, at: Date.now() }
    if (!question.text) return
    const history = [...(meeting.chat ?? []), question]
    updateMeeting(meeting.id, { chat: history })

    const requestId = newId()
    const first: PendingReply = { requestId, pill, text: '', stage: 'connecting' }
    pendingRef.current = first
    setPending(first)
    const res = await window.eves.chat({ requestId, meetingId: meeting.id, messages: history, pill })
    const reply: ChatMessage = res.success && res.data
      ? { id: newId(), role: 'assistant', text: res.data.text, pill, at: Date.now(), model: res.data.model }
      : { id: newId(), role: 'assistant', text: res.error ?? 'No answer', pill, at: Date.now(), error: true }
    updateMeeting(meeting.id, { chat: [...history, reply] })
    pendingRef.current = null
    setPending(null)
  }, [meeting, updateMeeting])

  const stop = useCallback(() => {
    if (pendingRef.current) window.eves?.cancelChat(pendingRef.current.requestId)
  }, [])

  const clear = useCallback(() => {
    if (meeting) updateMeeting(meeting.id, { chat: [] })
  }, [meeting, updateMeeting])

  return { messages: meeting?.chat ?? [], pending, send, stop, clear }
}
