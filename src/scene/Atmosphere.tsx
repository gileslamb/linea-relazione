import { Fog } from 'three'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function Atmosphere() {
  const { scene } = useThree()

  useEffect(() => {
    // Subtle fog for depth perception
    // near=200, far=600 means fog starts subtle, gets strong at distance
    scene.fog = new Fog(0x000000, 200, 600)
    
    return () => {
      scene.fog = null
    }
  }, [scene])

  return (
    <>
      {/* Ambient light - soft base illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Key light - from above, slightly warm */}
      <directionalLight 
        position={[20, 50, 10]} 
        intensity={0.6}
        color={0xffffee}  // Warm white
      />
      
      {/* Rim light - from behind, cool tone */}
      <directionalLight 
        position={[-10, -20, -30]} 
        intensity={0.3}
        color={0xeeeeff}  // Cool white
      />
      
      {/* Fill light - gentle omnidirectional */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={0.2}
        distance={400}
      />
    </>
  )
}
