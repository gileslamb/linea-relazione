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
