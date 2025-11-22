import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

interface TooltipData {
  text: string;
  x: number;
  y: number;
  placement: 'top' | 'bottom';
}

interface UIContextType {
  isGlobalDragging: boolean;
  setGlobalDragging: (dragging: boolean) => void;
  
  // Tooltip System
  tooltipData: TooltipData | null;
  showTooltip: (text: string, rect: DOMRect) => void;
  hideTooltip: () => void;
}

const UIContext = createContext<UIContextType>({
  isGlobalDragging: false,
  setGlobalDragging: () => {},
  tooltipData: null,
  showTooltip: () => {},
  hideTooltip: () => {},
});

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalDragging, setGlobalDragging] = useState(false);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  
  // Singleton timer ref
  const tooltipTimer = useRef<number | null>(null);

  const showTooltip = (text: string, rect: DOMRect) => {
    // 1. Always clear any existing timer or tooltip first (Singleton pattern)
    if (tooltipTimer.current) {
      window.clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
    
    // Don't show if dragging or if text is empty
    if (isGlobalDragging || !text) {
        setTooltipData(null);
        return;
    }

    // 2. Start new timer
    tooltipTimer.current = window.setTimeout(() => {
      // Determine vertical placement based on space availability
      // If element is within top 60px (header height), flip to bottom
      const isTop = rect.top > 70; 

      setTooltipData({
        text,
        x: rect.left + rect.width / 2,
        y: isTop ? rect.top : rect.bottom,
        placement: isTop ? 'top' : 'bottom'
      });
    }, 600); // 600ms delay
  };

  const hideTooltip = () => {
    if (tooltipTimer.current) {
      window.clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
    setTooltipData(null);
  };

  // Safety: If dragging starts, kill all tooltips immediately
  useEffect(() => {
    if (isGlobalDragging) {
      hideTooltip();
    }
  }, [isGlobalDragging]);

  return (
    <UIContext.Provider value={{ 
      isGlobalDragging, 
      setGlobalDragging,
      tooltipData,
      showTooltip,
      hideTooltip
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);