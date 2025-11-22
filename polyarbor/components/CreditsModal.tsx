import React from 'react';
import { X, Github, Code, Cpu, ExternalLink, Sparkles, Terminal } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const CreditsModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      {/* Modal Window */}
      <div className="w-full max-w-[500px] bg-[#1e1e1e] border border-[#454545] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
        
        {/* Header (Plugin Style) */}
        <div className="h-10 bg-[#252525] border-b border-black flex items-center justify-between px-4 select-none shrink-0 relative z-20">
            <span className="text-xs font-bold text-[#787878] uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> System Info
            </span>
            <button 
                onClick={onClose} 
                className="text-[#787878] hover:text-white transition-colors p-1 hover:bg-[#333] rounded"
            >
                <X size={16} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] relative">
            {/* Background Texture */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
             </div>

            <div className="p-8 flex flex-col gap-6 relative z-10">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-[#141414] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center border border-[#333] mb-1 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#ff8800] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <Cpu className="text-[#ff8800] drop-shadow-[0_0_10px_rgba(255,136,0,0.5)]" size={40} />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tighter text-white drop-shadow-md">
                            POLY<span className="text-[#ff8800]">ARBOR</span>
                        </h1>
                        <p className="text-[10px] text-[#ff8800] uppercase tracking-[0.4em] font-mono mt-1 opacity-80">Rhythm Generator</p>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#444] to-transparent"></div>

                {/* Developer Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-px flex-1 bg-[#333]"></div>
                        <span className="text-[10px] font-bold text-[#787878] uppercase tracking-wider">Credits</span>
                        <div className="h-px flex-1 bg-[#333]"></div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded border border-[#333] p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:border-[#555] transition-colors group">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-[10px] text-[#787878] uppercase font-bold mb-0.5">Developed By</div>
                                <div className="text-sm font-bold text-white tracking-wide group-hover:text-[#ff8800] transition-colors">Matthew Robert Wesney</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-[#555] group-hover:text-white transition-colors">
                                <Code size={16} />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 border-t border-[#2a2a2a] pt-3">
                            <a href="https://github.com/dovvnloading" target="_blank" rel="noopener noreferrer" 
                            className="flex items-center justify-between text-xs text-[#aaa] hover:text-white hover:bg-[#252525] px-2 py-1.5 rounded transition-all">
                                <span className="flex items-center gap-2"><Github size={14} /> github.com/dovvnloading</span>
                                <ExternalLink size={10} className="opacity-50" />
                            </a>
                            <a href="https://github.com/dovvnloading/POLYARBOR-Rhythm-Generator" target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between text-xs text-[#aaa] hover:text-white hover:bg-[#252525] px-2 py-1.5 rounded transition-all">
                                <span className="flex items-center gap-2"><Code size={14} /> Project Repository</span>
                                <ExternalLink size={10} className="opacity-50" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* AI Shoutout */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded border border-[#333] p-5 relative overflow-hidden group shadow-md">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                        <Sparkles size={64} />
                     </div>
                     <div className="relative z-10 flex gap-4 items-start">
                         <div className="mt-1">
                             <Sparkles className="text-[#96ff00]" size={20} />
                         </div>
                         <div>
                            <div className="text-[10px] text-[#96ff00] uppercase font-bold mb-1 tracking-wide">Frontier Intelligence</div>
                            <p className="text-xs text-[#ccc] leading-relaxed">
                                Special shout out to <span className="text-white font-bold">Google DeepMind</span> for pushing the boundaries of Artificial Intelligence and enabling new forms of creative expression.
                            </p>
                         </div>
                     </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4 text-[10px] text-[#555] font-mono opacity-60">
                    <span>REACT 19</span>
                    <span>•</span>
                    <span>TYPESCRIPT</span>
                    <span>•</span>
                    <span>WEB AUDIO</span>
                    <span>•</span>
                    <span>TAILWIND</span>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
