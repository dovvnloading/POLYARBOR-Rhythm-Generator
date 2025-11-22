export const BASE_CYCLE_SECONDS = 4; // At 1x speed (60 BPM equivalent relative to cycle)

export const PENTATONIC_SCALE = [
  196.00, // G3
  220.00, // A3
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25  // E5
];

export const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Dark Blue
];

export const INITIAL_RHYTHMS = [
  { beats: 3, freq: PENTATONIC_SCALE[2], color: COLORS[1], speed: 1 },
  { beats: 4, freq: PENTATONIC_SCALE[4], color: COLORS[2], speed: 1 },
];