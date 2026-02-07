/**
 * Audio engine using native Web Audio API.
 * Handles file loading, playback, and exposes an AnalyserNode for feature extraction.
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null
  private sourceNode: AudioBufferSourceNode | null = null
  private audioBuffer: AudioBuffer | null = null
  private analyser: AnalyserNode | null = null
  private gainNode: GainNode | null = null
  private isPlaying: boolean = false
  private startTime: number = 0
  private pauseOffset: number = 0

  private ensureContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    // Resume suspended context (browsers suspend until user gesture)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  async loadAudioFile(file: File): Promise<void> {
    // Stop any current playback
    if (this.isPlaying) {
      this.pause()
    }

    const ctx = this.ensureContext()

    // Decode audio from file
    const arrayBuffer = await file.arrayBuffer()
    this.audioBuffer = await ctx.decodeAudioData(arrayBuffer)

    // Build audio graph: source → gain → analyser → destination
    this.gainNode = ctx.createGain()
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.8

    this.gainNode.connect(this.analyser)
    this.analyser.connect(ctx.destination)

    this.pauseOffset = 0
    console.log('Audio loaded:', file.name, `(${this.audioBuffer.duration.toFixed(1)}s)`)
  }

  play(): void {
    if (!this.audioBuffer || !this.gainNode) return
    if (this.isPlaying) return

    const ctx = this.ensureContext()

    // AudioBufferSourceNode is one-shot — create a new one each time
    this.sourceNode = ctx.createBufferSource()
    this.sourceNode.buffer = this.audioBuffer
    this.sourceNode.connect(this.gainNode)

    // Handle natural end of track
    this.sourceNode.onended = () => {
      if (this.isPlaying) {
        this.isPlaying = false
        this.pauseOffset = 0
      }
    }

    this.sourceNode.start(0, this.pauseOffset)
    this.startTime = ctx.currentTime - this.pauseOffset
    this.isPlaying = true
    console.log('Audio playing from', this.pauseOffset.toFixed(1) + 's')
  }

  pause(): void {
    if (!this.isPlaying || !this.sourceNode || !this.audioContext) return

    this.pauseOffset = this.audioContext.currentTime - this.startTime
    this.sourceNode.onended = null  // Don't trigger ended callback
    this.sourceNode.stop()
    this.sourceNode.disconnect()
    this.sourceNode = null
    this.isPlaying = false
    console.log('Audio paused at', this.pauseOffset.toFixed(1) + 's')
  }

  getPlaybackState(): boolean {
    return this.isPlaying
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  dispose(): void {
    if (this.isPlaying) {
      this.pause()
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.audioBuffer = null
  }
}
