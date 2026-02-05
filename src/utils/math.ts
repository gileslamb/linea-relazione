import * as THREE from 'three'

/**
 * Limit vector magnitude to max value
 */
export function limit(vector: THREE.Vector3, max: number): THREE.Vector3 {
  if (vector.lengthSq() > max * max) {
    vector.normalize().multiplyScalar(max)
  }
  return vector
}

/**
 * Set vector magnitude to exact value
 */
export function setMagnitude(vector: THREE.Vector3, mag: number): THREE.Vector3 {
  return vector.normalize().multiplyScalar(mag)
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Random value in range
 */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Random point in sphere
 */
export function randomInSphere(radius: number): THREE.Vector3 {
  const u = Math.random()
  const v = Math.random()
  const theta = u * 2 * Math.PI
  const phi = Math.acos(2 * v - 1)
  const r = Math.cbrt(Math.random()) * radius
  
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  )
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}
