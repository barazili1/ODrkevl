import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("SECURE VAULT OFFLINE MODE");
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const duration = 4000; 
    const intervalTime = 25;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        
        if (next > 15 && next < 35) setLoadingText("DECRYPTING ORACLE GATEWAY");
        else if (next > 35 && next < 55) setLoadingText("TUNING REAL-TIME RATIO ALIGNERS");
        else if (next > 55 && next < 75) setLoadingText("ISOLATING LIQUID GOLD SECURE PATHS");
        else if (next > 75 && next < 92) setLoadingText("GENERATING SHIELDED VIP SIGNATURES");
        else if (next > 92) setLoadingText("SECURE TUNNEL READY • WELCOME");

        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, duration - 400); 

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (opacity === 0 && progress >= 100) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden transition-opacity duration-500 ease-in-out font-sans select-none"
      style={{ opacity }}
    >
      {/* Luxurious Organic Fuchsia and Purple Ambient Radiance */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-fuchsia-500/10 via-purple-600/5 to-transparent blur-[140px] animate-pulse duration-[7s]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-purple-600/15 via-fuchsia-500/5 to-transparent blur-[140px] animate-pulse duration-[9s]" />

      {/* Exquisite fine grain overlay to emphasize the luxury textured look */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZHRoPSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii41Ii8+Cjwvc3ZnPg==')]" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6">
        {/* Asymmetrical Floating Fuchsia Gem Emblem Frame */}
        <div className="relative mb-10 w-36 h-36 flex items-center justify-center animate-bounce duration-[6s] ease-in-out">
          {/* Rotating fine purple outer track ring */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-fuchsia-500/20 rotate-12 animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-2 rounded-[2rem] border border-dashed border-purple-500/10 -rotate-12 animate-[spin_20s_linear_infinite_reverse]" />
          
          {/* Glowing pulse aura halo */}
          <div className="absolute w-24 h-24 rounded-full bg-fuchsia-500/10 blur-xl animate-pulse duration-1000" />

          {/* Central obsidian shield holding the logo */}
          <div className="absolute w-24 h-24 bg-gradient-to-b from-[#180e29]/70 to-[#06030a]/90 rounded-[1.8rem] border border-fuchsia-500/30 flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/5 to-transparent pointer-events-none" />
            <img 
              src="https://i.pinimg.com/736x/eb/d5/fb/ebd5fb2023eab6f8d038609c70d2f8d9.jpg" 
              className="w-16 h-16 object-contain drop-shadow-[0_4px_12px_rgba(217,70,239,0.5)]" 
              alt="Logo" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Brand Banner featuring Premium High-Contrast Serif Styling */}
        <div className="flex flex-col items-center text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-2">
            <Sparkles className="w-3 h-3 text-fuchsia-400 animate-pulse" />
            <span className="text-[7.5px] font-mono tracking-[0.35em] text-fuchsia-400 font-extrabold uppercase">ORACLE LEVEL V</span>
          </div>

          <h1 className="text-4xl font-display font-black tracking-[0.2em] text-white uppercase">
            DARK <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-300 to-fuchsia-400 drop-shadow-[0_2px_15px_rgba(217,70,239,0.4)]">EVIL</span>
          </h1>
          
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-fuchsia-500/40" />
            <p className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-[0.35em] font-extrabold">
              LIQUID GOLD INTEL
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-fuchsia-500/40" />
          </div>
        </div>

        {/* Sleek Horizontal Status Bar */}
        <div className="w-64 bg-zinc-950/80 p-4 rounded-3xl border border-fuchsia-500/15 backdrop-blur-xl shadow-2xl relative">
          {/* Progress gauge background track */}
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden p-0 relative mb-3">
            <div 
              className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(217,70,239,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-left">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[7px] font-mono font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
                SYSTEM CALIBRATION
              </span>
              <span className="text-[9px] font-mono font-black text-fuchsia-400 uppercase tracking-wide animate-pulse truncate pr-2">
                {loadingText}
              </span>
            </div>
            <span className="text-sm font-mono font-black text-white shrink-0">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tiny technical security signature */}
      <div className="absolute bottom-6 flex flex-col items-center space-y-1 opacity-35 font-mono text-[8px] tracking-[0.3em] text-zinc-500 uppercase">
        <span>VIP ENCRYPTED CHANNEL • OFFLINE SIGNS PROV</span>
      </div>
    </div>
  );
};

export default SplashScreen;
