import * as THREE from 'three'
import { LineAgent } from './LineAgent'
import { AgentSystemConfig, BehaviorParams } from './types'
import { SpatialGrid } from '../utils/spatial'
import { randomInSphere, randomRange } from '../utils/math'

export class AgentSystem {
  private agents: LineAgent[] = []
  private config: AgentSystemConfig
  private params: BehaviorParams
  private spatialGrid: SpatialGrid

  constructor(config: AgentSystemConfig, params: BehaviorParams) {
    this.config = config
    this.params = params
    
    // Initialize spatial grid with cell size = perception radius
    this.spatialGrid = new SpatialGrid(params.perceptionRadius, config.bounds)
    
    // Spawn initial agents
    this.spawnAgents(config.initialCount)
  }

  /**
   * Spawn new agents
   */
  private spawnAgents(count: number): void {
    const spawnRadius = Math.min(
      this.config.bounds.x,
      this.config.bounds.y,
      this.config.bounds.z
    ) / 3

    for (let i = 0; i < count; i++) {
      const position = randomInSphere(spawnRadius)
      
      // Random initial velocity
      const velocity = new THREE.Vector3(
        randomRange(-1, 1),
        randomRange(-1, 1),
        randomRange(-1, 1)
      ).normalize().multiplyScalar(randomRange(0.5, 2))

      const agent = new LineAgent(position, velocity, this.params)
      this.agents.push(agent)
    }
  }

  /**
   * Update all agents
   */
  update(): void {
    // Rebuild spatial grid
    this.spatialGrid.clear()
    for (const agent of this.agents) {
      this.spatialGrid.insert(agent.state)
    }

    // Update each agent
    for (const agent of this.agents) {
      // Use spatial grid for efficient neighbor query
      const nearbyAgents = this.spatialGrid.query(
        agent.state.position,
        this.params.perceptionRadius,
        agent.state.id
      )

      // Convert to Neighbor format
      const neighbors = nearbyAgents.map(other => ({
        agent: other,
        distance: agent.state.position.distanceTo(other.position)
      }))

      // Apply behaviors
      agent.flock(neighbors)
      agent.constrain(this.config.bounds)
      agent.update()
    }
  }

  /**
   * Get all agent states for rendering
   */
  getAgentStates() {
    return this.agents.map(a => a.state)
  }

  /**
   * Get agent count
   */
  getCount(): number {
    return this.agents.length
  }

  /**
   * Update behavior parameters for all agents
   */
  updateParams(params: Partial<BehaviorParams>): void {
    this.params = { ...this.params, ...params }
    for (const agent of this.agents) {
      agent.updateParams(this.params)
    }
  }

  /**
   * Add agents
   */
  addAgents(count: number): void {
    if (this.agents.length + count <= this.config.maxAgents) {
      this.spawnAgents(count)
    }
  }

  /**
   * Remove agents
   */
  removeAgents(count: number): void {
    this.agents.splice(0, Math.min(count, this.agents.length))
  }
}
