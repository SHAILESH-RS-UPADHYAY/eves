import { useCallback, useState } from 'react'
import type { DriveFile } from '../types'

export function useDrive() {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const listFiles = useCallback(async () => {
    setIsLoading(true)
    if (typeof window !== 'undefined' && window.eves) {
      const result = await window.eves.driveListFiles()
      if (result.success && result.data) {
        setFiles(result.data as DriveFile[])
      }
    }
    setIsLoading(false)
  }, [])

  const downloadFile = useCallback(async (fileId: string, fileName: string) => {
    if (typeof window !== 'undefined' && window.eves) {
      const result = await window.eves.driveDownload(fileId, fileName)
      return result
    }
    return null
  }, [])

  const uploadFile = useCallback(async (content: string, fileName: string) => {
    if (typeof window !== 'undefined' && window.eves) {
      return await window.eves.driveUpload(content, fileName)
    }
    return null
  }, [])

  return { files, isLoading, listFiles, downloadFile, uploadFile }
}
