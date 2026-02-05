import { BehaviorParams } from '../agents/types'

interface DebugViewProps {
  agentCount: number
  fps: number
  params: BehaviorParams
  onParamChange: (param: keyof BehaviorParams, value: number) => void
}

export function DebugView({ agentCount, fps, params, onParamChange }: DebugViewProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      background: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      padding: '15px',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '4px',
      minWidth: '250px',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Phase 1: Agent System
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div>Agents: {agentCount}</div>
        <div>FPS: {fps}</div>
      </div>

      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Behavior Parameters:</div>
      
      {/* Cohesion */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px' }}>
          Cohesion: {params.cohesionStrength.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={params.cohesionStrength}
          onChange={(e) => onParamChange('cohesionStrength', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Alignment */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px' }}>
          Alignment: {params.alignmentStrength.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={params.alignmentStrength}
          onChange={(e) => onParamChange('alignmentStrength', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Separation */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px' }}>
          Separation: {params.separationStrength.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={params.separationStrength}
          onChange={(e) => onParamChange('separationStrength', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Max Speed */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '3px' }}>
          Max Speed: {params.maxSpeed.toFixed(2)}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={params.maxSpeed}
          onChange={(e) => onParamChange('maxSpeed', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '15px', fontSize: '10px', opacity: 0.6 }}>
        Controls: Mouse to orbit • Scroll to zoom
      </div>
    </div>
  )
}
