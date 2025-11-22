import React, { useState, useEffect } from 'react';
import { Plus, X, Play, Square, Activity, Info } from 'lucide-react';
import { SynthKnob, SynthLCD, SynthToggle, SynthPanel, GlobalTooltip, SynthSelector } from './components/SynthUI';
import TreeVisualizer from './components/TreeVisualizer';
import { CreditsModal } from './components/CreditsModal';
import { RhythmLayer } from './types';
import { INITIAL_RHYTHMS, PENTATONIC_SCALE, COLORS } from './constants';
import { audioEngine } from './services/audioEngine';
import { useUI } from './contexts/UIContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

const SPEED_OPTIONS = [
  { label: "1/4", value: 0.25 },
  { label: "1/2", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "4x", value: 4 },
];

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(15); 
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [showCredits, setShowCredits] = useState(false);
  const { isGlobalDragging } = useUI();
  const [rhythms, setRhythms] = useState<RhythmLayer[]>(
    INITIAL_RHYTHMS.map(r => ({
      ...r,
      id: generateId(),
      mute: false,
      volume: 0.6,
      frequency: r.freq,
      pan: 0,
      speed: r.speed || 1
    }))
  );

  useEffect(() => {
    audioEngine.setRhythms(rhythms);
    audioEngine.setTempo(tempo);
    audioEngine.setVolume(masterVolume);
  }, [rhythms, tempo, masterVolume]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    audioEngine.togglePlay(newState);
  };

  const addRhythm = () => {
    if (rhythms.length >= 12) return; 
    const nextBeatCount = (rhythms[rhythms.length - 1]?.beats || 1) + 1;
    const colorIndex = rhythms.length % COLORS.length;
    const scaleIndex = rhythms.length % PENTATONIC_SCALE.length;
    
    setRhythms([...rhythms, {
      id: generateId(),
      beats: nextBeatCount > 16 ? 2 : nextBeatCount,
      mute: false,
      volume: 0.6,
      color: COLORS[colorIndex],
      frequency: PENTATONIC_SCALE[scaleIndex],
      pan: (Math.random() * 1) - 0.5,
      speed: 1
    }]);
  };

  const removeRhythm = (id: string) => {
    setRhythms(rhythms.filter(r => r.id !== id));
  };

  const updateRhythm = (id: string, updates: Partial<RhythmLayer>) => {
    setRhythms(rhythms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return (
    <div className={`w-full h-screen flex flex-col bg-daw-bg text-daw-text overflow-hidden font-sans select-none ${isGlobalDragging ? 'pointer-events-none cursor-ns-resize' : ''}`}>
      <GlobalTooltip />
      
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
      
      {/* --- TOP BAR / TOOLBAR --- */}
      <div className={`h-16 bg-daw-panel border-b border-black flex items-center px-6 justify-between shadow-lg z-10 ${isGlobalDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
             <div className="opacity-80 flex items-center gap-2">
                <Activity className="text-daw-accent" size={24} />
                <div>
                   <h1 className="font-bold text-lg tracking-tighter text-white leading-none">POLY<span className="text-daw-accent">ARBOR</span></h1>
                   <span className="text-[10px] tracking-widest text-daw-dim block">RHYTHM GENERATOR</span>
                </div>
             </div>
             
             {/* Info Button */}
             <button 
                onClick={() => setShowCredits(true)}
                className="w-6 h-6 rounded-full bg-daw-inset text-daw-dim hover:text-white hover:bg-[#333] border border-daw-border flex items-center justify-center transition-all shadow-inset ml-2"
                title="About / Credits"
             >
                <Info size={14} />
             </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-daw-border"></div>

          {/* Transport Controls */}
          <div className="flex items-center gap-3 bg-daw-inset px-3 py-1.5 rounded-md border border-daw-border shadow-inset h-12">
             <button 
                onClick={togglePlay}
                className={`w-12 h-full flex items-center justify-center rounded ${isPlaying ? 'bg-daw-highlight text-black shadow-[0_0_10px_#96ff00]' : 'bg-[#333] text-white hover:bg-[#444]'}`}
                title={isPlaying ? "Stop" : "Play"}
             >
                {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
             </button>
             
             {/* BPM */}
             <div className="flex flex-col items-center justify-center h-full pt-1">
                <SynthLCD 
                    value={tempo} 
                    min={5} max={120} 
                    onChange={setTempo} 
                    tooltip="Tempo (Cycles Per Minute)"
                />
                <span className="text-[8px] font-mono text-daw-dim scale-75 uppercase tracking-wider">CPM</span>
             </div>
          </div>
        </div>

        {/* Master Vol */}
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
               <div className="text-xs text-daw-dim">MASTER OUTPUT</div>
               <div className="text-[10px] text-daw-accent font-mono">{Math.round(masterVolume * 100)}%</div>
            </div>
            <SynthKnob 
              value={masterVolume} 
              min={0} max={1} 
              onChange={setMasterVolume} 
              color="#ff8800" 
              size={48}
              tooltip="Master Volume"
            />
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className={`flex-1 flex overflow-hidden ${isGlobalDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        
        {/* --- LEFT: CHANNEL RACK --- */}
        <div className="w-full md:w-[520px] flex flex-col bg-[#222] border-r border-black z-0">
           {/* Rack Header */}
           <div className="h-8 bg-daw-panel border-b border-black flex items-center px-4 justify-between">
              <span className="text-xs font-bold text-daw-dim uppercase">Channel Rack</span>
              <button onClick={addRhythm} className="text-[10px] bg-daw-surface hover:bg-[#444] px-2 py-1 rounded border border-daw-border flex items-center gap-1">
                 <Plus size={10} /> ADD CHANNEL
              </button>
           </div>

           {/* Rack Scroll Area */}
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {rhythms.map((r, idx) => (
                <div key={r.id} className={`h-14 bg-daw-panel rounded border border-[#111] flex items-center px-2 gap-3 hover:bg-[#323232] group shadow-md transition-colors duration-75`}>
                   
                   {/* Mute/Delete Area */}
                   <div className="flex flex-col gap-1">
                      <SynthToggle 
                        active={!r.mute} 
                        onClick={() => updateRhythm(r.id, { mute: !r.mute })} 
                        color="#96ff00" 
                        tooltip={r.mute ? "Unmute Channel" : "Mute Channel"}
                      />
                   </div>

                   {/* Channel Strip Controls */}
                   <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-sm border border-[#000] shadow-inset">
                      <SynthKnob 
                        value={r.pan} 
                        min={-1} max={1} 
                        onChange={(v) => updateRhythm(r.id, { pan: v })} 
                        size={24} 
                        label="PAN" 
                        color="#aaa"
                        tooltip="Stereo Panning"
                      />
                      <SynthKnob 
                        value={r.volume} 
                        min={0} max={1} 
                        onChange={(v) => updateRhythm(r.id, { volume: v })} 
                        size={24} 
                        label="VOL"
                        color="#aaa"
                        tooltip="Channel Volume"
                      />
                   </div>

                   {/* Name / Color Strip */}
                   <div className="flex-1 h-8 bg-[#252525] rounded flex items-center px-2 relative overflow-hidden border border-[#111]">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: r.color }}></div>
                      <span className="ml-2 font-mono text-xs text-white font-bold tracking-wide">OSC_{idx + 1}</span>
                      
                      {/* Delete button hidden until hover */}
                      <button 
                        onClick={() => removeRhythm(r.id)}
                        className="absolute right-0 top-0 bottom-0 w-6 bg-daw-alert text-white flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform"
                        title="Remove Channel"
                      >
                        <X size={12} />
                      </button>
                   </div>

                   {/* Step Control (Beats & Speed) */}
                   <div className="flex items-center gap-2">
                      <SynthLCD 
                         value={r.beats} 
                         min={1} max={32} 
                         onChange={(v) => updateRhythm(r.id, { beats: v })} 
                         label="STEPS"
                         tooltip="Polyrhythm Shape"
                      />
                      <SynthSelector 
                        value={r.speed}
                        options={SPEED_OPTIONS}
                        onChange={(v) => updateRhythm(r.id, { speed: v })}
                        label="RATE"
                        tooltip="Time Multiplier"
                      />
                   </div>

                </div>
              ))}

              {/* Add Button ghost */}
              <button 
                onClick={addRhythm}
                className="w-full h-8 border border-dashed border-daw-dim opacity-30 hover:opacity-80 rounded flex items-center justify-center text-xs uppercase"
              >
                + Add Rhythm Layer
              </button>
           </div>
        </div>

        {/* --- RIGHT: VISUALIZER --- */}
        <div className="flex-1 bg-[#111] p-4 flex flex-col gap-4 relative">
           {/* Background Grid Pattern */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <SynthPanel title="Visualizer Output [Vector]" className="flex-1 z-0">
              <TreeVisualizer rhythms={rhythms} tempo={tempo} isPlaying={isPlaying} />
           </SynthPanel>

           <SynthPanel title="System Stats" className="h-32">
              <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="bg-daw-inset rounded p-2 border border-daw-border shadow-inset">
                     <span className="text-[10px] text-daw-dim block mb-1">TOTAL OSCILLATORS</span>
                     <span className="text-xl font-mono text-daw-highlight">{rhythms.length}</span>
                  </div>
                  <div className="bg-daw-inset rounded p-2 border border-daw-border shadow-inset">
                     <span className="text-[10px] text-daw-dim block mb-1">CYCLE RATE</span>
                     <span className="text-xl font-mono text-daw-accent">{(60/tempo).toFixed(2)}s</span>
                  </div>
                  <div className="bg-daw-inset rounded p-2 border border-daw-border shadow-inset flex flex-col justify-between">
                     <span className="text-[10px] text-daw-dim">DSP LOAD</span>
                     <div className="w-full bg-[#222] h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-daw-alert w-[15%] animate-pulse"></div>
                     </div>
                  </div>
              </div>
           </SynthPanel>
        </div>

      </div>
    </div>
  );
};

export default App;