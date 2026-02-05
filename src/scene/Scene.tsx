import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AgentSystem } from '../agents/agentSystem'
import { BehaviorParams, AgentState } from '../agents/types'
import { DEFAULT_BEHAVIOR_PARAMS, DEFAULT_SYSTEM_CONFIG } from '../utils/constants'
import { LineAgents } from './LineAgents'
import { Camera } from './Camera'
import { DebugView } from '../ui/DebugView'

export function Scene() {
  const agentSystemRef = useRef<AgentSystem | null>(null)
  const [agents, setAgents] = useState<AgentState[]>([])
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
    
    setAgents(agentSystemRef.current.getAgentStates())
  }, [])

  // Update loop
  useEffect(() => {
    let animationFrameId: number

    const update = () => {
      if (agentSystemRef.current) {
        // Update agents
        agentSystemRef.current.update()
        setAgents([...agentSystemRef.current.getAgentStates()])

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

  // Handle parameter changes
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
        camera={{ position: [300, 200, 300], fov: 60 }}
        style={{ background: '#000' }}
      >
        <Camera />
        <LineAgents agents={agents} />
        
        {/* Minimal lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
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
