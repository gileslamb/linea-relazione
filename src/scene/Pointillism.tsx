import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LineAgent } from '../agents/LineAgent'

interface PointillismProps {
  agents: LineAgent[]
}

export function Pointillism({ agents }: PointillismProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  
  const geometry = useMemo(() => new THREE.BufferGeometry(), [])
  const material = useMemo(() => new THREE.PointsMaterial({
    size: 3,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [])

  useFrame(() => {
    if (!pointsRef.current) return
    
    const positions = new Float32Array(agents.length * 3)
    
    agents.forEach((agent, i) => {
      const pos = agent.state.position
      positions[i * 3] = pos.x
      positions[i * 3 + 1] = pos.y
      positions[i * 3 + 2] = pos.z
    })
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
