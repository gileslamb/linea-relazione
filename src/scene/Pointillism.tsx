import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LineAgent } from '../agents/LineAgent'

interface PointillismProps {
  agents: LineAgent[]
  pointSize?: number      // Base point size
  brightness?: number     // 0-1, affects opacity and color intensity
}

/**
 * Seurat-inspired pointillism layer
 * 
 * Renders bright, glowing dots at agent positions and
 * additional accent dots along trails for effervescent quality.
 */
export function Pointillism({ 
  agents, 
  pointSize = 8, 
  brightness = 0.9 
}: PointillismProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  const accentPointsRef = useRef<THREE.Points>(null!)
  
  // Main points at agent positions
  const mainGeometry = useMemo(() => new THREE.BufferGeometry(), [])
  
  // Main point material - large, bright, glowing
  const mainMaterial = useMemo(() => new THREE.PointsMaterial({
    size: pointSize,
    color: new THREE.Color(1, 1, 1),
    transparent: true,
    opacity: brightness,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true  // Perspective scaling
  }), [pointSize, brightness])

  // Accent points - smaller dots for sparkle effect
  const accentGeometry = useMemo(() => new THREE.BufferGeometry(), [])
  
  const accentMaterial = useMemo(() => new THREE.PointsMaterial({
    size: pointSize * 0.4,
    color: new THREE.Color(0.8, 0.9, 1.0), // Slight blue tint
    transparent: true,
    opacity: brightness * 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  }), [pointSize, brightness])

  useFrame(() => {
    if (!pointsRef.current) return
    
    // Main positions at agent centers
    const mainPositions = new Float32Array(agents.length * 3)
    
    // Accent positions - offset dots for sparkle
    // 2 accent dots per agent (front and back along velocity)
    const accentPositions = new Float32Array(agents.length * 2 * 3)
    
    agents.forEach((agent, i) => {
      const pos = agent.state.position
      const vel = agent.state.velocity.clone().normalize()
      
      // Main point
      mainPositions[i * 3] = pos.x
      mainPositions[i * 3 + 1] = pos.y
      mainPositions[i * 3 + 2] = pos.z
      
      // Accent points - offset along velocity
      const offset1 = vel.clone().multiplyScalar(8)
      const offset2 = vel.clone().multiplyScalar(-8)
      
      // Front accent
      accentPositions[i * 6] = pos.x + offset1.x
      accentPositions[i * 6 + 1] = pos.y + offset1.y
      accentPositions[i * 6 + 2] = pos.z + offset1.z
      
      // Back accent
      accentPositions[i * 6 + 3] = pos.x + offset2.x
      accentPositions[i * 6 + 4] = pos.y + offset2.y
      accentPositions[i * 6 + 5] = pos.z + offset2.z
    })
    
    mainGeometry.setAttribute('position', new THREE.BufferAttribute(mainPositions, 3))
    accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3))
  })

  return (
    <group>
      {/* Main bright dots */}
      <points ref={pointsRef} geometry={mainGeometry} material={mainMaterial} />
      
      {/* Accent sparkle dots */}
      <points ref={accentPointsRef} geometry={accentGeometry} material={accentMaterial} />
    </group>
  )
}
