export interface Track {
  id: string
  name: string
  file: File
  duration: number
}

export class MusicLibrary {
  private tracks: Track[] = []

  addTrack(file: File): Track {
    const track: Track = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      duration: 0  // Set after loading
    }
    this.tracks.push(track)
    return track
  }

  setTrackDuration(id: string, duration: number): void {
    const track = this.tracks.find(t => t.id === id)
    if (track) track.duration = duration
  }

  getTracks(): Track[] {
    return this.tracks
  }

  getTrack(id: string): Track | undefined {
    return this.tracks.find(t => t.id === id)
  }

  removeTrack(id: string): void {
    this.tracks = this.tracks.filter(t => t.id !== id)
  }
}
