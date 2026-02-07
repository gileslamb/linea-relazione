import * as THREE from 'three'

/**
 * A line tracer follows the wave field
 * Not an autonomous agent - just samples the field
 */
export class LineTracer {
  public position: THREE.Vector3
  public history: THREE.Vector3[] = []
  public id: string
  private age: number = 0
  private velocity: THREE.Vector3 = new THREE.Vector3()  // Smooth velocity with inertia

  constructor(position: THREE.Vector3) {
    this.position = position.clone()
    this.id = Math.random().toString(36).substr(2, 9)
  }

  /**
   * Update position based on wave field displacement
   */
  update(displacement: THREE.Vector3): void {
    // SMOOTH velocity (add inertia) - gradual acceleration, no jerky jumps
    this.velocity.lerp(displacement, 0.15)

    // Move along smoothed velocity
    this.position.add(this.velocity.clone().multiplyScalar(0.5))

    // Store history for trail rendering
    this.history.unshift(this.position.clone())

    // Keep MUCH longer history for flowing curves
    if (this.history.length > 80) {
      this.history.pop()
    }

    this.age++
  }

  /**
   * Get path as array of points (for curve rendering)
   */
  getPath(): THREE.Vector3[] {
    return this.history.slice(0, 60)  // Long flowing path
  }
}
