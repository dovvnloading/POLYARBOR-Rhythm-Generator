import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  round?: boolean;
  icon?: React.ReactNode;
}

export const NeuButton: React.FC<ButtonProps> = ({ 
  children, 
  active, 
  round, 
  className = '', 
  icon,
  ...props 
}) => {
  const baseClasses = `
    transition-all duration-200 ease-in-out
    text-neu-text font-semibold flex items-center justify-center
    active:shadow-neu-pressed
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const shapeClasses = round ? 'rounded-full p-4' : 'rounded-xl px-6 py-3';
  const shadowClasses = active 
    ? 'shadow-neu-pressed text-neu-accent' 
    : 'shadow-neu-flat hover:shadow-lg active:scale-95';

  return (
    <button 
      className={`${baseClasses} ${shapeClasses} ${shadowClasses} ${className}`}
      {...props}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const NeuSlider: React.FC<SliderProps> = ({ label, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-bold text-neu-text uppercase tracking-wider ml-1">{label}</label>
      <div className="h-10 px-2 flex items-center rounded-xl shadow-neu-pressed bg-neu-base">
        <input 
          type="range" 
          className="w-full h-2 bg-transparent appearance-none cursor-pointer focus:outline-none 
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-neu-accent
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
          "
          {...props}
        />
      </div>
    </div>
  );
};

export const NeuCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-neu-base shadow-neu-flat rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);
