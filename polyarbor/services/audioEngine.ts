import { RhythmLayer } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private timerID: number | null = null;
  
  // Current cycle progress (0-1) for UI synchronization
  private cycleStartTime: number = 0;
  
  // State from App
  private currentRhythms: RhythmLayer[] = [];
  private currentTempo: number = 60; // Cycles per minute
  private currentMasterVol: number = 0.5;

  constructor() {
    // Lazy initialization in start() to handle autoplay policies
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.currentMasterVol;
    }
  }

  public setRhythms(rhythms: RhythmLayer[]) {
    this.currentRhythms = rhythms;
  }

  public setTempo(bpm: number) {
    this.currentTempo = bpm;
  }

  public setVolume(vol: number) {
    this.currentMasterVol = vol;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx?.currentTime || 0, 0.1);
    }
  }

  public togglePlay(play: boolean) {
    if (play) {
      this.startPolyrhythmScheduler();
    } else {
      this.isPlaying = false;
      if (this.timerID !== null) {
        window.clearTimeout(this.timerID);
        this.timerID = null;
      }
    }
  }

  // Returns current normalized time in cycle (0 to 1) for visualization
  public getCurrentCycleProgress(): number {
    if (!this.ctx || !this.isPlaying) return 0;
    
    const cycleDuration = 60 / this.currentTempo;
    const elapsed = this.ctx.currentTime - this.cycleStartTime;
    // We don't modulo here because we want total elapsed, the visualizer handles modulo
    return elapsed / cycleDuration;
  }

  public getContextTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  // Polyrhythm logic
  private rhythmNextTimes: Map<string, number> = new Map();
  private rhythmBeatCounts: Map<string, number> = new Map();

  private resetRhythmTracking() {
    this.rhythmNextTimes.clear();
    this.rhythmBeatCounts.clear();
    const startTime = this.ctx!.currentTime + 0.1;
    this.cycleStartTime = startTime;
    
    this.currentRhythms.forEach(r => {
      // First beat is at start of cycle (beat 0)
      this.rhythmNextTimes.set(r.id, startTime); 
      this.rhythmBeatCounts.set(r.id, 0);
    });
  }
  
  public startPolyrhythmScheduler() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    
    this.isPlaying = true;
    this.resetRhythmTracking();
    this.runPolyScheduler();
  }

  private runPolyScheduler() {
    if (!this.isPlaying || !this.ctx) return;

    const lookaheadWindow = this.ctx.currentTime + this.scheduleAheadTime;
    const cycleDur = 60 / this.currentTempo;

    this.currentRhythms.forEach(rhythm => {
      let nextTime = this.rhythmNextTimes.get(rhythm.id);
      
      // Calculate effective beat count based on steps AND speed
      // If steps=4 and speed=2, we effectively have 8 beats in the cycle time
      const effectiveBeats = rhythm.beats * (rhythm.speed || 1);
      const beatDuration = cycleDur / effectiveBeats;

      // Initialize new rhythms if they appear during playback
      if (nextTime === undefined) {
          // Calculate start time relative to current cycle
          const elapsed = this.ctx!.currentTime - this.cycleStartTime;
          const currentCycleCount = Math.floor(elapsed / cycleDur);
          const currentCycleStart = this.cycleStartTime + (currentCycleCount * cycleDur);
          
          // Beats passed relative to the start of the cycle, using the speed-adjusted duration
          const beatsPassed = Math.floor((this.ctx!.currentTime - currentCycleStart) / beatDuration);
          
          // Next beat time
          const nextBeatIndex = beatsPassed + 1;
          nextTime = currentCycleStart + (nextBeatIndex * beatDuration);
          
          this.rhythmNextTimes.set(rhythm.id, nextTime);
          this.rhythmBeatCounts.set(rhythm.id, nextBeatIndex);
      }

      let beatCount = this.rhythmBeatCounts.get(rhythm.id) || 0;

      // While the next beat for this rhythm is within the scheduling window
      while (nextTime < lookaheadWindow) {
        // Schedule sound
        if (!rhythm.mute) {
          // Only play if time is not in the distant past (allowing some processing jitter)
          if (nextTime >= this.ctx!.currentTime - 0.05) {
              this.playOscillator(rhythm, nextTime, beatCount);
          }
        }

        nextTime += beatDuration;
        beatCount++;
        
        // Update state
        this.rhythmNextTimes.set(rhythm.id, nextTime);
        this.rhythmBeatCounts.set(rhythm.id, beatCount);
      }
    });

    this.timerID = window.setTimeout(() => this.runPolyScheduler(), this.lookahead);
  }

  private playOscillator(rhythm: RhythmLayer, time: number, beatIndex: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();

    // Accent the first beat of the cycle
    // For polyrhythms with speed, we want the accent on the "real" Step 1
    // beatIndex increases infinitely. 
    // We need to map beatIndex back to the 0..beats-1 range
    // But since we multiplied by speed, the beatIndex goes up faster.
    const isFirstBeat = beatIndex % rhythm.beats === 0;
    
    // Frequency
    osc.frequency.value = isFirstBeat ? rhythm.frequency * 2 : rhythm.frequency;
    osc.type = isFirstBeat ? 'triangle' : 'sine';

    // Volume Envelope
    const velocity = (isFirstBeat ? 0.8 : 0.4) * rhythm.volume;
    
    // Panning
    panner.pan.value = rhythm.pan;

    // Connections
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    // Envelope
    const attack = 0.005;
    const decay = isFirstBeat ? 0.2 : 0.1;

    osc.start(time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, time + attack + decay);
    osc.stop(time + attack + decay + 0.1); // Cleanup
  }
}

export const audioEngine = new AudioEngine();