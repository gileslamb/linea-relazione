import { MusicalForces, ShapeType } from './types'
import { BehaviorParams } from '../agents/types'

/**
 * Interpret musical forces into concrete behavior parameters
 * 
 * This creates a poetic mapping between musical concepts and visual behavior:
 * - Harmony → attraction/repulsion balance (consonance = togetherness)
 * - Flow → velocity smoothing (legato = smooth, staccato = jerky)
 * - Density → how tightly agents cluster
 * - Space Depth → perception range (deep = see far, react to distant neighbors)
 * - Rhythm → shape formation tendency (pulse = geometric patterns)
 * - Timbre → visual quality (brightness, sharpness)
 */
export function interpretMusicalForces(forces: MusicalForces): BehaviorParams {
  // Harmony: controls attraction vs repulsion balance
  // High harmony = agents attract and flow together
  // Low harmony = dissonant, agents repel and scatter
  const cohesionStrength = forces.harmony * 2.0
  const separationStrength = (1 - forces.harmony) * 1.5 + 0.3 // Always some separation

  // Flow: controls smoothness of motion
  // High flow (legato) = smooth, graceful arcs
  // Low flow (staccato) = quick, jerky direction changes
  const alignmentStrength = forces.flow * 2.0

  // Density: affects clustering and speed
  // Dense = slower, tighter groups
  // Sparse = faster, more spread out
  const maxSpeed = 2 + (1 - forces.density) * 6 // Sparse = faster
  const separationRadius = 15 + (1 - forces.density) * 35 // Sparse = more personal space

  // Flow affects acceleration limits
  // Staccato = high maxForce (quick changes)
  // Legato = low maxForce (gradual changes)
  const maxForce = forces.flow < 0.5
    ? 0.15 + (0.5 - forces.flow) * 0.3 // Staccato: 0.15-0.3
    : 0.05 + (1 - forces.flow) * 0.1   // Legato: 0.05-0.1

  // Space Depth: affects perception and awareness
  // Deep space = agents respond to far-away neighbors
  // Flat space = only immediate neighbors matter
  const perceptionRadius = 60 + forces.spaceDepth * 120

  return {
    cohesionStrength,
    alignmentStrength,
    separationStrength,
    maxSpeed,
    maxForce,
    perceptionRadius,
    separationRadius
  }
}

/**
 * Determine which shape to form based on rhythm level
 */
export function getShapeFromRhythm(rhythm: number): ShapeType {
  if (rhythm < 0.3) return 'none'        // Drone - no shape
  if (rhythm < 0.5) return 'circle'      // Light pulse - circle
  if (rhythm < 0.7) return 'figure8'     // Moderate pulse - figure-8
  if (rhythm < 0.85) return 'sphere'     // Strong pulse - sphere
  return 'spiral'                         // Maximum pulse - spiral
}

/**
 * Get visual parameters from musical forces
 */
export interface VisualInterpretation {
  curveIntensity: number      // How curved the ribbons are (0-1)
  lineWidth: number           // Thickness of lines
  opacity: number             // Visibility
  glowIntensity: number       // Bloom amount
  trailLength: number         // How long trails persist
  pointSize: number           // Pointillism dot size
}

export function interpretVisualForces(forces: MusicalForces): VisualInterpretation {
  return {
    // Flow affects curve smoothness
    curveIntensity: forces.flow * 0.8 + 0.2,
    
    // Timbre affects visual sharpness
    // Bright = thinner, sharper lines; Dark = thicker, softer
    lineWidth: 1 + (1 - forces.timbre) * 2,
    
    // Density affects opacity (denser = more visible to maintain clarity)
    opacity: 0.5 + forces.density * 0.4,
    
    // Timbre affects glow (bright = more glow)
    glowIntensity: 1.5 + forces.timbre * 2,
    
    // Flow affects trail length (legato = longer trails)
    trailLength: Math.floor(4 + forces.flow * 8),
    
    // Timbre affects point size (bright = smaller, sharper points)
    pointSize: 4 + (1 - forces.timbre) * 6
  }
}

/**
 * Get shape attraction strength based on rhythm
 */
export function getShapeStrength(rhythm: number): number {
  if (rhythm < 0.3) return 0
  return (rhythm - 0.3) * 0.15 // 0 to ~0.1 strength
}
