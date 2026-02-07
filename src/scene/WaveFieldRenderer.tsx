import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WaveField, WaveParams } from '../field/waveField'
import { randomInSphere } from '../utils/math'

const MAX_TRAIL = 80

interface TracerData {
  position: THREE.Vector3
  velocity: THREE.Vector3
  historyPositions: Float32Array  // Flat [x,y,z, x,y,z, ...] ring buffer
  historyLength: number
}

interface WaveFieldRendererProps {
  params: WaveParams
  tracerCount: number
  trailLength: number     // How many points of trail to display (2-80)
  onFps?: (fps: number) => void
}

/**
 * Imperative wave field renderer.
 * All animation runs inside useFrame — no React state updates per frame.
 * Line geometries are updated directly via buffer attributes.
 */
export function WaveFieldRenderer({ params, tracerCount, trailLength, onFps }: WaveFieldRendererProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const waveFieldRef = useRef(new WaveField(params))
  const timeRef = useRef(0)
  const fpsRef = useRef({ count: 0, lastTime: performance.now() })
  const tracerDataRef = useRef<TracerData[]>([])
  const lineObjectsRef = useRef<THREE.Line[]>([])
  const trailLengthRef = useRef(trailLength)

  // Keep trail length ref in sync (avoids stale closure in useFrame)
  useEffect(() => {
    trailLengthRef.current = trailLength
  }, [trailLength])

  // Sync wave params to field (only when sliders change, not per frame)
  useEffect(() => {
    waveFieldRef.current.updateParams(params)
  }, [params])

  // Initialize tracers and line objects
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    // Clean up any existing
    lineObjectsRef.current.forEach(l => {
      l.geometry.dispose()
      ;(l.material as THREE.Material).dispose()
      group.remove(l)
    })

    const tracers: TracerData[] = []
    const lines: THREE.Line[] = []

    for (let i = 0; i < tracerCount; i++) {
      // Tracer data
      tracers.push({
        position: randomInSphere(150),
        velocity: new THREE.Vector3(),
        historyPositions: new Float32Array(MAX_TRAIL * 3),
        historyLength: 0
      })

      // Three.js line object with pre-allocated buffer
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(MAX_TRAIL * 3), 3)
      )
      geometry.setDrawRange(0, 0)

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85
      })

      const line = new THREE.Line(geometry, material)
      lines.push(line)
      group.add(line)
    }

    tracerDataRef.current = tracers
    lineObjectsRef.current = lines

    return () => {
      lines.forEach(l => {
        l.geometry.dispose()
        ;(l.material as THREE.Material).dispose()
        group.remove(l)
      })
    }
  }, [tracerCount])

  // Animation loop — runs every frame, purely imperative, no React re-renders
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)  // Clamp to prevent huge jumps on tab-switch
    timeRef.current += dt
    const time = timeRef.current
    const field = waveFieldRef.current
    const tracers = tracerDataRef.current
    const lines = lineObjectsRef.current
    const speed = 2.0  // Movement speed multiplier
    const displayTrail = trailLengthRef.current

    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i]
      const line = lines[i]
      if (!line) continue

      // Sample wave field at current position
      const displacement = field.sample(t.position, time)

      // Smooth velocity with inertia (lerp rate scaled by dt for consistency)
      const lerpRate = 1 - Math.pow(1 - 0.06, dt / 0.016)
      t.velocity.lerp(displacement, lerpRate)

      // Move along smoothed velocity
      t.position.addScaledVector(t.velocity, dt * speed)

      // Shift history buffer right by 3 floats, write new position at front
      const hp = t.historyPositions
      hp.copyWithin(3, 0, (MAX_TRAIL - 1) * 3)
      hp[0] = t.position.x
      hp[1] = t.position.y
      hp[2] = t.position.z
      if (t.historyLength < MAX_TRAIL) t.historyLength++

      // Update line geometry buffer directly (no React involved)
      // Only display up to trailLength points
      const drawCount = Math.min(t.historyLength, displayTrail)
      const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute
      posAttr.set(hp)
      posAttr.needsUpdate = true
      line.geometry.setDrawRange(0, drawCount)

      // Soft boundary — wrap to opposite side and clear trail
      if (t.position.length() > 250) {
        t.position.normalize().multiplyScalar(-200)
        t.historyLength = 0
      }
    }

    // FPS counter (fires callback once per second)
    fpsRef.current.count++
    const now = performance.now()
    if (now - fpsRef.current.lastTime >= 1000) {
      onFps?.(fpsRef.current.count)
      fpsRef.current.count = 0
      fpsRef.current.lastTime = now
    }
  })

  return <group ref={groupRef} />
}
