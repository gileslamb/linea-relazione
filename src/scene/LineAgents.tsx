import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LineAgent } from '../agents/LineAgent'
import { VISUAL_PARAMS } from '../utils/constants'

interface LineAgentsProps {
  agents: LineAgent[]  // Changed from AgentState[] to LineAgent[]
}

export function LineAgents({ agents }: LineAgentsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const trailMeshRef = useRef<THREE.InstancedMesh>(null!)
  
  // Store previous positions for trails (history)
  const trailHistoryRef = useRef<Map<string, THREE.Vector3[]>>(new Map())

  // Line geometry - thin cylinder
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      VISUAL_PARAMS.lineThickness / 2,
      VISUAL_PARAMS.lineThickness / 2,
      VISUAL_PARAMS.lineLength,
      6,  // Fewer segments for performance
      1
    )
    geometry.rotateZ(Math.PI / 2)  // Point along X axis
    return geometry
  }, [])

  // Main line material - with optional additive blending
  const lineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: VISUAL_PARAMS.lineColor,
      transparent: true,
      opacity: VISUAL_PARAMS.lineOpacity,
      blending: VISUAL_PARAMS.useAdditiveBlending 
        ? THREE.AdditiveBlending 
        : THREE.NormalBlending,
      depthWrite: false  // CRITICAL for proper blending
    })
  }, [])

  // Trail material - lower opacity than main lines
  const trailMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: VISUAL_PARAMS.lineColor,
      transparent: true,
      opacity: VISUAL_PARAMS.lineOpacity * 0.3,  // Fainter than main lines
      blending: VISUAL_PARAMS.useAdditiveBlending 
        ? THREE.AdditiveBlending 
        : THREE.NormalBlending,
      depthWrite: false
    })
  }, [])

  // Calculate total instances needed for all trails
  const totalTrailInstances = VISUAL_PARAMS.useTrails 
    ? agents.length * VISUAL_PARAMS.trailLength 
    : 0

  // Update instances every frame
  useFrame(() => {
    if (!meshRef.current) return

    const dummy = new THREE.Object3D()

    // ===== UPDATE MAIN LINE INSTANCES =====
    agents.forEach((agent, i) => {
      const state = agent.state

      // Update trail history for this agent
      if (VISUAL_PARAMS.useTrails) {
        if (!trailHistoryRef.current.has(state.id)) {
          trailHistoryRef.current.set(state.id, [])
        }
        
        const history = trailHistoryRef.current.get(state.id)!
        history.unshift(state.position.clone())  // Add current position to front
        
        // Limit trail length
        if (history.length > VISUAL_PARAMS.trailLength) {
          history.pop()
        }
      }

      // Set position
      dummy.position.copy(state.position)

      // Rotate to face velocity direction
      if (state.velocity.lengthSq() > 0.01) {
        const dir = state.velocity.clone().normalize()
        dummy.quaternion.setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),  // Default forward
          dir  // Velocity direction
        )
        
        // Add gentle tumble rotation around velocity axis
        const tumble = agent.getTumbleRotation()
        dummy.rotateOnAxis(dir, tumble)
      }

      // Motion blur: stretch line based on velocity
      if (VISUAL_PARAMS.useMotionBlur) {
        const speed = state.velocity.length()
        const stretch = 1 + (speed * 0.3)  // Subtle stretch
        dummy.scale.set(stretch, 1, 1)
      } else {
        dummy.scale.set(1, 1, 1)
      }

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true

    // ===== UPDATE TRAIL INSTANCES =====
    if (VISUAL_PARAMS.useTrails && trailMeshRef.current) {
      let instanceIndex = 0

      agents.forEach((agent) => {
        const history = trailHistoryRef.current.get(agent.state.id)
        if (!history) return

        history.forEach((pos, trailIndex) => {
          if (trailIndex === 0) return // Skip current position (already rendered as main line)
          
          dummy.position.copy(pos)

          // Face same direction as agent
          if (agent.state.velocity.lengthSq() > 0.01) {
            const dir = agent.state.velocity.clone().normalize()
            dummy.quaternion.setFromUnitVectors(
              new THREE.Vector3(1, 0, 0),
              dir
            )
          }

          // Fade and shrink older trail segments
          const fade = 1 - (trailIndex / VISUAL_PARAMS.trailLength)
          dummy.scale.set(fade, fade, fade)

          dummy.updateMatrix()
          
          if (instanceIndex < totalTrailInstances) {
            trailMeshRef.current!.setMatrixAt(instanceIndex, dummy.matrix)
            instanceIndex++
          }
        })
      })

      trailMeshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {/* Main lines */}
      <instancedMesh
        ref={meshRef}
        args={[lineGeometry, lineMaterial, agents.length]}
        frustumCulled={false}
      />

      {/* Trail lines (only if enabled) */}
      {VISUAL_PARAMS.useTrails && (
        <instancedMesh
          ref={trailMeshRef}
          args={[lineGeometry, trailMaterial, totalTrailInstances]}
          frustumCulled={false}
        />
      )}
    </>
  )
}
