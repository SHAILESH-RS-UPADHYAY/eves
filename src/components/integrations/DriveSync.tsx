import { useState } from 'react'
import { motion } from 'framer-motion'
import { HardDrive, Download, FileAudio, RefreshCw } from 'lucide-react'
import { GlassPanel } from '../glass/GlassPanel'
import { GlassButton } from '../glass/GlassButton'
import { GlassBadge } from '../glass/GlassBadge'
import { useDrive } from '../../hooks/useDrive'

export function DriveSync() {
  const { files, isLoading, listFiles, downloadFile } = useDrive()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassPanel title="Google Drive">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Audio Files</span>
          </div>
          <GlassButton size="sm" onClick={listFiles} disabled={isLoading}>
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Sync
          </GlassButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflow: 'auto' }} className="glass-scrollbar">
          {files.length === 0 && !isLoading && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
              Click "Sync" to fetch audio files from Google Drive.
            </p>
          )}
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file.id)}
              className="glass-card"
              style={{
                padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', borderColor: selectedFile === file.id ? 'rgba(124,58,237,0.3)' : undefined
              }}
            >
              <FileAudio size={16} style={{ color: 'var(--accent-violet)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatSize(file.size)}</div>
              </div>
              <Download
                size={14}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); downloadFile(file.id, file.name) }}
              />
            </div>
          ))}
        </div>

        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px' }}>
          Endpoint: https://drivemcp.googleapis.com/mcp/v1 (read-only)
        </p>
      </GlassPanel>
    </motion.div>
  )
}
