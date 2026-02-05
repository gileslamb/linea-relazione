import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function Camera() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(300, 200, 300)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={100}
      maxDistance={800}
      target={[0, 0, 0]}
    />
  )
}
