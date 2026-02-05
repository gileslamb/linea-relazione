import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LineAgent } from '../agents/LineAgent'

interface CloudParticlesProps {
  agents: LineAgent[]
}

export function CloudParticles({ agents }: CloudParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  
  const particleCount = agents.length * 5 // 5 particles per agent
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [particleCount])
  
  const material = useMemo(() => new THREE.PointsMaterial({
    size: 2,
    color: 0xaaccff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [])

  useFrame(() => {
    if (!pointsRef.current) return
    
    const positions = geometry.attributes.position.array as Float32Array
    
    agents.forEach((agent, i) => {
      const pos = agent.state.position
      
      // Create small cloud around each agent
      for (let j = 0; j < 5; j++) {
        const idx = (i * 5 + j) * 3
        const offset = 15
        
        positions[idx] = pos.x + (Math.random() - 0.5) * offset
        positions[idx + 1] = pos.y + (Math.random() - 0.5) * offset
        positions[idx + 2] = pos.z + (Math.random() - 0.5) * offset
      }
    })
    
    geometry.attributes.position.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
