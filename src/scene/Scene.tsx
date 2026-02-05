import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { AgentSystem } from '../agents/agentSystem'
import { LineAgent } from '../agents/LineAgent'
import { BehaviorParams } from '../agents/types'
import { DEFAULT_BEHAVIOR_PARAMS, DEFAULT_SYSTEM_CONFIG, VISUAL_PARAMS } from '../utils/constants'
import { LineAgents } from './LineAgents'
import { Camera } from './Camera'
import { Atmosphere } from './Atmosphere'
import { Pointillism } from './Pointillism'
import { CloudParticles } from './CloudParticles'
import { DebugView } from '../ui/DebugView'

export function Scene() {
  const agentSystemRef = useRef<AgentSystem | null>(null)
  const [agents, setAgents] = useState<LineAgent[]>([])
  const [params, setParams] = useState<BehaviorParams>(DEFAULT_BEHAVIOR_PARAMS)
  const [fps, setFps] = useState<number>(60)
  
  const lastTimeRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)

  // Initialize agent system
  useEffect(() => {
    agentSystemRef.current = new AgentSystem(
      DEFAULT_SYSTEM_CONFIG,
      DEFAULT_BEHAVIOR_PARAMS
    )
    
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

  // Handle parameter changes from debug sliders
  const handleParamChange = (param: keyof BehaviorParams, value: number) => {
    const newParams = { ...params, [param]: value }
    setParams(newParams)
    
    if (agentSystemRef.current) {
      agentSystemRef.current.updateParams(newParams)
    }
  }

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
        <LineAgents agents={agents} />
        
        {/* Pointillism dots at agent positions (Seurat-like) */}
        {VISUAL_PARAMS.usePointillism && <Pointillism agents={agents} />}
        
        {/* Atmospheric cloud particles */}
        {VISUAL_PARAMS.useCloudParticles && <CloudParticles agents={agents} />}
        
        {/* Post-processing bloom for luminous quality */}
        {VISUAL_PARAMS.useBloom && (
          <EffectComposer>
            <Bloom 
              intensity={VISUAL_PARAMS.bloomIntensity}
              luminanceThreshold={VISUAL_PARAMS.bloomThreshold}
              luminanceSmoothing={VISUAL_PARAMS.bloomSmoothing}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>

      <DebugView
        agentCount={agents.length}
        fps={fps}
        params={params}
        onParamChange={handleParamChange}
      />
    </>
  )
}
