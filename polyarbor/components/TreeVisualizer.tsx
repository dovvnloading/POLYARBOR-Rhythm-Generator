import React, { useRef, useEffect } from 'react';
import { RhythmLayer } from '../types';
import { audioEngine } from '../services/audioEngine';

interface Props {
  rhythms: RhythmLayer[];
  tempo: number;
  isPlaying: boolean;
}

const TreeVisualizer: React.FC<Props> = ({ rhythms, tempo, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  // FIX: Store rhythms in a ref so we don't restart the animation loop on every state change
  const rhythmsRef = useRef(rhythms);

  // Keep the ref synced with props
  useEffect(() => {
    rhythmsRef.current = rhythms;
  }, [rhythms]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use ResizeObserver for robust resizing based on container dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        
        const dpr = window.devicePixelRatio || 1;
        
        // Only resize if dimensions actually changed to avoid unnecessary clears
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        }
      }
    });
    
    resizeObserver.observe(container);

    const draw = () => {
      const currentRhythms = rhythmsRef.current;

      // Use the canvas style/attribute dimensions we set in observer
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.4;
      
      // --- Background / Clearing ---
      // Create a slight trail effect for a "phosphor" look
      ctx.fillStyle = 'rgba(20, 20, 20, 0.3)'; 
      ctx.fillRect(0, 0, width, height);

      // Draw Scope Grid
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.33, 0, Math.PI * 2);
      ctx.stroke();
      
      // Timing
      const rawCycleProgress = isPlaying ? audioEngine.getCurrentCycleProgress() : 0;

      // Draw Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();

      // --- Rhythms ---
      currentRhythms.forEach((rhythm, i) => {
        const alpha = rhythm.mute ? 0.1 : 0.8;
        const speed = rhythm.speed || 1;
        
        // Calculate the progress specific to this rhythm's speed
        // If speed is 2, it loops twice per master cycle.
        const rhythmProgress = (rawCycleProgress * speed) % 1;
        
        const angleStep = (Math.PI * 2) / currentRhythms.length;
        const angle = -Math.PI / 2 + (i * angleStep);
        
        const endX = cx + Math.cos(angle) * maxRadius;
        const endY = cy + Math.sin(angle) * maxRadius;

        // Draw "Lane" Line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Pulse
        // Pulse position is based on speed-adjusted progress
        const pulseRadius = maxRadius * rhythmProgress;
        const pulseX = cx + Math.cos(angle) * pulseRadius;
        const pulseY = cy + Math.sin(angle) * pulseRadius;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = rhythm.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = rhythm.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Draw Beat Nodes
        for (let b = 1; b < rhythm.beats; b++) {
          const beatFrac = b / rhythm.beats;
          const nodeX = cx + Math.cos(angle) * (maxRadius * beatFrac);
          const nodeY = cy + Math.sin(angle) * (maxRadius * beatFrac);
          
          // Hit detection
          // Use the rhythmProgress (0..1 looping at speed) vs the beatFrac (position on line)
          const dist = Math.abs(rhythmProgress - beatFrac);
          const isHit = !rhythm.mute && (dist < 0.015 * speed); // Adjust hit tolerance based on speed

          if (isHit) {
            // Trigger visual flare
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = rhythm.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Base Node
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2);
          ctx.fillStyle = isHit ? '#fff' : '#444';
          ctx.fill();
        }
        
        // Draw Tip Label (Speed info)
        if (!rhythm.mute) {
            ctx.fillStyle = rhythm.color;
            ctx.font = 'bold 9px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.5;
            
            // Label text position
            const labelX = endX + (Math.cos(angle) * 15);
            const labelY = endY + (Math.sin(angle) * 15);
            
            ctx.fillText(`${rhythm.beats}`, labelX, labelY);
            
            // Add tiny speed indicator if not 1x
            if (speed !== 1) {
                ctx.font = '9px "JetBrains Mono"';
                ctx.fillText(`x${speed}`, labelX, labelY + 10);
            }
            
            ctx.globalAlpha = 1;
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, tempo]); // REMOVED 'rhythms' from dependency array

  return (
    <div ref={containerRef} className="w-full h-full bg-daw-inset rounded-md border-2 border-daw-panel shadow-inset overflow-hidden relative">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* CRT Scanline Overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-daw-dim opacity-50">
        SCOPE: VECTOR
      </div>
    </div>
  );
};

export default TreeVisualizer;