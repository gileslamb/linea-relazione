// Type declarations for @react-three/postprocessing
// These will be replaced by actual types after npm install

declare module '@react-three/postprocessing' {
  import { ReactNode } from 'react'
  
  export interface EffectComposerProps {
    children?: ReactNode
  }
  
  export interface BloomProps {
    intensity?: number
    luminanceThreshold?: number
    luminanceSmoothing?: number
    mipmapBlur?: boolean
  }
  
  export function EffectComposer(props: EffectComposerProps): JSX.Element
  export function Bloom(props: BloomProps): JSX.Element
}
