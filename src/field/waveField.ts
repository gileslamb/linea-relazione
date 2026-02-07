import * as THREE from 'three'

export interface WaveParams {
  harmony: number      // 0-1: wave interference (0=destructive, 1=constructive)
  flow: number         // 0-1: wavelength (0=short/staccato, 1=long/legato)
  density: number      // 0-1: number of wave sources
  spaceDepth: number   // 0-1: Z-axis propagation strength
  rhythm: number       // 0-1: pulse frequency (0=drone, 1=rhythmic)
  timbre: number       // 0-1: wave complexity (0=sine, 1=complex harmonics)
}

export class WaveField {
  private waveParams: WaveParams

  constructor(params: WaveParams) {
    this.waveParams = params
  }

  /**
   * Sample wave field at position and time.
   * Uses CURL-LIKE flow (cross-axis sine/cos dependencies)
   * which naturally creates smooth, looping, flowing circulation.
   */
  sample(position: THREE.Vector3, time: number): THREE.Vector3 {
    const { flow, rhythm, harmony, timbre, spaceDepth } = this.waveParams

    // Spatial scale - larger flow = smoother/more coherent patterns
    const spatialScale = 0.005 + (1 - flow) * 0.015  // 0.005 (legato) to 0.02 (staccato)
    const timeSpeed = 0.3 + rhythm * 0.7              // 0.3 (drone) to 1.0 (pulse)

    const px = position.x * spatialScale
    const py = position.y * spatialScale
    const pz = position.z * spatialScale
    const t = time * timeSpeed

    // Curl-like flow: cross-axis dependencies create natural circulation
    // (dy depends on z, dx depends on y, dz depends on x)
    let dx = Math.sin(py + t) + Math.cos(pz * 0.7 + t * 0.8) * 0.5
    let dy = Math.sin(pz + t * 0.9) + Math.cos(px * 0.7 + t * 0.7) * 0.5
    let dz = (Math.sin(px + t * 0.8) + Math.cos(py * 0.7 + t * 0.6) * 0.5) * spaceDepth

    // Harmony: low values add turbulent high-frequency chaos
    if (harmony < 0.5) {
      const chaos = (0.5 - harmony) * 2  // 0-1 as harmony goes from 0.5 to 0
      dx += Math.sin(px * 5 + t * 3) * chaos * 0.4
      dy += Math.cos(py * 5 + t * 3) * chaos * 0.4
      dz += Math.sin(pz * 5 + t * 3) * chaos * 0.3 * spaceDepth
    }

    // Timbre: add harmonic complexity (overtones)
    if (timbre > 0.3) {
      const h = (timbre - 0.3) / 0.7
      dx += Math.sin(px * 3 + t * 2) * h * 0.25
      dy += Math.sin(py * 3 + t * 2) * h * 0.25
      dz += Math.sin(pz * 3 + t * 2) * h * 0.2 * spaceDepth
    }

    // Amplitude: flow affects overall scale
    const amplitude = 25 + flow * 35

    return new THREE.Vector3(dx, dy, dz).multiplyScalar(amplitude)
  }

  /**
   * Update wave parameters
   */
  updateParams(params: Partial<WaveParams>): void {
    this.waveParams = { ...this.waveParams, ...params }
  }
}
