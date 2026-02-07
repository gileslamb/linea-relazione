import * as THREE from 'three'
import { AgentState, Neighbor } from './types'
import { limit, setMagnitude } from '../utils/math'

/**
 * Cohesion: steer toward average position of neighbors
 */
export function cohesion(
  agent: AgentState,
  neighbors: Neighbor[],
  strength: number
): THREE.Vector3 {
  if (neighbors.length === 0) return new THREE.Vector3()

  const steering = new THREE.Vector3()
  
  // Calculate center of mass of neighbors
  for (const neighbor of neighbors) {
    steering.add(neighbor.agent.position)
  }
  steering.divideScalar(neighbors.length)
  
  // Steer toward it
  steering.sub(agent.position)
  
  if (steering.lengthSq() > 0) {
    setMagnitude(steering, agent.velocity.length()) // desired velocity
    steering.sub(agent.velocity) // steering = desired - current
    limit(steering, strength)
  }
  
  return steering
}

/**
 * Alignment: match average velocity of neighbors
 */
export function alignment(
  agent: AgentState,
  neighbors: Neighbor[],
  strength: number
): THREE.Vector3 {
  if (neighbors.length === 0) return new THREE.Vector3()

  const steering = new THREE.Vector3()
  
  // Calculate average velocity
  for (const neighbor of neighbors) {
    steering.add(neighbor.agent.velocity)
  }
  steering.divideScalar(neighbors.length)
  
  if (steering.lengthSq() > 0) {
    setMagnitude(steering, agent.velocity.length()) // desired velocity
    steering.sub(agent.velocity) // steering = desired - current
    limit(steering, strength)
  }
  
  return steering
}

/**
 * Separation: steer away from neighbors that are too close
 */
export function separation(
  agent: AgentState,
  neighbors: Neighbor[],
  strength: number,
  separationRadius: number
): THREE.Vector3 {
  const steering = new THREE.Vector3()
  let count = 0

  for (const neighbor of neighbors) {
    if (neighbor.distance < separationRadius && neighbor.distance > 0) {
      const diff = new THREE.Vector3()
        .subVectors(agent.position, neighbor.agent.position)
        .normalize()
        .divideScalar(neighbor.distance) // weight by distance (closer = stronger)
      
      steering.add(diff)
      count++
    }
  }

  if (count > 0) {
    steering.divideScalar(count)
    
    if (steering.lengthSq() > 0) {
      setMagnitude(steering, agent.velocity.length())
      steering.sub(agent.velocity)
      limit(steering, strength)
    }
  }

  return steering
}

/**
 * Boundary containment: soft spherical bounds
 */
export function boundSphere(
  agent: AgentState,
  radius: number,
  strength: number
): THREE.Vector3 {
  const distance = agent.position.length()
  
  if (distance > radius) {
    const steering = agent.position.clone().normalize().multiplyScalar(-1)
    setMagnitude(steering, agent.velocity.length())
    steering.sub(agent.velocity)
    
    // Stronger force the further outside bounds
    const factor = (distance - radius) / radius
    return limit(steering, strength * (1 + factor))
  }
  
  return new THREE.Vector3()
}

/**
 * Shape types for formation behaviors
 */
export type ShapeType = 'circle' | 'figure8' | 'sphere' | 'spiral' | 'none'

/**
 * Shape attraction: draw agents toward geometric formations
 * Creates dancing, form-creating behavior when rhythm is high
 */
export function shapeAttraction(
  agent: AgentState,
  time: number,
  strength: number,
  shapeType: ShapeType
): THREE.Vector3 {
  if (shapeType === 'none' || strength === 0) {
    return new THREE.Vector3()
  }

  let target = new THREE.Vector3()
  
  // Use agent's unique phase offset for organic distribution
  const phaseOffset = (agent.age * 0.002) + (parseInt(agent.id, 36) % 100) * 0.1
  
  switch (shapeType) {
    case 'circle': {
      // Agents distribute around a rotating circle
      const angle = phaseOffset + time * 0.3
      const radius = 120
      target.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.3, // Flattened ellipse
        Math.sin(angle * 0.7) * radius * 0.5
      )
      break
    }
    
    case 'figure8': {
      // Lemniscate (figure-8) pattern
      const t = phaseOffset + time * 0.4
      const scale = 150
      target.set(
        Math.sin(t) * scale,
        Math.sin(t * 2) * scale * 0.4,
        Math.cos(t) * scale * 0.3
      )
      break
    }
    
    case 'sphere': {
      // Agents attracted to sphere surface
      const theta = phaseOffset * 2 + time * 0.2
      const phi = (phaseOffset * 3 + time * 0.15) % Math.PI
      const radius = 140
      target.set(
        Math.sin(phi) * Math.cos(theta) * radius,
        Math.cos(phi) * radius,
        Math.sin(phi) * Math.sin(theta) * radius
      )
      break
    }
    
    case 'spiral': {
      // 3D spiral helix
      const t = phaseOffset + time * 0.5
      const radius = 80 + Math.sin(t * 0.3) * 40
      const height = Math.sin(t * 0.2) * 100
      target.set(
        Math.cos(t * 2) * radius,
        height,
        Math.sin(t * 2) * radius
      )
      break
    }
  }
  
  // Calculate steering toward target
  const desired = target.clone().sub(agent.position)
  const distance = desired.length()
  
  // Arrival behavior: slow down as we approach target
  const arrivalRadius = 50
  if (distance < arrivalRadius) {
    const speed = (distance / arrivalRadius) * agent.velocity.length()
    setMagnitude(desired, speed)
  } else {
    setMagnitude(desired, agent.velocity.length())
  }
  
  const steering = desired.sub(agent.velocity)
  limit(steering, strength)
  
  return steering
}

/**
 * Rhythmic pulse: periodic acceleration that creates
 * synchronized "breathing" movement
 */
export function rhythmicPulse(
  agent: AgentState,
  time: number,
  strength: number
): THREE.Vector3 {
  if (strength === 0) return new THREE.Vector3()
  
  // Create wave that propagates through space
  const spatialPhase = 
    agent.position.x * 0.01 + 
    agent.position.y * 0.008 + 
    agent.position.z * 0.012
  
  const pulse = Math.sin(time * 2 + spatialPhase) * strength
  
  // Pulse outward from center then return
  const direction = agent.position.clone().normalize()
  
  return direction.multiplyScalar(pulse * 1.5)
}
