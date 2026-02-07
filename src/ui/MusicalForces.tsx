import { useState } from 'react'
import { WaveParams } from '../field/waveField'
import { AudioFeatures } from '../audio/featureExtractor'

interface MusicalForcesProps {
  params: WaveParams
  onParamChange: (param: keyof WaveParams, value: number) => void
  fps: number
  activeTracers: number
  onTracerChange: (count: number) => void
  trailLength: number
  onTrailChange: (length: number) => void
  bloomIntensity: number
  onBloomChange: (value: number) => void
  isPlaying: boolean
  audioFeatures: AudioFeatures | null
  progress: number
}

export function MusicalForces({
  params, onParamChange, fps, activeTracers, onTracerChange,
  trailLength, onTrailChange,
  bloomIntensity, onBloomChange,
  isPlaying, audioFeatures, progress
}: MusicalForcesProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #555',
          color: '#fff',
          padding: '10px 15px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 1001
        }}
      >
        {isOpen ? 'Close' : 'Controls'}
      </button>

      {/* Collapsible panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 65,
          left: 20,
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '15px',
          fontFamily: 'monospace',
          fontSize: '12px',
          borderRadius: '6px',
          minWidth: '280px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>
            Linea Relazione
          </div>

          <div style={{ marginBottom: '10px', fontSize: '11px', opacity: 0.6 }}>
            {isPlaying ? 'Audio driving wave field' : 'Manual control'}
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '10px', display: 'flex', gap: '12px', fontSize: '11px' }}>
            <span>Tracers: {activeTracers}</span>
            <span>FPS: {fps}</span>
            {isPlaying && <span style={{ color: '#0f0', fontWeight: 'bold' }}>LIVE</span>}
          </div>

          {/* Progress bar (during playback) */}
          {isPlaying && progress > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '3px' }}>
                Progress: {(progress * 100).toFixed(1)}%
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress * 100}%`,
                  height: '100%',
                  background: '#fa0',
                  borderRadius: '2px',
                  transition: 'width 0.2s ease-out'
                }} />
              </div>
            </div>
          )}

          {/* Audio features */}
          {isPlaying && audioFeatures && (
            <>
              <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#0f0', fontSize: '11px' }}>
                Audio Features:
              </div>
              <div style={{ marginBottom: '10px', fontSize: '11px', lineHeight: '1.6' }}>
                <FeatureBar label="RMS (energy)" value={audioFeatures.rms} color="#4f4" />
                <FeatureBar label="Bass" value={audioFeatures.low} color="#f44" />
                <FeatureBar label="Mid" value={audioFeatures.mid} color="#fa4" />
                <FeatureBar label="High" value={audioFeatures.high} color="#4af" />
                <FeatureBar label="Brightness" value={audioFeatures.spectralCentroid} color="#f4f" />
                {audioFeatures.onset && (
                  <div style={{ fontSize: '10px', color: '#ff0' }}>ONSET</div>
                )}
              </div>
              <div style={{ borderTop: '1px solid #333', marginBottom: '10px' }} />
            </>
          )}

          {/* Wave param sliders */}
          <SliderRow label="Harmony" hint="destructive - constructive" value={params.harmony} disabled={isPlaying} onChange={(v) => onParamChange('harmony', v)} />
          <SliderRow label="Flow" hint="staccato - legato" value={params.flow} disabled={isPlaying} onChange={(v) => onParamChange('flow', v)} />
          <SliderRow label="Density" hint="sparse - dense" value={params.density} disabled={isPlaying} onChange={(v) => onParamChange('density', v)} />
          <SliderRow label="Space Depth" hint="flat - deep" value={params.spaceDepth} disabled={isPlaying} onChange={(v) => onParamChange('spaceDepth', v)} />
          <SliderRow label="Rhythm" hint="drone - pulse" value={params.rhythm} disabled={isPlaying} onChange={(v) => onParamChange('rhythm', v)} />
          <SliderRow label="Timbre" hint="sine - complex" value={params.timbre} disabled={isPlaying} onChange={(v) => onParamChange('timbre', v)} />

          <div style={{ borderTop: '1px solid #444', margin: '12px 0' }} />

          {/* Visual controls */}
          <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '11px', opacity: 0.7 }}>
            Visual Controls
          </div>

          {/* Tracer Count */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              Tracers: {activeTracers}
              <span style={{ fontSize: '10px', opacity: 0.6 }}> (50-500)</span>
            </label>
            <input type="range" min="50" max="500" step="10" value={activeTracers}
              onChange={(e) => onTracerChange(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Trail Length */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              Trail Length: {trailLength}
              <span style={{ fontSize: '10px', opacity: 0.6 }}> (2-100)</span>
            </label>
            <input type="range" min="2" max="100" step="1" value={trailLength}
              onChange={(e) => onTrailChange(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Bloom */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              Bloom: {bloomIntensity.toFixed(1)}
              <span style={{ fontSize: '10px', opacity: 0.6 }}> (0 clean - 4 intense)</span>
            </label>
            <input type="range" min="0" max="4" step="0.1" value={bloomIntensity}
              onChange={(e) => onBloomChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </>
  )
}

function FeatureBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
      <span style={{ width: '85px', fontSize: '10px', opacity: 0.8 }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(value * 100, 100)}%`,
          height: '100%',
          background: color,
          borderRadius: '3px',
          transition: 'width 0.1s ease-out'
        }} />
      </div>
      <span style={{ width: '30px', textAlign: 'right', fontSize: '10px', opacity: 0.6 }}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function SliderRow({ label, hint, value, disabled, onChange }: {
  label: string; hint: string; value: number; disabled: boolean; onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: '10px', opacity: disabled ? 0.5 : 1 }}>
      <label style={{ display: 'block', marginBottom: '3px' }}>
        {label}: {value.toFixed(2)}
        <span style={{ fontSize: '10px', opacity: 0.6 }}> ({hint})</span>
      </label>
      <input type="range" min="0" max="1" step="0.01" value={value} disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}
