import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { AgentSystem } from '../agents/agentSystem'
import { LineAgent } from '../agents/LineAgent'
import { DEFAULT_SYSTEM_CONFIG, VISUAL_PARAMS } from '../utils/constants'
import { MusicalForces, DEFAULT_MUSICAL_FORCES } from '../forces/types'
import { interpretMusicalForces, interpretVisualForces, getShapeFromRhythm, getShapeStrength } from '../forces/forceInterpreter'
import { LineAgents } from './LineAgents'
import { Camera } from './Camera'
import { Atmosphere } from './Atmosphere'
import { Pointillism } from './Pointillism'
import { CloudParticles } from './CloudParticles'
import { DebugView } from '../ui/DebugView'

export function Scene() {
  const agentSystemRef = useRef<AgentSystem | null>(null)
  const [agents, setAgents] = useState<LineAgent[]>([])
  const [musicalForces, setMusicalForces] = useState<MusicalForces>(DEFAULT_MUSICAL_FORCES)
  const [fps, setFps] = useState<number>(60)
  
  const lastTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)

  // Derive visual parameters from musical forces
  const visualParams = interpretVisualForces(musicalForces)

  // Initialize agent system
  useEffect(() => {
    const behaviorParams = interpretMusicalForces(musicalForces)
    
    agentSystemRef.current = new AgentSystem(
      DEFAULT_SYSTEM_CONFIG,
      behaviorParams
    )
    
    // Apply initial shape/rhythm settings
    const shapeType = getShapeFromRhythm(musicalForces.rhythm)
    const shapeStrength = getShapeStrength(musicalForces.rhythm)
    agentSystemRef.current.setShapeBehavior(shapeType, shapeStrength)
    agentSystemRef.current.setRhythmStrength(musicalForces.rhythm * 0.1)
    
    setAgents(agentSystemRef.current.getAgents())
  }, [])

  // Update loop
  useEffect(() => {
    let animationFrameId: number

    const update = () => {
      if (agentSystemRef.current) {
        agentSystemRef.current.update()
        setAgents([...agentSystemRef.current.getAgents()])

        // Calculate FPS
        frameCountRef.current++
        const now = performance.now()
        if (now - lastTimeRef.current >= 1000) {
          setFps(frameCountRef.current)
          frameCountRef.current = 0
          lastTimeRef.current = now
        }
      }

      animationFrameId = requestAnimationFrame(update)
    }

    update()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Handle musical force changes from debug sliders
  const handleForceChange = (force: keyof MusicalForces, value: number) => {
    const newForces = { ...musicalForces, [force]: value }
    setMusicalForces(newForces)
    
    if (agentSystemRef.current) {
      // Update behavior parameters
      const newParams = interpretMusicalForces(newForces)
      agentSystemRef.current.updateParams(newParams)
      
      // Update shape behavior based on rhythm
      const shapeType = getShapeFromRhythm(newForces.rhythm)
      const shapeStrength = getShapeStrength(newForces.rhythm)
      agentSystemRef.current.setShapeBehavior(shapeType, shapeStrength)
      
      // Update rhythm pulse
      agentSystemRef.current.setRhythmStrength(newForces.rhythm * 0.1)
    }
  }

  // Dynamic bloom based on timbre (bright = more bloom)
  const bloomIntensity = VISUAL_PARAMS.bloomIntensity + visualParams.glowIntensity

  return (
    <>
      <Canvas
        camera={{ position: [400, 300, 400], fov: 50 }}
        style={{ background: '#000' }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <Camera />
        <Atmosphere />
        
        {/* Flowing curved ribbons */}
        <LineAgents 
          agents={agents}
          curveIntensity={visualParams.curveIntensity}
          lineWidth={visualParams.lineWidth}
          opacity={visualParams.opacity}
        />
        
        {/* Pointillism dots at agent positions (Seurat-like) */}
        {VISUAL_PARAMS.usePointillism && (
          <Pointillism 
            agents={agents}
            pointSize={visualParams.pointSize}
            brightness={0.5 + musicalForces.timbre * 0.5}
          />
        )}
        
        {/* Atmospheric cloud particles */}
        {VISUAL_PARAMS.useCloudParticles && <CloudParticles agents={agents} />}
        
        {/* Post-processing bloom for luminous quality */}
        {VISUAL_PARAMS.useBloom && (
          <EffectComposer>
            <Bloom 
              intensity={bloomIntensity}
              luminanceThreshold={0.1}  // Lower threshold for more glow
              luminanceSmoothing={0.9}
              mipmapBlur
              radius={1.2}  // Larger glow radius
            />
          </EffectComposer>
        )}
      </Canvas>

      <DebugView
        agentCount={agents.length}
        fps={fps}
        musicalForces={musicalForces}
        onForceChange={handleForceChange}
      />
    </>
  )
}
