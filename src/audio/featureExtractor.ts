import { WaveParams } from '../field/waveField'

export interface AudioFeatures {
  rms: number              // Overall energy (0-1)
  low: number              // Bass energy (0-1)
  mid: number              // Mid-range energy (0-1)
  high: number             // Treble energy (0-1)
  onset: boolean           // Beat/hit detected
  spectralCentroid: number // Brightness (0-1)
}

export class FeatureExtractor {
  private analyser: AnalyserNode
  private dataArray: Uint8Array<ArrayBuffer>
  private bufferLength: number
  private previousRMS: number = 0
  private onsetThreshold: number = 1.3

  // Smoothed values to prevent jitter
  private smoothed: AudioFeatures = {
    rms: 0, low: 0, mid: 0, high: 0,
    onset: false, spectralCentroid: 0.5
  }
  private smoothingFactor: number = 0.15

  // Onset history for rhythm measurement
  private onsetHistory: number[] = []

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser
    this.bufferLength = analyser.frequencyBinCount
    this.dataArray = new Uint8Array(this.bufferLength) as Uint8Array<ArrayBuffer>
  }

  /**
   * Extract raw audio features from the analyser
   */
  extract(): AudioFeatures {
    this.analyser.getByteFrequencyData(this.dataArray)

    // RMS (overall energy)
    let sum = 0
    for (let i = 0; i < this.bufferLength; i++) {
      sum += this.dataArray[i] * this.dataArray[i]
    }
    const rms = Math.sqrt(sum / this.bufferLength) / 255

    // Frequency bands
    const lowEnd = Math.floor(this.bufferLength * 0.1)   // ~0-200Hz
    const midEnd = Math.floor(this.bufferLength * 0.4)    // ~200-2000Hz

    const low = this.getBandEnergy(0, lowEnd)
    const mid = this.getBandEnergy(lowEnd, midEnd)
    const high = this.getBandEnergy(midEnd, this.bufferLength)

    // Onset detection (energy spike relative to previous frame)
    const onset = rms > this.previousRMS * this.onsetThreshold && rms > 0.3
    this.previousRMS = rms

    // Spectral centroid (brightness) - weighted average of frequencies
    let weightedSum = 0
    let totalEnergy = 0
    for (let i = 0; i < this.bufferLength; i++) {
      weightedSum += i * this.dataArray[i]
      totalEnergy += this.dataArray[i]
    }
    const spectralCentroid = totalEnergy > 0
      ? (weightedSum / totalEnergy) / this.bufferLength
      : 0.5

    return { rms, low, mid, high, onset, spectralCentroid }
  }

  /**
   * Extract features and smooth them, returning stabilized values
   */
  extractSmoothed(): AudioFeatures {
    const raw = this.extract()
    const s = this.smoothingFactor

    this.smoothed.rms = this.lerp(this.smoothed.rms, raw.rms, s)
    this.smoothed.low = this.lerp(this.smoothed.low, raw.low, s)
    this.smoothed.mid = this.lerp(this.smoothed.mid, raw.mid, s)
    this.smoothed.high = this.lerp(this.smoothed.high, raw.high, s)
    this.smoothed.spectralCentroid = this.lerp(this.smoothed.spectralCentroid, raw.spectralCentroid, s)
    this.smoothed.onset = raw.onset  // onset is boolean, don't smooth

    // Track onset frequency for rhythm
    this.onsetHistory.push(raw.onset ? 1 : 0)
    if (this.onsetHistory.length > 60) this.onsetHistory.shift()

    return { ...this.smoothed }
  }

  /**
   * Map smoothed audio features directly to WaveParams.
   * This is the core musical-force mapping.
   */
  toWaveParams(features: AudioFeatures): WaveParams {
    // Onset frequency over last ~1 second
    const onsetFreq = this.onsetHistory.length > 0
      ? this.onsetHistory.reduce((a, b) => a + b, 0) / this.onsetHistory.length
      : 0

    return {
      // Bass energy → harmony (constructive interference / clustering)
      harmony: features.low * 0.7 + features.rms * 0.3,

      // Inverted spectral centroid → flow (dark = legato, bright = staccato)
      flow: 1 - features.spectralCentroid,

      // Overall energy → density
      density: features.rms,

      // Mid-range energy → space depth (Z-axis propagation)
      spaceDepth: features.mid,

      // Onset frequency → rhythm (pulse speed)
      rhythm: Math.min(onsetFreq * 2, 1),

      // Spectral centroid → timbre (wave complexity)
      timbre: features.spectralCentroid
    }
  }

  private getBandEnergy(startIdx: number, endIdx: number): number {
    let sum = 0
    const count = endIdx - startIdx
    if (count <= 0) return 0
    for (let i = startIdx; i < endIdx; i++) {
      sum += this.dataArray[i]
    }
    return (sum / count) / 255
  }

  private lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor
  }
}
