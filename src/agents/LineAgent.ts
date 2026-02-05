import * as THREE from 'three'
import { AgentState, BehaviorParams, Neighbor } from './types'
import { limit } from '../utils/math'
import { cohesion, alignment, separation, boundSphere } from './behaviors'
import { MOVEMENT_PARAMS } from '../utils/constants'

export class LineAgent {
  public state: AgentState
  private params: BehaviorParams
  private previousVelocity: THREE.Vector3  // For velocity smoothing
  private tumbleRotation: number           // Gentle rotation accumulator

  constructor(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    params: BehaviorParams
  ) {
    this.state = {
      position: position.clone(),
      velocity: velocity.clone(),
      acceleration: new THREE.Vector3(),
      id: Math.random().toString(36).substr(2, 9),
      age: 0
    }
    this.params = params
    this.previousVelocity = velocity.clone()
    this.tumbleRotation = Math.random() * Math.PI * 2  // Random initial rotation
  }

  /**
   * Find neighbors within perception radius
   */
  getNeighbors(allAgents: AgentState[]): Neighbor[] {
    const neighbors: Neighbor[] = []

    for (const other of allAgents) {
      if (other.id === this.state.id) continue

      const distance = this.state.position.distanceTo(other.position)
      
      if (distance < this.params.perceptionRadius) {
        neighbors.push({ agent: other, distance })
      }
    }

    return neighbors
  }

  /**
   * Apply flocking behaviors
   */
  flock(neighbors: Neighbor[]): void {
    const cohesionForce = cohesion(this.state, neighbors, this.params.cohesionStrength)
    const alignmentForce = alignment(this.state, neighbors, this.params.alignmentStrength)
    const separationForce = separation(
      this.state,
      neighbors,
      this.params.separationStrength,
      this.params.separationRadius
    )

    this.state.acceleration.add(cohesionForce)
    this.state.acceleration.add(alignmentForce)
    this.state.acceleration.add(separationForce)
  }

  /**
   * Keep within bounds
   */
  constrain(bounds: THREE.Vector3): void {
    const boundRadius = Math.min(bounds.x, bounds.y, bounds.z) / 2
    const boundForce = boundSphere(this.state, boundRadius, 0.3)  // Softer boundary
    this.state.acceleration.add(boundForce)
  }

  /**
   * Add gentle spiral tendency (like dancers spinning)
   */
  private addSpiralDrift(): void {
    if (this.state.velocity.lengthSq() > 0.1) {
      // Create perpendicular force to velocity (creates spiral)
      const perpendicular = new THREE.Vector3()
        .crossVectors(this.state.velocity, new THREE.Vector3(0, 1, 0))
        .normalize()
        .multiplyScalar(MOVEMENT_PARAMS.spiralTendency)
      
      this.state.acceleration.add(perpendicular)
    }
  }

  /**
   * Apply wave propagation for murmuration swoops
   */
  applyWave(time: number): void {
    // Create traveling wave based on position and time
    // Multiple frequencies create complex, organic motion
    const wavePhase = 
      (this.state.position.x * 0.01 + 
       this.state.position.y * 0.008 + 
       time * MOVEMENT_PARAMS.waveSpeed) % (Math.PI * 2)
    
    const waveForce = new THREE.Vector3(
      Math.sin(wavePhase) * MOVEMENT_PARAMS.waveMagnitude,
      Math.cos(wavePhase * 1.3) * MOVEMENT_PARAMS.waveMagnitude,  // Different frequency
      Math.sin(wavePhase * 0.7) * MOVEMENT_PARAMS.waveMagnitude * 0.5
    )
    
    this.state.acceleration.add(waveForce.multiplyScalar(0.01))
  }

  /**
   * Update position and velocity with grace mechanics
   */
  update(_time: number): void {
    // Add spiral drift
    this.addSpiralDrift()

    // Update velocity from acceleration
    this.state.velocity.add(this.state.acceleration)
    limit(this.state.velocity, this.params.maxSpeed)

    // CRITICAL: Velocity smoothing creates inertia (grace)
    // Blend current velocity with previous velocity
    this.state.velocity.lerp(
      this.previousVelocity, 
      1 - MOVEMENT_PARAMS.velocitySmoothing
    )
    this.previousVelocity.copy(this.state.velocity)

    // Update position
    this.state.position.add(this.state.velocity)

    // Gentle tumble rotation (accumulates over time)
    this.tumbleRotation += MOVEMENT_PARAMS.tumbleSpeed

    // Reset acceleration for next frame
    this.state.acceleration.multiplyScalar(0)

    // Increment age
    this.state.age++
  }

  /**
   * Get current tumble rotation for rendering
   */
  getTumbleRotation(): number {
    return this.tumbleRotation
  }

  /**
   * Update behavior parameters (for live tuning)
   */
  updateParams(params: Partial<BehaviorParams>): void {
    this.params = { ...this.params, ...params }
  }
}
