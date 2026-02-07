import React from 'react'
import { Line } from '@react-three/drei'
import { LineTracer } from '../agents/lineTracer'

interface WaveLinesProps {
  tracers: LineTracer[]
}

export function WaveLines({ tracers }: WaveLinesProps) {
  return (
    <group>
      {tracers.map((tracer) => {
        const path = tracer.getPath()

        return (
          <React.Fragment key={tracer.id}>
            {/* The line trail */}
            {path.length >= 2 && (
              <Line
                points={path}
                color="white"
                lineWidth={3}
                transparent
                opacity={0.9}
              />
            )}

            {/* DEBUG: Dot at current position */}
            <mesh position={tracer.position}>
              <sphereGeometry args={[2, 8, 8]} />
              <meshBasicMaterial color="cyan" />
            </mesh>
          </React.Fragment>
        )
      })}
    </group>
  )
}
