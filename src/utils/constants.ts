import * as THREE from 'three'
import { AgentSystemConfig, BehaviorParams } from '../agents/types'

// Behavior parameters - tuned for flowing grace
export const DEFAULT_BEHAVIOR_PARAMS: BehaviorParams = {
  cohesionStrength: 1.2,      // Increased - stronger flocking
  alignmentStrength: 1.5,     // Increased - more unified flow
  separationStrength: 0.8,    // Decreased - allow closer proximity
  maxSpeed: 4,                // Slightly faster for graceful movement
  maxForce: 0.08,             // DECREASED - smoother acceleration (key for grace)
  perceptionRadius: 120,      // Increased - see further
  separationRadius: 25        // Decreased - tighter formations
}

export const DEFAULT_SYSTEM_CONFIG: AgentSystemConfig = {
  maxAgents: 1000,
  spawnRate: 10,
  initialCount: 300,          // More agents for murmuration density
  bounds: new THREE.Vector3(500, 500, 500)  // Larger space
}

// Visual parameters - for elegant, effervescent rendering
export const VISUAL_PARAMS = {
  lineLength: 25,              // Base line length (now curves are dynamic)
  lineThickness: 1.5,          // Slightly thicker for curve visibility
  lineOpacity: 0.8,            // Good visibility with additive blending
  lineColor: 0xe0f0ff,         // Soft blue-white
  trailLength: 8,              // Number of trail segments per line
  trailFade: 0.15,             // Opacity decay per segment
  useMotionBlur: true,         // Enable motion blur stretching
  useAdditiveBlending: true,   // Overlaps glow (additive)
  useTrails: false,            // Disable old trail system (curves handle this now)
  usePointillism: true,        // Pointillism dots at agent positions
  useCloudParticles: true,     // Atmospheric cloud particles
  useBloom: true,              // Post-processing bloom effect
  bloomIntensity: 2.5,         // INCREASED - much stronger bloom
  bloomThreshold: 0.1,         // LOWERED - more elements glow
  bloomSmoothing: 0.9          // Bloom smoothing factor
}

// Movement quality parameters - for organic grace
export const MOVEMENT_PARAMS = {
  velocitySmoothing: 0.92,     // 0-1, higher = more inertia/grace
  spiralTendency: 0.15,        // 0-1, adds gentle spiral drift
  tumbleSpeed: 0.02,           // Rotation speed (very gentle)
  waveSpeed: 0.5,              // Murmuration wave propagation speed
  waveMagnitude: 2.0           // Wave displacement strength
}
