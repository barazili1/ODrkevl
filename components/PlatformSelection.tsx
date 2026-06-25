import React, { useState, useEffect } from 'react';
import { Platform } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, Database, Fingerprint, RefreshCw, KeyRound, Radio, Cpu, Network, Lock } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface PlatformSelectionProps {
  onSelect: (platform: Platform) => void;
  t: any;
}

const PlatformSelection: React.FC<PlatformSelectionProps> = ({ onSelect, t }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  
  const isArabic = t.system_active === "النظام نشط";

  const statusSteps = isArabic ? [
    "الاتصال بقناة المخدم البنفسجي المشفر",
    "تجاوز بوابات التحقق الأمنية لـ Megapari",
    "تحميل خوارزمية مصفوفة النسب الأرجوانية",
    "تأمين اتصال النفق الكمي الثنائي"
  ] : [
    "Establishing Link to Royal Violet Oracle",
    "Securing Megapari Handshake Protocol",
    "Syncing Live Orchid Ratio Forecasts",
    "Opening Bilateral Tunnel Vector"
  ];

  // Connection Simulation
  useEffect(() => {
    if (isConnecting) {
      const duration = 4000;
      const interval = 30;
      const totalSteps = duration / interval;
      const stepValue = 100 / totalSteps;

      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev + stepValue;
          
          if (next >= 15 && !activeSteps.includes(0)) setActiveSteps(s => [...s, 0]);
          if (next >= 42 && !activeSteps.includes(1)) setActiveSteps(s => [...s, 1]);
          if (next >= 68 && !activeSteps.includes(2)) setActiveSteps(s => [...s, 2]);
          if (next >= 90 && !activeSteps.includes(3)) setActiveSteps(s => [...s, 3]);

          if (next >= 100) {
            clearInterval(timer);
            return 100;
          }
          return next;
        });
      }, interval);

      const finishTimer = setTimeout(() => {
        onSelect('megapari');
      }, duration + 600);

      return () => {
        clearInterval(timer);
        clearTimeout(finishTimer);
      };
    }
  }, [isConnecting, onSelect, activeSteps]);

  const handleProceed = () => {
    audioManager.playClick();
    setIsConnecting(true);
  };

  return (
    <div className="flex flex-col h-full px-6 pt-8 pb-8 overflow-y-auto custom-scrollbar relative bg-transparent font-sans select-none" dir="ltr">
      
      {/* Elegantly styled title banner */}
      <div className="text-center mb-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500 mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          <span className="text-[7.5px] font-mono font-extrabold text-fuchsia-300 tracking-[0.3em] uppercase">
            {isArabic ? "بوابة الأرجوان الفاخرة" : "AMETHYST ORACLE VECTOR"}
          </span>
        </div>
        
        <h2 className="text-3xl font-display font-black text-white tracking-tight mb-1.5 uppercase">
          {isArabic ? "اختر منصة " : "SELECT "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]">{isArabic ? "الاتصال الآمن" : "VIP ACCESS"}</span>
        </h2>
        <p className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-[0.25em] font-extrabold">
          {isArabic ? "قم بربط الاتصال بمخدم مصفوفة النسب الملكية" : "Establish secure bilateral link to prediction node"}
        </p>
      </div>

      {/* RE-IMAGINED: Luxury Obsidian Shield Gate Frame */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-4">
        {/* Diamond Cut Obsidian Glass Card with thick glass reflections */}
        <div className="relative w-full max-w-[285px] rounded-[3.5rem] rounded-tr-[1rem] rounded-bl-[1rem] bg-gradient-to-b from-[#180e29]/70 to-[#06030a]/90 border border-fuchsia-500/30 backdrop-blur-xl p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9),_0_0_50px_rgba(168,85,247,0.12)] transition-all duration-500 hover:border-fuchsia-400/60 overflow-hidden group">
          
          {/* Symmetrical glowing reflection lines on sides */}
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-fuchsia-500/40 to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/40 to-transparent" />
          
          {/* Glass glare sweep overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.05] pointer-events-none" />

          {/* Symmetrical Corner Bracket Inlays */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-fuchsia-500/40 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-fuchsia-500/40 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-fuchsia-500/40 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-fuchsia-500/40 rounded-br-lg" />

          {/* Premium Logo Frame with Triple Concentric Rings */}
          <div className="relative mx-auto w-24 h-24 mb-6 rounded-[2rem] overflow-hidden border border-fuchsia-500/20 p-1.5 flex items-center justify-center bg-[#07030c] shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
             <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-indigo-500/20 pointer-events-none" />
             <div className="absolute inset-1 rounded-[1.7rem] border border-dashed border-fuchsia-500/25 animate-[spin_25s_linear_infinite]" />
             <div className="absolute inset-2 rounded-[1.4rem] border border-purple-500/10 animate-[spin_12s_linear_infinite_reverse]" />
             <img 
               src="https://i.pinimg.com/736x/eb/d5/fb/ebd5fb2023eab6f8d038609c70d2f8d9.jpg" 
               alt="Megapari" 
               className="w-full h-full object-cover rounded-[1.4rem]" 
               referrerPolicy="no-referrer" 
             />
          </div>

          <div className="text-center">
             <h3 className="text-2xl font-display font-black tracking-tight text-white mb-0.5 uppercase flex items-center justify-center gap-2">
               Megapari
               <ShieldCheck className="w-5 h-5 text-fuchsia-400 animate-pulse" />
             </h3>
             <span className="text-[7.5px] font-mono text-fuchsia-400 uppercase tracking-[0.35em] font-extrabold block mb-5">VIP AMETHYST NODE</span>

             {/* Dynamic Luxury Stats Panel */}
             <div className="space-y-2 mt-4 text-left font-mono text-[9px]" dir="ltr">
               <div className="flex justify-between items-center bg-[#07040c]/80 border border-white/5 p-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                     <Radio className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
                     <span className="text-zinc-500 font-black uppercase tracking-wider">{isArabic ? "زمن الاستجابة" : "LATENCY"}</span>
                  </div>
                  <span className="text-fuchsia-400 font-black font-display tracking-wider">11ms</span>
               </div>

               <div className="flex justify-between items-center bg-[#07040c]/80 border border-white/5 p-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                     <KeyRound className="w-3.5 h-3.5 text-fuchsia-400" />
                     <span className="text-zinc-500 font-black uppercase tracking-wider">{isArabic ? "تشفير القناة" : "CIPHER"}</span>
                  </div>
                  <span className="text-zinc-200 font-black font-display tracking-wider">AES-256</span>
               </div>

               <div className="flex justify-between items-center bg-[#07040c]/80 border border-white/5 p-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                     <Lock className="w-3.5 h-3.5 text-fuchsia-400" />
                     <span className="text-zinc-500 font-black uppercase tracking-wider">{isArabic ? "التحقق الآمن" : "INTEGRITY"}</span>
                  </div>
                  <span className="text-emerald-450 font-black font-display tracking-wider">VERIFIED</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Engagement Mechanism */}
      <div className="mt-auto relative z-10 w-full max-w-[285px] mx-auto pb-4">
        <button 
          onClick={handleProceed}
          disabled={isConnecting}
          className="relative w-full h-14 rounded-2xl bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-fuchsia-500/5 border border-fuchsia-500/30 text-white font-black font-display text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-3 overflow-hidden shadow-[0_15px_35px_rgba(217,70,239,0.15)] hover:border-fuchsia-400 active:scale-[0.98] transition-all duration-300"
        >
          {/* Shimmer glaze sweep */}
          <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2.5s_infinite]" />
          
          <span>
            {isArabic ? "تفعيل الاتصال الآمن" : "ENGAGE SECURE LINK"}
          </span>
          <ArrowRight className="w-4 h-4 text-fuchsia-400" />
        </button>
      </div>

      {/* RE-IMAGINED LUXURIOUS LOADING PORTAL OVERLAY */}
      {isConnecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500 p-6">
           <div className="relative w-full max-w-sm flex flex-col items-center">
              {/* Spinning geometric amethyst tracks */}
              <div className="absolute w-80 h-80 rounded-full border border-dashed border-fuchsia-500/5 animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-64 h-64 rounded-full border border-dashed border-purple-500/5 animate-[spin_30s_linear_infinite_reverse]" />

              <div className="w-full bg-[#0b0515] border border-fuchsia-500/20 rounded-[2.8rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col items-center">
                 {/* Orchid glow flare */}
                 <div className="absolute top-0 w-28 h-12 bg-fuchsia-500/15 blur-xl rounded-full" />
                 
                 {/* Glowing Amethyst Ring Spinner */}
                 <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-fuchsia-500 border-l-fuchsia-500 animate-spin" />
                    <div className="absolute w-10 h-10 rounded-full border border-dashed border-fuchsia-500/15 animate-[spin_8s_linear_infinite]" />
                 </div>

                 {/* Step Log Section */}
                 <div className="space-y-3.5 mb-8 w-full text-left" dir="ltr">
                    {statusSteps.map((step, i) => {
                      const isCompleted = activeSteps.includes(i);
                      const isActive = activeSteps.includes(i - 1) || (i === 0 && activeSteps.length === 0);
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center gap-3 transition-all duration-500 ${
                            isCompleted ? 'opacity-30' : isActive ? 'opacity-100 scale-100' : 'opacity-10'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-fuchsia-400' : isActive ? 'bg-fuchsia-500 animate-pulse shadow-[0_0_8px_#d946ef]' : 'bg-zinc-800'
                          }`} />
                          
                          <span className={`text-[10px] font-mono tracking-wide uppercase font-black ${
                            isActive ? 'text-white' : 'text-zinc-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                 </div>

                 {/* Amethyst Progress Bar */}
                 <div className="relative h-1 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-0 mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all duration-100 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
                 
                 <div className="flex justify-between items-center w-full px-1 font-mono text-[8px]">
                    <span className="text-zinc-600 uppercase font-black tracking-widest">HANDSHAKE TERMINAL</span>
                    <span className="text-fuchsia-400 font-black">{Math.round(progress)}%</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(250%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default PlatformSelection;
