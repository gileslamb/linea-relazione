import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AgentState } from '../agents/types'
import { VISUAL_PARAMS } from '../utils/constants'

interface LineAgentsProps {
  agents: AgentState[]
}

export function LineAgents({ agents }: LineAgentsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const lineGeometry = useMemo(() => {
    // Create a line geometry (cylinder)
    const geometry = new THREE.CylinderGeometry(
      VISUAL_PARAMS.lineThickness / 2,
      VISUAL_PARAMS.lineThickness / 2,
      VISUAL_PARAMS.lineLength,
      8,
      1
    )
    geometry.rotateZ(Math.PI / 2) // Point along X axis initially
    return geometry
  }, [])

  const lineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: VISUAL_PARAMS.lineColor,
      transparent: true,
      opacity: VISUAL_PARAMS.lineOpacity
    })
  }, [])

  // Update instance matrices every frame
  useFrame(() => {
    if (!meshRef.current) return

    const dummy = new THREE.Object3D()

    agents.forEach((agent, i) => {
      // Set position
      dummy.position.copy(agent.position)

      // Rotate to face velocity direction
      if (agent.velocity.lengthSq() > 0.01) {
        const dir = agent.velocity.clone().normalize()
        dummy.quaternion.setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),
          dir
        )
      }

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[lineGeometry, lineMaterial, agents.length]}
    />
  )
}
