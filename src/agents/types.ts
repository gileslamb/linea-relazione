import * as THREE from 'three'

export interface AgentState {
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  id: string
  age: number // frames alive
}

export interface BehaviorParams {
  cohesionStrength: number    // 0-2, attraction to neighbors
  alignmentStrength: number   // 0-2, velocity matching
  separationStrength: number  // 0-2, repulsion from neighbors
  maxSpeed: number            // max velocity magnitude
  maxForce: number            // max acceleration magnitude
  perceptionRadius: number    // how far agent can "see"
  separationRadius: number    // personal space threshold
}

export interface AgentSystemConfig {
  maxAgents: number
  spawnRate: number // agents per second (not used in Phase 1, but planned)
  initialCount: number
  bounds: THREE.Vector3 // cube dimensions for containment
}

export interface Neighbor {
  agent: AgentState
  distance: number
}
