import { OrbitControls } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

export function Camera() {
  const { camera } = useThree()
  const timeRef = useRef(0)

  useEffect(() => {
    // Initial camera position - pulled back for larger space
    camera.position.set(400, 300, 400)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Subtle camera drift (breathing)
  useFrame((_state, delta) => {
    timeRef.current += delta * 0.1  // Very slow time progression

    // Gentle orbital drift with multiple frequencies
    const radius = 500
    const offsetX = Math.sin(timeRef.current * 0.3) * 50
    const offsetY = Math.cos(timeRef.current * 0.2) * 30
    const offsetZ = Math.sin(timeRef.current * 0.25) * 50

    // Update camera position with drift
    camera.position.x = radius * Math.cos(timeRef.current * 0.1) + offsetX
    camera.position.z = radius * Math.sin(timeRef.current * 0.1) + offsetZ
    camera.position.y = 300 + offsetY

    camera.lookAt(0, 0, 0)
  })

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={150}
      maxDistance={1000}
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={0.05}  // Smooth, inertial camera control
    />
  )
}
