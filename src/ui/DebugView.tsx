import { MusicalForces } from '../forces/types'

interface DebugViewProps {
  agentCount: number
  fps: number
  musicalForces: MusicalForces
  onForceChange: (force: keyof MusicalForces, value: number) => void
}

/**
 * Debug panel with musical force sliders
 * 
 * Each slider represents a musical concept that intuitively maps
 * to visual behavior, making the interface more expressive and
 * accessible than raw behavior parameters.
 */
export function DebugView({ agentCount, fps, musicalForces, onForceChange }: DebugViewProps) {
  const sliderStyle = { width: '100%', cursor: 'pointer' }
  const labelStyle = { display: 'block', marginBottom: '3px' }
  const hintStyle = { fontSize: '10px', opacity: 0.6, marginLeft: '4px' }

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
      borderRadius: '8px',
      minWidth: '280px',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#a0d0ff' }}>
        Linea Relazione
      </div>
      
      <div style={{ marginBottom: '15px', opacity: 0.7 }}>
        <div>Agents: {agentCount}</div>
        <div>FPS: {fps}</div>
      </div>

      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#80b0ff' }}>
        Musical Forces:
      </div>
      
      {/* Harmony: dissonance ← → consonance */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Harmony: {musicalForces.harmony.toFixed(2)}
          <span style={hintStyle}>(dissonance ← → consonance)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicalForces.harmony}
          onChange={(e) => onForceChange('harmony', parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Flow: staccato ← → legato */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Flow: {musicalForces.flow.toFixed(2)}
          <span style={hintStyle}>(staccato ← → legato)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicalForces.flow}
          onChange={(e) => onForceChange('flow', parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Density: sparse ← → dense */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Density: {musicalForces.density.toFixed(2)}
          <span style={hintStyle}>(sparse ← → dense)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicalForces.density}
          onChange={(e) => onForceChange('density', parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Space Depth: flat ← → deep */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Space Depth: {musicalForces.spaceDepth.toFixed(2)}
          <span style={hintStyle}>(flat ← → deep)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicalForces.spaceDepth}
          onChange={(e) => onForceChange('spaceDepth', parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Rhythm: drone ← → pulse */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Rhythm: {musicalForces.rhythm.toFixed(2)}
          <span style={hintStyle}>(drone ← → pulse)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicalForces.rhythm}
          onChange={(e) => onForceChange('rhythm', parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Timbre: dark ← → bright */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          Timbre: {musicalForces.timbre.toFixed(2)}
          <span style={hintStyle}>(dark ← → bright)</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicalForces.timbre}
          onChange={(e) => onForceChange('timbre', parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={{ marginTop: '15px', fontSize: '10px', opacity: 0.5, lineHeight: '1.4' }}>
        Controls: Mouse to orbit • Scroll to zoom<br/>
        Try: Harmony↑ Flow↑ = graceful dance<br/>
        Harmony↓ Rhythm↑ = chaotic pulse
      </div>
    </div>
  )
}
