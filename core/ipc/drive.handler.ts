import { ipcMain, app } from '../runtime'
import * as fs from 'fs'
import * as path from 'path'
import type { DriveFile, IpcResult } from '../../src/types'

const DRIVE_MCP_URL = 'https://drivemcp.googleapis.com/mcp/v1'

export function registerDriveHandlers() {
  ipcMain.handle('drive:list', async (): Promise<IpcResult<DriveFile[]>> => {
    try {
      const res = await fetch(`${DRIVE_MCP_URL}/files?mimeType=audio`)
      if (!res.ok) return { success: false, error: `Drive MCP returned ${res.status}` }
      const data = await res.json()
      const files: DriveFile[] = (data.files ?? []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size ?? 0,
        modifiedTime: f.modifiedTime ?? '',
        webViewLink: f.webViewLink
      }))
      return { success: true, data: files }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Drive list failed' }
    }
  })

  ipcMain.handle('drive:download', async (_event, args: { fileId: string; fileName: string }): Promise<IpcResult<string>> => {
    try {
      const { fileId, fileName } = args
      const res = await fetch(`${DRIVE_MCP_URL}/files/${fileId}/download`)
      if (!res.ok) return { success: false, error: `Download failed: ${res.status}` }
      const buffer = Buffer.from(await res.arrayBuffer())
      const dir = path.join(app.getPath('temp'), 'eves-downloads')
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const localPath = path.join(dir, fileName)
      fs.writeFileSync(localPath, buffer)
      return { success: true, data: localPath }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Download failed' }
    }
  })

  ipcMain.handle('drive:upload', async (_event, args: { content: string; fileName: string }): Promise<IpcResult<string>> => {
    try {
      const { content, fileName } = args
      const formData = new FormData()
      formData.append('file', new Blob([content]), fileName)
      const res = await fetch(`${DRIVE_MCP_URL}/files`, { method: 'POST', body: formData })
      if (!res.ok) return { success: false, error: `Upload failed: ${res.status}` }
      const data = await res.json()
      return { success: true, data: data.id ?? '' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Upload failed' }
    }
  })
}
