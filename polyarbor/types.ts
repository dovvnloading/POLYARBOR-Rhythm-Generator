export interface RhythmLayer {
  id: string;
  beats: number; // Number of beats per cycle
  mute: boolean;
  color: string;
  volume: number;
  frequency: number; // Base frequency for this layer
  pan: number; // -1 to 1
  speed: number; // Playback rate multiplier (0.5, 1, 2, etc.)
}

export interface AudioState {
  isPlaying: boolean;
  tempo: number; // BPM (cycles per minute, essentially)
  masterVolume: number;
}