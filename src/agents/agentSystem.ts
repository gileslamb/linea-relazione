import * as THREE from 'three'
import { LineAgent } from './LineAgent'
import { AgentSystemConfig, BehaviorParams } from './types'
import { SpatialGrid } from '../utils/spatial'
import { randomInSphere, randomRange } from '../utils/math'
import { ShapeType } from './behaviors'

export class AgentSystem {
  private agents: LineAgent[] = []
  private config: AgentSystemConfig
  private params: BehaviorParams
  private spatialGrid: SpatialGrid
  private time: number = 0  // Track time for wave propagation
  
  // Musical force parameters
  private shapeType: ShapeType = 'none'
  private shapeStrength: number = 0
  private rhythmStrength: number = 0

  constructor(config: AgentSystemConfig, params: BehaviorParams) {
    this.config = config
    this.params = params
    
    this.spatialGrid = new SpatialGrid(params.perceptionRadius, config.bounds)
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
      
      // Random initial velocity with slight upward bias (like birds)
      const velocity = new THREE.Vector3(
        randomRange(-1, 1),
        randomRange(-0.5, 1.5),  // Upward bias
        randomRange(-1, 1)
      ).normalize().multiplyScalar(randomRange(1, 3))

      const agent = new LineAgent(position, velocity, this.params)
      this.agents.push(agent)
    }
  }

  /**
   * Update all agents
   */
  update(): void {
    this.time += 0.016  // Approximate 60fps timestep

    // Rebuild spatial grid for efficient neighbor queries
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
      agent.applyWave(this.time)
      
      // Apply musical force behaviors
      agent.applyShape(this.time, this.shapeStrength, this.shapeType)
      agent.applyRhythm(this.time, this.rhythmStrength)
      
      agent.update(this.time)
    }
  }

  /**
   * Get all agent states for rendering (deprecated, use getAgents)
   */
  getAgentStates() {
    return this.agents.map(a => a.state)
  }

  /**
   * Get full agent objects (needed for trails and rotation)
   */
  getAgents(): LineAgent[] {
    return this.agents
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
    
    // Update spatial grid if perception changed
    if (params.perceptionRadius) {
      this.spatialGrid = new SpatialGrid(params.perceptionRadius, this.config.bounds)
    }
    
    for (const agent of this.agents) {
      agent.updateParams(this.params)
    }
  }

  /**
   * Set shape formation parameters
   */
  setShapeBehavior(shapeType: ShapeType, strength: number): void {
    this.shapeType = shapeType
    this.shapeStrength = strength
  }

  /**
   * Set rhythmic pulse strength
   */
  setRhythmStrength(strength: number): void {
    this.rhythmStrength = strength
  }

  /**
   * Add agents dynamically
   */
  addAgents(count: number): void {
    if (this.agents.length + count <= this.config.maxAgents) {
      this.spawnAgents(count)
    }
  }

  /**
   * Remove agents dynamically
   */
  removeAgents(count: number): void {
    this.agents.splice(0, Math.min(count, this.agents.length))
  }
}
