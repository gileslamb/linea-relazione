import * as THREE from 'three'
import { AgentState } from '../agents/types'

/**
 * Simple 3D grid for spatial partitioning
 * Allows O(1) neighbor queries instead of O(n²)
 */
export class SpatialGrid {
  private cellSize: number
  private grid: Map<string, AgentState[]>

  constructor(cellSize: number, _bounds: THREE.Vector3) {
    this.cellSize = cellSize
    // bounds reserved for future use (wrap-around behavior)
    this.grid = new Map()
  }

  /**
   * Get grid cell key for position
   */
  private getKey(position: THREE.Vector3): string {
    const x = Math.floor(position.x / this.cellSize)
    const y = Math.floor(position.y / this.cellSize)
    const z = Math.floor(position.z / this.cellSize)
    return `${x},${y},${z}`
  }

  /**
   * Clear grid
   */
  clear(): void {
    this.grid.clear()
  }

  /**
   * Insert agent into grid
   */
  insert(agent: AgentState): void {
    const key = this.getKey(agent.position)
    
    if (!this.grid.has(key)) {
      this.grid.set(key, [])
    }
    
    this.grid.get(key)!.push(agent)
  }

  /**
   * Get neighboring cells (3x3x3 cube around position)
   */
  private getNeighborCells(position: THREE.Vector3): string[] {
    const centerX = Math.floor(position.x / this.cellSize)
    const centerY = Math.floor(position.y / this.cellSize)
    const centerZ = Math.floor(position.z / this.cellSize)
    
    const cells: string[] = []
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          cells.push(`${centerX + dx},${centerY + dy},${centerZ + dz}`)
        }
      }
    }
    
    return cells
  }

  /**
   * Query agents near position within radius
   */
  query(position: THREE.Vector3, radius: number, excludeId?: string): AgentState[] {
    const cells = this.getNeighborCells(position)
    const results: AgentState[] = []
    const radiusSq = radius * radius

    for (const cellKey of cells) {
      const cell = this.grid.get(cellKey)
      if (!cell) continue

      for (const agent of cell) {
        if (excludeId && agent.id === excludeId) continue
        
        const distSq = agent.position.distanceToSquared(position)
        if (distSq <= radiusSq) {
          results.push(agent)
        }
      }
    }

    return results
  }
}
