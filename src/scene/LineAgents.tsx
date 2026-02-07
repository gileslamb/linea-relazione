import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'
import { LineAgent } from '../agents/LineAgent'

interface LineAgentsProps {
  agents: LineAgent[]
  curveIntensity?: number  // 0-1, how much curve in the ribbons
  lineWidth?: number       // Line thickness
  opacity?: number         // Line opacity
}

/**
 * Renders agents as flowing curved ribbons instead of rigid cylinders.
 * 
 * Each agent becomes a quadratic bezier curve that bends based on:
 * - Velocity direction (determines start/end points)
 * - Perpendicular offset (creates curve)
 * - Flow intensity (controls curve amount)
 */
export function LineAgents({ 
  agents, 
  curveIntensity = 0.6,
  lineWidth = 2,
  opacity = 0.7 
}: LineAgentsProps) {
  
  // Store curve data for each agent
  const curveData = useMemo(() => {
    return agents.map(() => ({
      start: new THREE.Vector3(),
      mid: new THREE.Vector3(),
      end: new THREE.Vector3()
    }))
  }, [agents.length])

  // Update curve positions every frame
  useFrame(() => {
    agents.forEach((agent, i) => {
      if (!curveData[i]) return
      
      const pos = agent.state.position
      const vel = agent.state.velocity.clone()
      const speed = vel.length()
      
      // Scale ribbon length based on speed (faster = longer ribbon)
      const ribbonLength = 10 + speed * 4
      vel.normalize().multiplyScalar(ribbonLength)
      
      // Calculate start and end points along velocity direction
      curveData[i].start.copy(pos).sub(vel)
      curveData[i].end.copy(pos).add(vel)
      
      // Calculate control point (perpendicular offset creates curve)
      // Use a consistent "up" reference but handle degenerate cases
      const up = Math.abs(vel.y) > 0.99 
        ? new THREE.Vector3(1, 0, 0) 
        : new THREE.Vector3(0, 1, 0)
      
      const perpendicular = new THREE.Vector3()
        .crossVectors(vel, up)
        .normalize()
      
      // Add some variation based on agent's unique characteristics
      const tumble = agent.getTumbleRotation()
      const curveAmount = (Math.sin(tumble) * 0.5 + 0.5) * curveIntensity * 15
      
      // Offset the midpoint perpendicular to velocity to create curve
      curveData[i].mid
        .copy(pos)
        .add(perpendicular.multiplyScalar(curveAmount))
    })
  })

  return (
    <group>
      {agents.map((agent, i) => {
        if (!curveData[i]) return null
        
        // Get initial positions (will be updated by useFrame)
        const pos = agent.state.position
        const vel = agent.state.velocity.clone().normalize().multiplyScalar(15)
        const start = pos.clone().sub(vel)
        const end = pos.clone().add(vel)
        
        // Calculate initial midpoint
        const up = Math.abs(vel.y) > 0.99 
          ? new THREE.Vector3(1, 0, 0) 
          : new THREE.Vector3(0, 1, 0)
        const perpendicular = new THREE.Vector3()
          .crossVectors(vel, up)
          .normalize()
          .multiplyScalar(curveIntensity * 10)
        const mid = pos.clone().add(perpendicular)
        
        return (
          <FlowingRibbon
            key={agent.state.id}
            agent={agent}
            curveIntensity={curveIntensity}
            lineWidth={lineWidth}
            opacity={opacity}
            initialStart={start}
            initialMid={mid}
            initialEnd={end}
          />
        )
      })}
    </group>
  )
}

/**
 * Individual flowing ribbon component
 * Updates its curve every frame based on agent state
 */
interface FlowingRibbonProps {
  agent: LineAgent
  curveIntensity: number
  lineWidth: number
  opacity: number
  initialStart: THREE.Vector3
  initialMid: THREE.Vector3
  initialEnd: THREE.Vector3
}

function FlowingRibbon({ 
  agent, 
  curveIntensity, 
  lineWidth, 
  opacity,
  initialStart,
  initialMid,
  initialEnd
}: FlowingRibbonProps) {
  // Mutable refs for curve points
  const curveRef = useMemo(() => ({
    start: initialStart.clone(),
    mid: initialMid.clone(),
    end: initialEnd.clone()
  }), [])

  useFrame(() => {
    const pos = agent.state.position
    const vel = agent.state.velocity.clone()
    const speed = vel.length()
    
    // Dynamic ribbon length based on speed
    const ribbonLength = 10 + speed * 4
    vel.normalize().multiplyScalar(ribbonLength)
    
    // Update start and end
    curveRef.start.copy(pos).sub(vel)
    curveRef.end.copy(pos).add(vel)
    
    // Calculate perpendicular for curve
    const up = Math.abs(vel.y / (speed || 1)) > 0.99 
      ? new THREE.Vector3(1, 0, 0) 
      : new THREE.Vector3(0, 1, 0)
    
    const perpendicular = new THREE.Vector3()
      .crossVectors(vel, up)
      .normalize()
    
    // Oscillating curve intensity for organic feel
    const tumble = agent.getTumbleRotation()
    const curveAmount = (Math.sin(tumble * 2) * 0.5 + 0.5) * curveIntensity * 15
    
    // Add some height variation too
    const heightOffset = Math.cos(tumble * 1.5) * curveIntensity * 5
    
    curveRef.mid
      .copy(pos)
      .add(perpendicular.multiplyScalar(curveAmount))
      .add(new THREE.Vector3(0, heightOffset, 0))
  })

  // Color varies subtly with agent age for visual variety
  const hue = (agent.state.age * 0.001) % 1
  const color = new THREE.Color().setHSL(0.55 + hue * 0.1, 0.3, 0.85) // Blue-white range

  return (
    <QuadraticBezierLine
      start={curveRef.start}
      end={curveRef.end}
      mid={curveRef.mid}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthWrite={false}
      // @ts-expect-error - blending is valid for Line2
      blending={THREE.AdditiveBlending}
    />
  )
}
