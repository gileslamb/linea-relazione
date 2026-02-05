import * as THREE from 'three'
import { AgentState, BehaviorParams, Neighbor } from './types'
import { limit } from '../utils/math'
import { cohesion, alignment, separation, boundSphere } from './behaviors'

export class LineAgent {
  public state: AgentState
  private params: BehaviorParams

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
    // Calculate steering forces
    const cohesionForce = cohesion(this.state, neighbors, this.params.cohesionStrength)
    const alignmentForce = alignment(this.state, neighbors, this.params.alignmentStrength)
    const separationForce = separation(
      this.state,
      neighbors,
      this.params.separationStrength,
      this.params.separationRadius
    )

    // Accumulate forces
    this.state.acceleration.add(cohesionForce)
    this.state.acceleration.add(alignmentForce)
    this.state.acceleration.add(separationForce)
  }

  /**
   * Keep within bounds
   */
  constrain(bounds: THREE.Vector3): void {
    const boundRadius = Math.min(bounds.x, bounds.y, bounds.z) / 2
    const boundForce = boundSphere(this.state, boundRadius, 0.5)
    this.state.acceleration.add(boundForce)
  }

  /**
   * Update position and velocity
   */
  update(): void {
    // Update velocity
    this.state.velocity.add(this.state.acceleration)
    limit(this.state.velocity, this.params.maxSpeed)

    // Update position
    this.state.position.add(this.state.velocity)

    // Reset acceleration
    this.state.acceleration.multiplyScalar(0)

    // Increment age
    this.state.age++
  }

  /**
   * Update behavior parameters (for live tuning)
   */
  updateParams(params: Partial<BehaviorParams>): void {
    this.params = { ...this.params, ...params }
  }
}
