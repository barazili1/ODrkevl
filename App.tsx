import React, { useState, useEffect, useRef } from 'react';
import { Info, Globe, X, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import PlatformSelection from './components/PlatformSelection';
import SettingsView from './components/SettingsView';
import RulesModal from './components/RulesModal';
import GameLoadingOverlay from './components/GameLoadingOverlay';
import { AppleGameView } from './components/AppleGameView';
import { AdminView } from './components/AdminView';
import { AdminApprovalModal } from './components/AdminApprovalModal';
import { ViewState, Platform, GameType } from './types';
import { translations, Language } from './utils/translations';
import { audioManager } from './utils/audioManager';

interface CrystalParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  color: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('splash');
  const [activeTab, setActiveTab] = useState<'info' | 'conditions' | 'platform'>('platform');
  const [lang, setLang] = useState<Language>('ar');
  const [userId, setUserId] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('megapari');
  const [selectedGame, setSelectedGame] = useState<GameType>('apple');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle simulation for beautiful floating Amethyst crystals background (across all views)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: CrystalParticle[] = [];
    const maxParticles = 24;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const colors = ['#d946ef', '#a855f7', '#ec4899', '#818cf8'];
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          speedY: -(Math.random() * 0.4 + 0.1),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          alpha: Math.random() * 0.5 + 0.15,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const draw = () => {
      const isGameActive = document.getElementById('game-view-active');
      if (isGameActive) {
        // Pause canvas rendering completely to avoid any layout repaint or composition lag during game
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Luxurious dark amethyst velvet radial gradient background
      const bgGrd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2.5, 30,
        canvas.width / 2, canvas.height / 2, canvas.width * 1.1
      );
      bgGrd.addColorStop(0, '#100720');
      bgGrd.addColorStop(0.5, '#07030e');
      bgGrd.addColorStop(1, '#020104');
      ctx.fillStyle = bgGrd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw futuristic faint diagonal grid lines for texture
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvas.height, canvas.height);
        ctx.stroke();
      }

      // Draw floating geometric velvet amethyst crystals
      particles.forEach((p) => {
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.7, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();

        // Draw inner diamond facet for luxury crystal refraction look
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha * 0.4;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.2, 0);
        ctx.lineTo(0, p.size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Only prefill userId from storage, but do not bypass the splash/selection screens on page reload
    const approvedUser = localStorage.getItem('bypass_approved_userId');
    const pendingUser = localStorage.getItem('admin_approval_userId');

    if (approvedUser) {
      setUserId(approvedUser);
    } else if (pendingUser) {
      setUserId(pendingUser);
    }
  }, []);

  const rawT = translations[lang];
  
  const processTranslations = (obj: any): any => {
    const platformName = selectedPlatform === '1xbet' ? '1xBet' : (selectedPlatform === 'megapari' ? 'Megapari' : 'Linebet');
    const newT: any = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        newT[key] = obj[key].replace(/1xBet/gi, platformName).replace(/Linebet/gi, platformName);
      } else {
        newT[key] = obj[key];
      }
    }
    return newT;
  };

  const t = processTranslations(rawT);
  const isArabic = lang === 'ar';

  useEffect(() => {
    const initAudio = () => {
        audioManager.resume();
        document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const handleSplashComplete = () => {
    // Always start from platform selection on first-time entry loading
    setView('platform_selection');
    setActiveTab('platform');
  };

  const handlePlatformSelect = (p: Platform) => {
    setSelectedPlatform(p);
    setView('settings');
    setActiveTab('conditions');
  };

  const handleConditionsSubmit = (id: string, bypass: boolean = false) => {
    if (id === "000999000") {
      setUserId(id);
      setView('admin');
      return;
    }
    setUserId(id);
    const isApprovedId = id === "1902716432" || id === "1729018123" || localStorage.getItem('admin_approval_status') === 'approved';
    if (bypass || isApprovedId) {
      setSelectedGame('apple');
      setView('info');
      setActiveTab('info');
      setIsGameLoading(true);
    } else {
      setApprovalPending(true);
    }
  };

  const handleApprovalSuccess = () => {
    setApprovalPending(false);
    setSelectedGame('apple');
    setView('info');
    setActiveTab('info');
    setIsGameLoading(true);
  };

  const handleApprovalRejected = () => {
    setApprovalPending(false);
    setUserId('');
    setView('settings');
    setActiveTab('conditions');
  };

  const handleApprovalDismiss = () => {
    setApprovalPending(false);
    setView('settings');
    setActiveTab('conditions');
  };

  const handleAdminLogout = () => {
    setView('platform_selection');
    setActiveTab('platform');
    setUserId('');
  };

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
    setView('info');
    setActiveTab('info');
    setIsGameLoading(true);
  };

  const onGameLoadingComplete = () => {
    setIsGameLoading(false);
  };

  const handleBack = () => {
    audioManager.playClick();
    if (view === 'settings') {
      setView('platform_selection');
      setActiveTab('platform');
    } else if (view === 'info') {
      setView('settings');
      setActiveTab('conditions');
    }
  };
  
  const toggleLanguage = (l: Language) => {
      audioManager.playClick();
      setLang(l);
      setIsLangMenuOpen(false);
  }

  const renderContent = () => {
    if (view === 'admin') {
      return <AdminView onLogout={handleAdminLogout} lang={lang} />;
    }

    if (view === 'platform_selection') {
      return <PlatformSelection onSelect={handlePlatformSelect} t={t} />;
    }

    if (view === 'info') {
      return <AppleGameView language={lang} t={t} userId={userId} platform={selectedPlatform} />;
    }

    switch (activeTab) {
      case 'conditions':
        return <SettingsView onComplete={handleConditionsSubmit} lang={lang} t={t} platform={selectedPlatform} />;
      default:
        return <PlatformSelection onSelect={handlePlatformSelect} t={t} />;
    }
  };

  return (
    <div dir="ltr" className={isArabic ? 'font-arabic' : 'font-sans'}>
      {view === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
      
      {isGameLoading && <GameLoadingOverlay t={t} onComplete={onGameLoadingComplete} />}

      <div 
        className={`fixed inset-0 bg-black text-white flex flex-col transition-opacity duration-1000 ${view === 'splash' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050209]">
            {/* Elegant Fuchsia & Purple ambient glow lights */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-fuchsia-500/10 via-purple-600/5 to-transparent blur-[120px] animate-pulse duration-[8s]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-purple-600/10 via-fuchsia-500/5 to-transparent blur-[120px] animate-pulse duration-[10s]" />
            <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-fuchsia-500/5 to-transparent blur-[100px]" />
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none -z-10" />
        </div>
        <header className="px-6 py-4 flex items-center justify-between border-b border-fuchsia-500/10 bg-black/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            {view !== 'platform_selection' && view !== 'admin' && (
              <button 
                onClick={handleBack}
                className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all group active:scale-90"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-fuchsia-400 transition-colors" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <img 
                src="https://i.pinimg.com/736x/eb/d5/fb/ebd5fb2023eab6f8d038609c70d2f8d9.jpg" 
                alt="Logo" 
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(217,70,239,0.7)] animate-pulse rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-black text-xl tracking-tight text-white uppercase select-none">
                DARK <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.7)]">EVIL</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => { audioManager.playClick(); setIsLangMenuOpen(!isLangMenuOpen); }}
                  className={`flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-lg bg-zinc-950 border transition-all duration-200 group ${isLangMenuOpen ? 'border-fuchsia-500 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                    <span className="text-xs">{lang === 'en' ? '🇬🇧' : '🇸🇦'}</span>
                    <span className="text-[10px] font-black font-mono tracking-widest">{lang === 'en' ? 'EN' : 'AR'}</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isLangMenuOpen ? 'rotate-180 text-fuchsia-400' : ''}`} />
                </button>

                {isLangMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => { audioManager.playClick(); setIsLangMenuOpen(false); }} />
                    <div className="absolute top-full mt-2 w-36 bg-zinc-950 border border-fuchsia-500/20 rounded-xl shadow-[0_0_30px_rgba(217,70,239,0.15)] overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200 right-0">
                       <div className="p-1 space-y-0.5">
                          <button
                            onClick={() => toggleLanguage('en')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${lang === 'en' ? 'bg-fuchsia-500/10 text-fuchsia-400 font-extrabold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                          >
                             <span className="text-xs">🇬🇧</span>
                             <span className="text-[10px] font-black font-display tracking-widest uppercase">ENGLISH</span>
                          </button>
                          
                          <button
                            onClick={() => toggleLanguage('ar')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${lang === 'ar' ? 'bg-fuchsia-500/10 text-fuchsia-400 font-extrabold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                          >
                             <span className="text-xs">🇸🇦</span>
                             <span className="text-[10px] font-black font-display tracking-widest uppercase">العربية</span>
                          </button>
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none" 
              style={{ 
                  backgroundImage: 'linear-gradient(rgba(217,70,239,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(217,70,239,0.1) 1px, transparent 1px)', 
                  backgroundSize: '40px 40px'
              }} 
            />
            <div className="h-full w-full max-w-lg mx-auto relative z-10">
                {renderContent()}
            </div>
        </main>

        {showInfoModal && <RulesModal onClose={() => { audioManager.playClick(); setShowInfoModal(false); }} lang={lang} t={t} />}
        {approvalPending && (
          <AdminApprovalModal
            userId={userId}
            lang={lang}
            onApprove={handleApprovalSuccess}
            onReject={handleApprovalRejected}
            onDismiss={handleApprovalDismiss}
          />
        )}
      </div>
    </div>
  );
};

export default App;
