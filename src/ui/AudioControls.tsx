import { useRef, useState } from 'react'
import { Track } from '../audio/musicLibrary'

interface AudioControlsProps {
  tracks: Track[]
  currentTrack: Track | null
  onFileUpload: (file: File) => void
  onTrackSelect: (trackId: string) => void
  onPlay: () => void
  onPause: () => void
  isPlaying: boolean
}

export function AudioControls({
  tracks,
  currentTrack,
  onFileUpload,
  onTrackSelect,
  onPlay,
  onPause,
  isPlaying
}: AudioControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLibrary, setShowLibrary] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1000
    }}>
      {/* Library dropdown */}
      {tracks.length > 1 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '6px',
          padding: '10px',
          minWidth: '300px'
        }}>
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            style={{
              background: '#333',
              border: '1px solid #555',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'monospace',
              width: '100%'
            }}
          >
            Library ({tracks.length} tracks) {showLibrary ? '\u25B2' : '\u25BC'}
          </button>

          {showLibrary && (
            <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '8px' }}>
              {tracks.map(track => (
                <div
                  key={track.id}
                  onClick={() => {
                    onTrackSelect(track.id)
                    setShowLibrary(false)
                  }}
                  style={{
                    padding: '7px 10px',
                    background: currentTrack?.id === track.id ? '#444' : '#222',
                    marginBottom: '4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: currentTrack?.id === track.id ? '#fff' : '#aaa',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {track.name}
                  {track.duration > 0 && (
                    <span style={{ opacity: 0.5, marginLeft: '8px' }}>
                      {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Player bar */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {/* Add Track */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#333',
            border: '1px solid #555',
            color: '#fff',
            padding: '7px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          + Add Track
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Current track name */}
        {currentTrack && (
          <span style={{
            opacity: 0.7,
            fontSize: '11px',
            maxWidth: '180px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {currentTrack.name}
          </span>
        )}

        {/* Play / Pause */}
        {currentTrack && (
          <>
            <button
              onClick={onPlay}
              disabled={isPlaying}
              style={{
                background: isPlaying ? '#444' : '#0a0',
                border: 'none',
                color: '#fff',
                padding: '7px 18px',
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
                padding: '7px 18px',
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
    </div>
  )
}
