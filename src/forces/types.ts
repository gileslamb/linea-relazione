/**
 * Musical Forces - Expressive parameters that map to visual behaviors
 * 
 * These are the user-facing controls that provide intuitive, musical
 * metaphors for controlling the visual field. Each force is normalized 0-1.
 */
export interface MusicalForces {
  /** 0 = dissonant/repulsion, 1 = consonant/attraction */
  harmony: number
  /** 0 = staccato/jerky, 1 = legato/smooth */
  flow: number
  /** 0 = sparse, 1 = dense clustering */
  density: number
  /** 0 = flat/2D, 1 = deep/3D */
  spaceDepth: number
  /** 0 = drone/continuous, 1 = pulsing/rhythmic */
  rhythm: number
  /** 0 = dark/soft/round, 1 = bright/sharp/angular */
  timbre: number
}

/**
 * Default musical forces - balanced, flowing aesthetic
 */
export const DEFAULT_MUSICAL_FORCES: MusicalForces = {
  harmony: 0.6,      // Slightly consonant
  flow: 0.7,         // Mostly legato
  density: 0.5,      // Medium density
  spaceDepth: 0.6,   // Moderate depth
  rhythm: 0.3,       // Mostly continuous with subtle pulse
  timbre: 0.5        // Balanced brightness
}

/**
 * Shape types for formation behaviors
 */
export type ShapeType = 'circle' | 'figure8' | 'sphere' | 'spiral' | 'none'
