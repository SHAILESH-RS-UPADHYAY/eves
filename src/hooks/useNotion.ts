import { useCallback, useState } from 'react'
import type { Meeting, MeetingAnalysis } from '../types'

export function useNotion() {
  const [databases, setDatabases] = useState<{ id: string; title: string }[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const listDatabases = useCallback(async (apiKey: string) => {
    if (typeof window !== 'undefined' && window.eves) {
      const result = await window.eves.notionListDatabases(apiKey)
      if (result.success && result.data) {
        setDatabases(result.data as { id: string; title: string }[])
      }
    }
  }, [])

  const createPage = useCallback(
    async (databaseId: string, meeting: Meeting, analysis: MeetingAnalysis, apiKey: string) => {
      setIsExporting(true)
      if (typeof window !== 'undefined' && window.eves) {
        const result = await window.eves.notionCreatePage({ databaseId, meeting, analysis, apiKey })
        setIsExporting(false)
        return result
      }
      setIsExporting(false)
      return null
    },
    []
  )

  return { databases, isExporting, listDatabases, createPage }
}
