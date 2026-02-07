import { WaveParams } from '../field/waveField'
import { AudioFeatures } from '../audio/featureExtractor'

interface MusicalForcesProps {
  params: WaveParams
  onParamChange: (param: keyof WaveParams, value: number) => void
  fps: number
  tracerCount: number
  trailLength: number
  onTrailChange: (length: number) => void
  isPlaying: boolean
  audioFeatures: AudioFeatures | null
}

export function MusicalForces({
  params, onParamChange, fps, tracerCount,
  trailLength, onTrailChange,
  isPlaying, audioFeatures
}: MusicalForcesProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '15px',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '4px',
      minWidth: '280px',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Wave Field - Musical Parameters
      </div>

      <div style={{ marginBottom: '10px', fontSize: '11px', opacity: 0.7 }}>
        {isPlaying
          ? 'Audio is driving wave field parameters'
          : 'Lines are disturbances in a continuous wave field'
        }
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div>Tracers: {tracerCount}</div>
        <div>FPS: {fps}</div>
        {isPlaying && (
          <div style={{ color: '#0f0', fontWeight: 'bold', marginTop: '4px' }}>
            LIVE AUDIO
          </div>
        )}
      </div>

      {/* Live Audio Features readout */}
      {isPlaying && audioFeatures && (
        <>
          <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#0f0', fontSize: '11px' }}>
            Audio Features:
          </div>
          <div style={{ marginBottom: '12px', fontSize: '11px', lineHeight: '1.6' }}>
            <FeatureBar label="RMS (energy)" value={audioFeatures.rms} color="#4f4" />
            <FeatureBar label="Bass" value={audioFeatures.low} color="#f44" />
            <FeatureBar label="Mid" value={audioFeatures.mid} color="#fa4" />
            <FeatureBar label="High" value={audioFeatures.high} color="#4af" />
            <FeatureBar label="Brightness" value={audioFeatures.spectralCentroid} color="#f4f" />
            <div style={{ fontSize: '10px', opacity: 0.6 }}>
              {audioFeatures.onset ? '*** ONSET ***' : ''}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', marginBottom: '10px' }} />
        </>
      )}

      {/* Harmony/Dissonance */}
      <SliderRow
        label="Harmony"
        hint="destructive - constructive"
        value={params.harmony}
        disabled={isPlaying}
        onChange={(v) => onParamChange('harmony', v)}
      />

      {/* Flow */}
      <SliderRow
        label="Flow"
        hint="staccato - legato"
        value={params.flow}
        disabled={isPlaying}
        onChange={(v) => onParamChange('flow', v)}
      />

      {/* Density */}
      <SliderRow
        label="Density"
        hint="sparse - dense"
        value={params.density}
        disabled={isPlaying}
        onChange={(v) => onParamChange('density', v)}
      />

      {/* Space Depth */}
      <SliderRow
        label="Space Depth"
        hint="flat - deep"
        value={params.spaceDepth}
        disabled={isPlaying}
        onChange={(v) => onParamChange('spaceDepth', v)}
      />

      {/* Rhythm */}
      <SliderRow
        label="Rhythm"
        hint="drone - pulse"
        value={params.rhythm}
        disabled={isPlaying}
        onChange={(v) => onParamChange('rhythm', v)}
      />

      {/* Timbre */}
      <SliderRow
        label="Timbre"
        hint="sine - complex"
        value={params.timbre}
        disabled={isPlaying}
        onChange={(v) => onParamChange('timbre', v)}
      />

      {/* Divider */}
      <div style={{ borderTop: '1px solid #444', margin: '12px 0' }} />

      {/* Trail Length - always manual */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '3px' }}>
          Trail Length: {trailLength}
          <span style={{ fontSize: '10px', opacity: 0.6 }}> (short - long linger)</span>
        </label>
        <input
          type="range"
          min="2"
          max="80"
          step="1"
          value={trailLength}
          onChange={(e) => onTrailChange(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

/** Mini horizontal bar showing a 0-1 value */
function FeatureBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
      <span style={{ width: '85px', fontSize: '10px', opacity: 0.8 }}>{label}</span>
      <div style={{
        flex: 1,
        height: '6px',
        background: '#222',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
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

/** Reusable slider row with disabled state for audio-driven mode */
function SliderRow({ label, hint, value, disabled, onChange }: {
  label: string
  hint: string
  value: number
  disabled: boolean
  onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: '10px', opacity: disabled ? 0.5 : 1 }}>
      <label style={{ display: 'block', marginBottom: '3px' }}>
        {label}: {value.toFixed(2)}
        <span style={{ fontSize: '10px', opacity: 0.6 }}> ({hint})</span>
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}
