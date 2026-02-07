import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WaveField, WaveParams } from '../field/waveField'
import { randomInSphere } from '../utils/math'

const MAX_TRAIL = 100
const MAX_TRACERS = 500

interface TracerData {
  position: THREE.Vector3
  velocity: THREE.Vector3
  historyPositions: Float32Array
  historyLength: number
}

interface WaveFieldRendererProps {
  params: WaveParams
  activeTracers: number          // 50-500
  trailLength: number            // 2-100
  onFps?: (fps: number) => void
}

/**
 * Imperative renderer with pre-allocated tracer pool.
 * Only activeTracers are updated/visible each frame.
 */
export function WaveFieldRenderer({ params, activeTracers, trailLength, onFps }: WaveFieldRendererProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const waveFieldRef = useRef(new WaveField(params))
  const timeRef = useRef(0)
  const fpsRef = useRef({ count: 0, lastTime: performance.now() })
  const tracerDataRef = useRef<TracerData[]>([])
  const lineObjectsRef = useRef<THREE.Line[]>([])
  const activeRef = useRef(activeTracers)
  const trailLengthRef = useRef(trailLength)

  useEffect(() => { activeRef.current = activeTracers }, [activeTracers])
  useEffect(() => { trailLengthRef.current = trailLength }, [trailLength])
  useEffect(() => { waveFieldRef.current.updateParams(params) }, [params])

  // Pre-allocate full pool once
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    lineObjectsRef.current.forEach(l => {
      l.geometry.dispose()
      ;(l.material as THREE.Material).dispose()
      group.remove(l)
    })

    const tracers: TracerData[] = []
    const lines: THREE.Line[] = []

    for (let i = 0; i < MAX_TRACERS; i++) {
      tracers.push({
        position: randomInSphere(200),
        velocity: new THREE.Vector3(),
        historyPositions: new Float32Array(MAX_TRAIL * 3),
        historyLength: 0
      })

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
      line.visible = false
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
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    timeRef.current += dt
    const time = timeRef.current
    const field = waveFieldRef.current
    const tracers = tracerDataRef.current
    const lines = lineObjectsRef.current
    const speed = 2.0
    const displayTrail = trailLengthRef.current
    const active = activeRef.current

    for (let i = 0; i < MAX_TRACERS; i++) {
      const line = lines[i]
      if (!line) continue

      if (i >= active) {
        line.visible = false
        continue
      }

      line.visible = true
      const t = tracers[i]

      const displacement = field.sample(t.position, time)
      const lerpRate = 1 - Math.pow(1 - 0.06, dt / 0.016)
      t.velocity.lerp(displacement, lerpRate)
      t.position.addScaledVector(t.velocity, dt * speed)

      const hp = t.historyPositions
      hp.copyWithin(3, 0, (MAX_TRAIL - 1) * 3)
      hp[0] = t.position.x
      hp[1] = t.position.y
      hp[2] = t.position.z
      if (t.historyLength < MAX_TRAIL) t.historyLength++

      const drawCount = Math.min(t.historyLength, displayTrail)
      const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute
      posAttr.set(hp)
      posAttr.needsUpdate = true
      line.geometry.setDrawRange(0, drawCount)

      if (t.position.length() > 300) {
        t.position.normalize().multiplyScalar(-250)
        t.historyLength = 0
      }
    }

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
