import React from 'react'
import './index.css'

function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <h1>Linea Relazione</h1>
      <p>Sound, line, and emergent meaning</p>
      <p style={{ marginTop: '2rem', opacity: 0.6 }}>
        Phase 0: Foundation ✓
      </p>
      <p style={{ opacity: 0.6 }}>
        Next: Phase 1 - Core Agent System
      </p>
    </div>
  )
}

export default App
