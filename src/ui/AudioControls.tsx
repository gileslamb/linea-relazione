import { useRef, useState } from 'react'

interface AudioControlsProps {
  onFileUpload: (file: File) => void
  onPlay: () => void
  onPause: () => void
  isPlaying: boolean
  hasAudio: boolean
}

export function AudioControls({
  onFileUpload,
  onPlay,
  onPause,
  isPlaying,
  hasAudio
}: AudioControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '15px 25px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      fontFamily: 'monospace',
      fontSize: '13px',
      zIndex: 1000
    }}>
      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: '#333',
          border: '1px solid #666',
          color: '#fff',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Upload Audio
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* File Name */}
      {fileName && (
        <span style={{ opacity: 0.7, fontSize: '11px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </span>
      )}

      {/* Play/Pause Buttons */}
      {hasAudio && (
        <>
          <button
            onClick={onPlay}
            disabled={isPlaying}
            style={{
              background: isPlaying ? '#444' : '#0a0',
              border: 'none',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '4px',
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Play
          </button>

          <button
            onClick={onPause}
            disabled={!isPlaying}
            style={{
              background: !isPlaying ? '#444' : '#c00',
              border: 'none',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '4px',
              cursor: !isPlaying ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Pause
          </button>
        </>
      )}
    </div>
  )
}
