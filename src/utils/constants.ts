import * as THREE from 'three'
import { AgentSystemConfig, BehaviorParams } from '../agents/types'

export const DEFAULT_BEHAVIOR_PARAMS: BehaviorParams = {
  cohesionStrength: 0.8,
  alignmentStrength: 0.6,
  separationStrength: 1.2,
  maxSpeed: 3,
  maxForce: 0.15,
  perceptionRadius: 100,
  separationRadius: 30
}

export const DEFAULT_SYSTEM_CONFIG: AgentSystemConfig = {
  maxAgents: 1000,
  spawnRate: 10,
  initialCount: 200,
  bounds: new THREE.Vector3(400, 400, 400)
}

export const VISUAL_PARAMS = {
  lineLength: 20,
  lineThickness: 1.5,
  lineOpacity: 0.7,
  lineColor: 0xffffff
}
