import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'

const acceptedFormats = {
  'audio/mpeg': ['.mp3'],
  'audio/mp4': ['.mp4', '.m4a'],
  'audio/wav': ['.wav'],
  'audio/webm': ['.webm'],
  'audio/ogg': ['.ogg']
}

interface UploadZoneProps {
  onFile: (file: File) => void
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const [isHovered, setIsHovered] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFile(accepted[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats,
    maxFiles: 1
  })

  return (
    <motion.div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? 'var(--accent-violet)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragActive ? 'rgba(124,58,237,0.05)' : 'transparent',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={{ y: isDragActive ? -4 : 0 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UploadCloud size={28} style={{ color: 'var(--accent-violet)' }} />
        </div>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isDragActive ? 'Drop to upload' : 'Drag & drop audio file'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Supports MP3, WAV, M4A, MP4, WebM, OGG
          </p>
        </div>
      </motion.div>

      {/* Ghost waveform on hover */}
      {isHovered && (
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px', alignItems: 'center' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              style={{ width: '3px', borderRadius: '2px', background: 'rgba(124,58,237,0.3)' }}
              animate={{ height: [4, 16, 8, 20, 6][i % 5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
