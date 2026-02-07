import * as THREE from 'three'
import { LineTracer } from './lineTracer'
import { WaveField, WaveParams } from '../field/waveField'
import { randomInSphere } from '../utils/math'

export class WaveSystem {
  private tracers: LineTracer[] = []
  private waveField: WaveField
  private time: number = 0
  private bounds: THREE.Vector3

  constructor(tracerCount: number, waveParams: WaveParams, bounds: THREE.Vector3) {
    this.waveField = new WaveField(waveParams)
    this.bounds = bounds
    this.spawnTracers(tracerCount)
  }

  private spawnTracers(count: number): void {
    const spawnRadius = 150

    for (let i = 0; i < count; i++) {
      const position = randomInSphere(spawnRadius)
      this.tracers.push(new LineTracer(position))
    }
  }

  update(): void {
    this.time += 0.016

    // Each tracer samples the wave field at its position
    for (const tracer of this.tracers) {
      const displacement = this.waveField.sample(tracer.position, this.time)
      tracer.update(displacement)

      // Soft boundary - wrap around
      const boundRadius = Math.min(this.bounds.x, this.bounds.y, this.bounds.z) / 2
      if (tracer.position.length() > boundRadius) {
        tracer.position.normalize().multiplyScalar(-boundRadius * 0.8)
      }
    }
  }

  getTracers(): LineTracer[] {
    return this.tracers
  }

  updateWaveParams(params: Partial<WaveParams>): void {
    this.waveField.updateParams(params)
  }
}
