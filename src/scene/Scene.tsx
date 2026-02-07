import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { WaveParams } from '../field/waveField'
import { WaveFieldRenderer } from './WaveFieldRenderer'
import { Camera } from './Camera'
import { MusicalForces } from '../ui/MusicalForces'
import { AudioControls } from '../ui/AudioControls'
import { AudioEngine } from '../audio/audioEngine'
import { FeatureExtractor, AudioFeatures } from '../audio/featureExtractor'

const DEFAULT_WAVE_PARAMS: WaveParams = {
  harmony: 0.7,
  flow: 0.75,
  density: 0.5,
  spaceDepth: 0.5,
  rhythm: 0.3,
  timbre: 0.2
}

const TRACER_COUNT = 150

export function Scene() {
  const [waveParams, setWaveParams] = useState<WaveParams>(DEFAULT_WAVE_PARAMS)
  const [fps, setFps] = useState(60)
  const [trailLength, setTrailLength] = useState(20)

  // Audio state
  const audioEngineRef = useRef<AudioEngine | null>(null)
  const featureExtractorRef = useRef<FeatureExtractor | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null)

  // Store manual params so we can restore them when audio stops
  const manualParamsRef = useRef<WaveParams>(DEFAULT_WAVE_PARAMS)

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new AudioEngine()
    return () => {
      audioEngineRef.current?.dispose()
    }
  }, [])

  // Feature extraction loop - runs only when audio is playing
  useEffect(() => {
    if (!isPlaying || !featureExtractorRef.current) return

    let animFrameId: number
    let frameCount = 0

    const extractLoop = () => {
      const extractor = featureExtractorRef.current
      if (!extractor) return

      const features = extractor.extractSmoothed()
      const audioParams = extractor.toWaveParams(features)

      // Update wave params from audio (every frame for smooth 3D)
      setWaveParams(audioParams)

      // Update UI display at ~15fps to avoid excessive DOM updates
      frameCount++
      if (frameCount % 4 === 0) {
        setAudioFeatures(features)
      }

      animFrameId = requestAnimationFrame(extractLoop)
    }

    extractLoop()

    return () => {
      cancelAnimationFrame(animFrameId)
    }
  }, [isPlaying])

  // Manual slider changes (only when not playing audio)
  const handleParamChange = useCallback((param: keyof WaveParams, value: number) => {
    const newParams = { ...manualParamsRef.current, [param]: value }
    manualParamsRef.current = newParams
    if (!isPlaying) {
      setWaveParams(newParams)
    }
  }, [isPlaying])

  const handleFileUpload = async (file: File) => {
    console.log('File selected:', file.name, file.type, file.size)
    if (!audioEngineRef.current) {
      console.error('No audio engine')
      return
    }
    try {
      await audioEngineRef.current.loadAudioFile(file)

      // Initialize feature extractor from the analyser
      const analyser = audioEngineRef.current.getAnalyser()
      if (analyser) {
        featureExtractorRef.current = new FeatureExtractor(analyser)
        console.log('Feature extractor ready')
      }

      setHasAudio(true)
      console.log('hasAudio set to true — controls should appear')
    } catch (error) {
      console.error('Error loading audio:', error)
    }
  }

  const handlePlay = () => {
    if (!audioEngineRef.current) return
    audioEngineRef.current.play()
    setIsPlaying(true)
  }

  const handlePause = () => {
    if (!audioEngineRef.current) return
    audioEngineRef.current.pause()
    setIsPlaying(false)
    setAudioFeatures(null)
    // Restore manual params when stopping
    setWaveParams(manualParamsRef.current)
  }

  return (
    <>
      <Canvas
        camera={{ position: [300, 200, 300], fov: 60 }}
        style={{ background: '#000' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <Camera />
        <ambientLight intensity={0.5} />
        <WaveFieldRenderer
          params={waveParams}
          tracerCount={TRACER_COUNT}
          trailLength={trailLength}
          onFps={setFps}
        />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <MusicalForces
        params={waveParams}
        onParamChange={handleParamChange}
        fps={fps}
        tracerCount={TRACER_COUNT}
        trailLength={trailLength}
        onTrailChange={setTrailLength}
        isPlaying={isPlaying}
        audioFeatures={audioFeatures}
      />

      <AudioControls
        onFileUpload={handleFileUpload}
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
        hasAudio={hasAudio}
      />
    </>
  )
}
