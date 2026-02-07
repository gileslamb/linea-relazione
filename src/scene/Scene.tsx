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
import { MusicLibrary, Track } from '../audio/musicLibrary'

const DEFAULT_WAVE_PARAMS: WaveParams = {
  harmony: 0.7,
  flow: 0.75,
  density: 0.5,
  spaceDepth: 0.5,
  rhythm: 0.3,
  timbre: 0.2
}

export function Scene() {
  const [waveParams, setWaveParams] = useState<WaveParams>(DEFAULT_WAVE_PARAMS)
  const [fps, setFps] = useState(60)
  const [trailLength, setTrailLength] = useState(20)
  const [bloomIntensity, setBloomIntensity] = useState(1.5)
  const [activeTracers, setActiveTracers] = useState(150)
  const [progress, setProgress] = useState(0)

  // Audio state
  const audioEngineRef = useRef<AudioEngine | null>(null)
  const featureExtractorRef = useRef<FeatureExtractor | null>(null)
  const musicLibraryRef = useRef(new MusicLibrary())
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null)

  // Manual state backup
  const manualParamsRef = useRef<WaveParams>(DEFAULT_WAVE_PARAMS)

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new AudioEngine()
    return () => { audioEngineRef.current?.dispose() }
  }, [])

  // Feature extraction loop (runs only when playing)
  useEffect(() => {
    if (!isPlaying || !featureExtractorRef.current) return

    let animFrameId: number
    let frameCount = 0

    const extractLoop = () => {
      const extractor = featureExtractorRef.current
      const engine = audioEngineRef.current
      if (!extractor) return

      const features = extractor.extractSmoothed()
      const audioParams = extractor.toWaveParams(features)
      setWaveParams(audioParams)

      frameCount++
      if (frameCount % 4 === 0) {
        setAudioFeatures(features)
        if (engine) {
          setProgress(engine.getProgress())
        }
      }

      animFrameId = requestAnimationFrame(extractLoop)
    }

    extractLoop()
    return () => { cancelAnimationFrame(animFrameId) }
  }, [isPlaying])

  // Manual slider changes
  const handleParamChange = useCallback((param: keyof WaveParams, value: number) => {
    const newParams = { ...manualParamsRef.current, [param]: value }
    manualParamsRef.current = newParams
    if (!isPlaying) setWaveParams(newParams)
  }, [isPlaying])

  // Load a track into the audio engine
  const loadTrack = async (track: Track) => {
    const engine = audioEngineRef.current
    if (!engine) return

    // Stop current playback
    if (isPlaying) {
      engine.pause()
      setIsPlaying(false)
    }

    try {
      console.log('Loading track:', track.name)
      await engine.loadAudioFile(track.file)
      console.log('Track loaded successfully')

      // Update duration in library
      musicLibraryRef.current.setTrackDuration(track.id, engine.getDuration())
      setTracks([...musicLibraryRef.current.getTracks()])

      const analyser = engine.getAnalyser()
      if (analyser) {
        featureExtractorRef.current = new FeatureExtractor(analyser)
      }

      setCurrentTrack(track)
    } catch (error) {
      console.error('Error loading track:', error)
      alert('Failed to load audio: ' + error)
    }
  }

  const handleFileUpload = async (file: File) => {
    console.log('File selected:', file.name, file.type, file.size)
    const track = musicLibraryRef.current.addTrack(file)
    setTracks([...musicLibraryRef.current.getTracks()])
    await loadTrack(track)
  }

  const handleTrackSelect = async (trackId: string) => {
    const track = musicLibraryRef.current.getTrack(trackId)
    if (track) await loadTrack(track)
  }

  const handlePlay = () => {
    if (!audioEngineRef.current || !currentTrack) return
    audioEngineRef.current.play()
    setIsPlaying(true)
  }

  const handlePause = () => {
    if (!audioEngineRef.current) return
    audioEngineRef.current.pause()
    setIsPlaying(false)
    setAudioFeatures(null)
    setProgress(0)
    setWaveParams(manualParamsRef.current)
  }

  return (
    <>
      <Canvas
        camera={{ position: [400, 300, 400], fov: 60 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#000'
        }}
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
          activeTracers={activeTracers}
          trailLength={trailLength}
          onFps={setFps}
        />
        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
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
        activeTracers={activeTracers}
        onTracerChange={setActiveTracers}
        trailLength={trailLength}
        onTrailChange={setTrailLength}
        bloomIntensity={bloomIntensity}
        onBloomChange={setBloomIntensity}
        isPlaying={isPlaying}
        audioFeatures={audioFeatures}
        progress={progress}
      />

      <AudioControls
        tracks={tracks}
        currentTrack={currentTrack}
        onFileUpload={handleFileUpload}
        onTrackSelect={handleTrackSelect}
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
      />
    </>
  )
}
