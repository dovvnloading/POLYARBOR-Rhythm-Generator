import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../contexts/UIContext';

// --- TYPES ---
interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  label?: string;
  size?: number;
  color?: string;
  tooltip?: string;
}

interface SelectorOption {
  label: string;
  value: number;
}

// --- UTILS ---
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// --- GLOBAL TOOLTIP RENDERER ---
export const GlobalTooltip: React.FC = () => {
  const { tooltipData } = useUI();
  const contentRef = useRef<HTMLDivElement>(null);
  const [xOffset, setXOffset] = useState(0);

  // Reset offset when text changes
  useLayoutEffect(() => {
    setXOffset(0);
  }, [tooltipData?.text]);

  // Calculate bounds and clamp horizontal position
  useLayoutEffect(() => {
    if (!contentRef.current || !tooltipData) return;
    
    const rect = contentRef.current.getBoundingClientRect();
    const padding = 12;
    const winWidth = window.innerWidth;
    
    let offset = 0;
    // Check Left Edge
    if (rect.left < padding) {
        offset = padding - rect.left;
    }
    // Check Right Edge
    else if (rect.right > winWidth - padding) {
        offset = winWidth - padding - rect.right;
    }
    
    if (offset !== 0) setXOffset(offset);
  }, [tooltipData]);
  
  if (!tooltipData) return null;
  
  const isTop = tooltipData.placement === 'top';

  return createPortal(
    <div 
      className="fixed z-[9999] pointer-events-none flex flex-col items-center animate-in fade-in duration-150"
      style={{ 
        left: tooltipData.x, 
        top: tooltipData.y, 
        // Center horizontally relative to x, vertically relative to placement
        transform: `translate(-50%, ${isTop ? '-100%' : '0'})`,
        marginTop: isTop ? '-6px' : '6px'
      }}
    >
      <div className={`flex flex-col items-center ${isTop ? '' : 'flex-col-reverse'}`}>
        
        {/* Content Bubble */}
        <div 
          ref={contentRef}
          className="px-2 py-1 bg-[#0a0a0a] text-daw-text text-[10px] rounded border border-daw-border shadow-[0_4px_15px_rgba(0,0,0,0.8)] whitespace-nowrap relative z-10"
          style={{ transform: `translateX(${xOffset}px)` }}
        >
          {tooltipData.text}
        </div>

        {/* Arrow */}
        {/* Arrow remains centered on the parent (target X) to maintain context, even if bubble shifts */}
        <div 
            className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent z-20
                ${isTop 
                    ? 'border-t-[5px] border-t-daw-border -mt-[1px]' 
                    : 'border-b-[5px] border-b-daw-border -mb-[1px]'
                }
            `}
        ></div>
      </div>
    </div>,
    document.body
  );
};

// --- HOOKS ---
const useTooltip = (text: string | undefined) => {
  const { showTooltip, hideTooltip } = useUI();

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!text) return;
    const rect = e.currentTarget.getBoundingClientRect();
    showTooltip(text, rect);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  // Ensure cleanup if component unmounts while hovering
  useEffect(() => {
    return () => hideTooltip();
  }, []);

  return { 
    onMouseEnter: handleMouseEnter, 
    onMouseLeave: handleMouseLeave 
  };
};

// --- COMPONENTS ---

/**
 * Rotary Knob Component
 */
export const SynthKnob: React.FC<KnobProps> = ({ 
  value, min, max, onChange, label, size = 40, color = '#d4d4d4', tooltip = '' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { setGlobalDragging } = useUI();
  const startY = useRef<number>(0);
  const startVal = useRef<number>(0);
  
  // Keep latest props in ref to avoid re-binding listeners on every render
  const propsRef = useRef({ value, min, max, onChange });
  propsRef.current = { value, min, max, onChange };

  const tooltipEvents = useTooltip(tooltip ? `${tooltip}: ${Math.round(value * 100) / 100}` : undefined);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setGlobalDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const { min, max, onChange } = propsRef.current;
      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const sensitivity = 150; 
      const deltaVal = (deltaY / sensitivity) * range;
      
      let newValue = startVal.current + deltaVal;
      newValue = Math.max(min, Math.min(max, newValue));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setGlobalDragging(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setGlobalDragging]);

  const percentage = (value - min) / (max - min);
  const angle = mapRange(percentage, 0, 1, -135, 135);

  return (
    <div 
      className="flex flex-col items-center gap-1 select-none relative group/knob"
      {...tooltipEvents}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="relative rounded-full bg-daw-surface shadow-knob cursor-ns-resize"
        style={{ width: size, height: size }}
      >
        {/* Outer Ring */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#111" strokeWidth="8" strokeDasharray="200" strokeDashoffset="50" transform="rotate(135 50 50)" />
        </svg>

        {/* Knob Cap */}
        <div 
            className="absolute top-1/2 left-1/2 w-full h-full rounded-full bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] border border-daw-border"
            style={{ 
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              width: `${size * 0.8}px`, 
              height: `${size * 0.8}px`
            }}
        >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[2px] h-[30%] rounded-full" style={{ backgroundColor: color }}></div>
        </div>
      </div>
      {label && <span className="text-[9px] text-daw-dim font-mono uppercase tracking-wider font-bold">{label}</span>}
    </div>
  );
};

/**
 * Digital Number Display (LCD)
 */
export const SynthLCD: React.FC<KnobProps> = ({ value, min, max, onChange, label, tooltip }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { setGlobalDragging } = useUI();
  const startY = useRef<number>(0);
  const startVal = useRef<number>(0);

  const propsRef = useRef({ value, min, max, onChange });
  propsRef.current = { value, min, max, onChange };

  const tooltipEvents = useTooltip(tooltip || label);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setGlobalDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const { min, max, onChange, value } = propsRef.current;
      
      const deltaY = startY.current - e.clientY;
      const sensitivity = 50; 
      const deltaVal = Math.round((deltaY / sensitivity) * (max - min)); 
      let newValue = startVal.current + deltaVal;
      newValue = Math.max(min, Math.min(max, newValue));
      
      if (newValue !== value) {
        onChange(newValue);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setGlobalDragging(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setGlobalDragging]);

  return (
    <div 
      className="flex flex-col items-center gap-1 relative"
      {...tooltipEvents}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="bg-daw-inset border border-daw-border rounded px-2 py-1 min-w-[50px] text-center cursor-ns-resize shadow-inset relative overflow-hidden"
      >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white opacity-5"></div>
          <span className="lcd-text text-daw-highlight font-bold text-sm">{Math.round(value)}</span>
      </div>
      {label && <span className="text-[9px] text-daw-dim font-mono uppercase">{label}</span>}
    </div>
  );
};

/**
 * Selector (Dropdown/Cycler)
 */
export const SynthSelector: React.FC<{
  value: number;
  options: SelectorOption[];
  onChange: (val: number) => void;
  label?: string;
  tooltip?: string;
}> = ({ value, options, onChange, label, tooltip }) => {
  const tooltipEvents = useTooltip(tooltip);

  const handleClick = () => {
    const currentIndex = options.findIndex(o => o.value === value);
    const nextIndex = (currentIndex + 1) % options.length;
    onChange(options[nextIndex].value);
  };

  const currentLabel = options.find(o => o.value === value)?.label || '?';

  return (
    <div className="flex flex-col items-center gap-1 select-none" {...tooltipEvents}>
      <button
        onClick={handleClick}
        className="bg-[#222] border border-daw-border hover:bg-[#2a2a2a] active:bg-[#1a1a1a] rounded px-1 py-1 min-w-[40px] text-center shadow-sm transition-colors"
      >
        <span className="font-mono text-xs text-daw-text font-bold">{currentLabel}</span>
      </button>
      {label && <span className="text-[9px] text-daw-dim font-mono uppercase">{label}</span>}
    </div>
  );
};


/**
 * LED Toggle Button
 */
export const SynthToggle: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  color?: string;
  size?: number;
  tooltip?: string;
}> = ({ active, onClick, color = '#96ff00', size = 16, tooltip }) => {
  
  const tooltipEvents = useTooltip(tooltip);

  return (
    <div className="relative flex items-center justify-center" {...tooltipEvents}>
      <button 
        onClick={onClick}
        className={`
          rounded-sm border border-[#111] shadow-md transition-all duration-100 relative
          ${active ? 'bg-[#e0e0e0]' : 'bg-[#2a2a2a]'}
        `}
        style={{ width: size, height: size }}
      >
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-sm transition-all duration-75
            ${active ? `opacity-100 shadow-led` : 'opacity-20'}
          `}
          style={{ 
            backgroundColor: color,
            boxShadow: active ? `0 0 6px ${color}` : 'none'
          }}
        ></div>
      </button>
    </div>
  );
};

/**
 * Main Panel Container
 */
export const SynthPanel: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ children, title, className = '' }) => (
  <div className={`bg-daw-panel border-t border-l border-[#444] border-b border-r border-[#111] rounded-md shadow-lg flex flex-col ${className}`}>
    {title && (
      <div className="bg-[#222] px-2 py-1 border-b border-[#111] flex justify-between items-center shrink-0">
         <span className="text-[10px] font-bold text-daw-dim uppercase tracking-widest">{title}</span>
         <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#444]"></div>
            <div className="w-1 h-1 rounded-full bg-[#444]"></div>
         </div>
      </div>
    )}
    <div className="p-3 flex-1 flex flex-col min-h-0 relative">
      {children}
    </div>
  </div>
);