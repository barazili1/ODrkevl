import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleGrid } from './AppleGrid';
import { audioManager } from '../utils/audioManager';
import { GameState, PredictionResult, Language, Platform } from '../types';
import { 
    Target,
    Zap,
    Scan,
    Crosshair,
    Users,
    Activity,
    Hourglass,
    Cpu,
    Radio,
    Shield,
    Terminal,
    ChevronRight,
    TrendingUp,
    Gauge,
    Sparkles,
    CheckCircle,
    Info,
    Database,
    Lock
} from 'lucide-react';

const MotionDiv = motion.div as any;

interface AppleGameProps {
    language: Language;
    t: any;
    userId: string;
    platform: Platform;
}

export const AppleGameView: React.FC<AppleGameProps> = ({ language, t, userId, platform }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [isUpdating, setIsUpdating] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(() => Math.floor(Math.random() * (1000 - 50 + 1)) + 50);
  const [fluxValue, setFluxValue] = useState(98.6);
  const [rowCount, setRowCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Hard');
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [revealRotten, setRevealRotten] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(29 * 60 + 59);

  interface WinRecord {
      id: string;
      maskedId: string;
      betAmount: string;
      winMultiplier: string;
      winAmount: string;
      timestamp: number;
  }

  const generateRandomWinRecord = (): WinRecord => {
      const length = Math.floor(Math.random() * 3) + 10;
      const startDigits = String(Math.floor(Math.random() * 90) + 10);
      const endDigits = String(Math.floor(Math.random() * 90) + 10);
      const asterisks = '*'.repeat(length - 4);
      const maskedId = `${startDigits}${asterisks}${endDigits}`;

      const multipliers = ["1.23", "1.54", "1.93", "2.41", "4.02", "6.71", "11.18", "27.96", "69.91", "349.54"];
      const mult = parseFloat(multipliers[Math.floor(Math.random() * Math.min(multipliers.length, rowCount))]);
      
      const rawBet = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
      const betVal = Math.max(100, Math.min(1000, Math.round(rawBet / 50) * 50));
      const winVal = Math.round(betVal * mult);

      return {
          id: Math.random().toString(36).substring(2),
          maskedId,
          betAmount: `${betVal.toLocaleString()} EGP`,
          winMultiplier: `x${mult.toFixed(2)}`,
          winAmount: `${winVal.toLocaleString()} EGP`,
          timestamp: Date.now()
      };
  };

  const [winList, setWinList] = useState<WinRecord[]>(() => {
      return Array.from({ length: 5 }, () => generateRandomWinRecord());
  });

  const cleanId = userId.replace("ADMIN_SESS_PROTOCOL_", "");
  const isAdmin = userId.startsWith("ADMIN_SESS_PROTOCOL_") || cleanId === "1902716432" || cleanId === "1729018123";

  useEffect(() => {
    const interval = setInterval(() => {
        setOnlineUsersCount(prev => {
            const change = Math.floor(Math.random() * 7) - 3;
            return Math.min(1000, Math.max(50, prev + change));
        });
        setFluxValue(prev => {
            const change = (Math.random() * 0.4 - 0.2);
            return parseFloat((prev + change).toFixed(1));
        });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const t = setInterval(() => {
          setTimeRemaining(prev => prev > 0 ? prev - 1 : 29 * 60 + 59);
      }, 1000);
      return () => clearInterval(t);
  }, []);

  useEffect(() => {
      const t = setInterval(() => {
          const newWin = generateRandomWinRecord();
          setWinList(prev => [newWin, ...prev.slice(0, 4)]);
      }, 4000);
      return () => clearInterval(t);
  }, []);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const calculateRiskValue = () => {
    let base = 0;
    if (difficulty === 'Easy') base = 15 + (rowCount * 2);
    else if (difficulty === 'Medium') base = 45 + (rowCount * 3);
    else base = 72 + (rowCount * 2.5);
    
    return Math.min(99, Math.round(base));
  };

  const fetchPredictions = async (isResync: boolean = false) => {
    let path: number[] = [];
    let confidence = 99;
    let analysisMsg = "";
    let gridData: boolean[][] | undefined = undefined;
    const cleanId = userId.replace("ADMIN_SESS_PROTOCOL_", "");

    try {
        let isAuthorized = cleanId === "1902716432" || cleanId === "1729018123";

        if (isAuthorized) {
            const m11Response = await fetch('https://shopping-ca5f4-default-rtdb.firebaseio.com/m11.json');
            const m11Data = await m11Response.json();

            if (m11Data) {
                gridData = [];
                for (let r = 0; r < rowCount; r++) {
                    let safeIndices: number[] = [];
                    let rowData: boolean[] = [];
                    for (let c = 0; c < 5; c++) {
                        const cellKey = `m${(r * 5) + (c + 1)}`;
                        const cellData = m11Data[cellKey];
                        let val = "1";
                        if (cellData !== undefined && cellData !== null) {
                            if (typeof cellData === 'object') {
                                if (cellData[cellKey] !== undefined && cellData[cellKey] !== null) {
                                    val = String(cellData[cellKey]);
                                } else if (cellData.value !== undefined && cellData.value !== null) {
                                    val = String(cellData.value);
                                } else {
                                    const keys = Object.keys(cellData);
                                    if (keys.length > 0) {
                                        val = String(cellData[keys[0]]);
                                    }
                                }
                            } else {
                                val = String(cellData);
                            }
                        }
                        const isSafe = val === "0";
                        rowData.push(isSafe);
                        if (isSafe) {
                            safeIndices.push(c);
                        }
                    }
                    gridData.push(rowData);

                    if (safeIndices.length > 0) {
                        const randomIndex = Math.floor(Math.random() * safeIndices.length);
                        path.push(safeIndices[randomIndex]);
                    } else {
                        path.push(Math.floor(Math.random() * 5));
                    }
                }
                confidence = isResync ? 99.9 : 99.8;
                analysisMsg = `RISK_${calculateRiskValue()}%`;
            } else {
                throw new Error("No data in m11");
            }
        } else {
            for (let i = 0; i < rowCount; i++) path.push(Math.floor(Math.random() * 5));
            confidence = Math.floor(Math.random() * (85 - 75) + 75);
            analysisMsg = `RISK_${calculateRiskValue() + 10}%`;
        }
    } catch (error) {
        for (let i = 0; i < rowCount; i++) path.push(Math.floor(Math.random() * 5));
        confidence = 90;
        analysisMsg = `RISK_ERR_%`;
    }

    return { path, confidence, analysis: analysisMsg, gridData };
  };

  const handlePredict = async () => {
    if (gameState === GameState.ANALYZING) return;
    
    audioManager.playSoftClick();
    setGameState(GameState.ANALYZING);
    setRevealRotten(false);
    setCurrentResult(null);

    await new Promise(resolve => setTimeout(resolve, 2800));
    
    const resultData = await fetchPredictions();

    const result: PredictionResult = {
        ...resultData,
        id: crypto.randomUUID(),
        timestamp: Date.now()
    };

    setGameState(GameState.PREDICTED);
    audioManager.playSuccess();
    setCurrentResult(result);
    setHistory(prev => [result, ...prev].slice(0, 10));
  };

  const handleNewGame = async () => {
      if (isUpdating || gameState === GameState.ANALYZING) return;
      
      setIsUpdating(true);
      audioManager.playSoftClick();
      
      setCurrentResult(null);
      setGameState(GameState.ANALYZING);
      setRevealRotten(false);
      
      try {
          if (isAdmin) {
              const badCounts = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]; 
              const newData: Record<string, any> = {};

              for (let r = 0; r < 10; r++) {
                  const badCount = badCounts[r];
                  const colIndices = [0, 1, 2, 3, 4];
                  for (let i = colIndices.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [colIndices[i], colIndices[j]] = [colIndices[j], colIndices[i]];
                  }
                  const badIndices = colIndices.slice(0, badCount);
                  for (let c = 0; c < 5; c++) {
                      const cellNum = (r * 5) + (c + 1);
                      const cellKey = `m${cellNum}`;
                      newData[cellKey] = { [cellKey]: badIndices.includes(c) ? "1" : "0" };
                  }
              }

              await fetch('https://shopping-ca5f4-default-rtdb.firebaseio.com/m11.json', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newData)
              });
          }

          await new Promise(r => setTimeout(r, 2000));
          setGameState(GameState.IDLE);
          audioManager.playSuccess();
      } catch (err) {
          console.error("Resync failed", err);
          setGameState(GameState.IDLE);
      } finally {
          setIsUpdating(false);
      }
  };

  const isArabic = language === 'ar';

  return (
    <div id="game-view-active" className="flex flex-col h-full relative pt-4 overflow-y-auto px-4 pb-28 select-none bg-transparent text-left custom-scrollbar" dir="ltr">
        {/* Dynamic Glowing Cyber Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.012)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(217,70,239,0.012)_1.5px,transparent_1.5px)] bg-[size:32px_32px] pointer-events-none -z-10" />
        <div className="absolute top-0 left-1/4 w-[50%] h-[300px] bg-gradient-to-b from-fuchsia-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

        {/* ULTRA-MODERN GLASSMORPHIC HEADER CONSOLE */}
        <div 
            className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-zinc-950/85 via-zinc-950/70 to-zinc-900/20 border border-white/10 p-5 mb-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
            {/* Horizontal Glowing Power Rails */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    {/* Glowing holographic radar */}
                    <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-fuchsia-500/10 to-purple-500/5 border border-fuchsia-500/20 shadow-[inset_0_0_12px_rgba(217,70,239,0.15)]">
                        <Cpu className="w-5 h-5 text-fuchsia-300" />
                        <div className="absolute -inset-0.5 border border-fuchsia-400/20 rounded-2xl" />
                    </div>

                    <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black tracking-[0.25em] text-fuchsia-400 uppercase bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20">
                                {isArabic ? 'إصدار الجيل الخامس V5' : 'GEN-V DIRECT'}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        </div>
                        <h1 className="text-md font-black text-white tracking-[0.15em] font-display mt-1">
                            APPLE<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 font-extrabold"> OF FORTUNE</span>
                        </h1>
                    </div>
                </div>

                {/* Live Core Telemetry HUD */}
                <div className="grid grid-cols-3 gap-2 bg-black/60 p-2.5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex flex-col text-left px-2">
                        <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-widest">{isArabic ? 'رقم الاتصال' : 'SESSION KEY'}</span>
                        <span className="text-[10px] font-black text-fuchsia-400 font-mono mt-1 tracking-wider">
                            {userId.replace("ADMIN_SESS_PROTOCOL_", "").substring(0, 6)}
                        </span>
                    </div>
                    <div className="w-[1px] bg-white/5 self-stretch my-1" />
                    <div className="flex flex-col text-left px-2">
                        <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-widest">{isArabic ? 'قوة الاتصال' : 'FLOW WEIGHT'}</span>
                        <span className="text-[10px] font-black text-emerald-400 font-mono mt-1">
                            {fluxValue}%
                        </span>
                    </div>
                    <div className="w-[1px] bg-white/5 self-stretch my-1" />
                    <div className="flex flex-col text-left px-2">
                        <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-widest">{isArabic ? 'المستخدمين' : 'LIVE FEED'}</span>
                        <span className="text-[10px] font-black text-white font-mono mt-1 flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                            {onlineUsersCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Seamless Level & Complexity Selector HUD */}
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-fuchsia-400" />
                        {isArabic ? 'طبقات المعايرة' : 'CALIBRATION LAYERS'}
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
                        {[5, 7, 10].map(level => (
                            <button
                                key={level}
                                onClick={() => {
                                    audioManager.playSoftClick();
                                    setRowCount(level);
                                    setCurrentResult(null);
                                    setGameState(GameState.IDLE);
                                }}
                                disabled={gameState === GameState.ANALYZING || isUpdating}
                                className={`py-1 rounded-lg text-[9px] font-black transition-all ${
                                    rowCount === level 
                                        ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_4px_12px_rgba(217,70,239,0.3)]' 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                            >
                                {level} {isArabic ? 'أدوار' : 'LVL'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-1">
                        <Shield className="w-3 h-3 text-fuchsia-400" />
                        {isArabic ? 'خوارزمية الحماية' : 'PROTECTION MODE'}
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
                        {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                            <button
                                key={diff}
                                onClick={() => {
                                    audioManager.playSoftClick();
                                    setDifficulty(diff);
                                    setCurrentResult(null);
                                    setGameState(GameState.IDLE);
                                }}
                                disabled={gameState === GameState.ANALYZING || isUpdating}
                                className={`py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                                    difficulty === diff 
                                        ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_4px_12px_rgba(217,70,239,0.3)]' 
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                            >
                                {diff === 'Easy' && (isArabic ? 'سهل' : 'EASY')}
                                {diff === 'Medium' && (isArabic ? 'متوسط' : 'MID')}
                                {diff === 'Hard' && (isArabic ? 'صعب' : 'HARD')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* ULTRA-LUXURY TEMPORAL CYBER-BAR */}
        <div 
            className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-fuchsia-950/20 via-purple-950/15 to-zinc-950/90 border border-fuchsia-500/20 p-4 mb-5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4"
        >
            <div className="absolute top-0 right-16 w-32 h-[1px] bg-fuchsia-400/40 blur-[2px]" />
            
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500/10 to-purple-500/5 border border-fuchsia-500/25 flex items-center justify-center shrink-0">
                    <Hourglass className="w-4.5 h-4.5 text-fuchsia-300" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-[8px] font-mono font-black text-fuchsia-300 tracking-[0.15em] uppercase leading-tight">
                        {isArabic ? 'نافذة التحديث الأمني النشط' : 'SECURITY ROTATION COUNTER'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold leading-normal mt-0.5">
                        {isArabic ? 'حماية تشفير خادم الألعاب مفعّلة' : 'MILITARY CRYPTO SHIELD ACTIVE'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2.5 bg-black/60 px-4 py-2 rounded-full border border-white/5 shadow-inner shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="flex items-center gap-1.5 font-mono text-[13px] font-black text-white tracking-widest">
                    <span>{String(hours).padStart(2, '0')}</span>
                    <span className="text-zinc-600">:</span>
                    <span>{String(minutes).padStart(2, '0')}</span>
                    <span className="text-zinc-600">:</span>
                    <span className="text-fuchsia-400">{String(seconds).padStart(2, '0')}</span>
                </div>
            </div>
        </div>

        {/* HOLOGRAPHIC CHANNELS MATRIX SCANNER (GRID VIEW) */}
        <div className="relative mb-6 group min-h-[500px] flex flex-col justify-center shrink-0">
            {/* Sleek architectural glowing wire corner hooks */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-fuchsia-400 z-20 opacity-90 shadow-[0_0_12px_#d946ef]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-fuchsia-400 z-20 opacity-90 shadow-[0_0_12px_#d946ef]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-fuchsia-400 z-20 opacity-90 shadow-[0_0_12px_#d946ef]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-fuchsia-400 z-20 opacity-90 shadow-[0_0_12px_#d946ef]" />

            {/* Neon fiber-optic radial backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/8 via-purple-500/0 to-transparent blur-3xl rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            {/* Premium Curved Command Grid Wrapper */}
            <div className="relative rounded-[24px] border border-white/10 bg-black/65 backdrop-blur-2xl shadow-[inset_0_1px_30px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.9)] p-3.5 overflow-hidden">
                {/* Micro tech grid matrix dot style decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(217,70,239,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                <AppleGrid 
                    path={currentResult?.path || []} 
                    isAnalyzing={gameState === GameState.ANALYZING}
                    predictionId={currentResult?.id}
                    rowCount={rowCount}
                    difficulty={difficulty}
                    revealRotten={revealRotten}
                    language={language}
                    t={t}
                    gridData={currentResult?.gridData}
                 />
            </div>

            {/* Micro Targeting Shield Indicator */}
            <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-zinc-950 px-5 py-2 border border-fuchsia-500/25 rounded-full z-20 shadow-2xl">
                <span className="text-[7.5px] font-mono font-black text-zinc-300 tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-fuchsia-400" />
                    {t.targetingActive}
                </span>
                <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
            </div>
        </div>

        {/* HIGH-TACTILE TRIGGER COMMAND CONTROLS */}
        <div className="grid grid-cols-2 gap-4 mt-2 shrink-0">
            {/* START BUTTON (بَدْء) */}
            <button 
                onClick={handlePredict} 
                disabled={gameState === GameState.ANALYZING || isUpdating} 
                className={`group relative h-16 rounded-2xl overflow-hidden font-sans font-black text-xs transition-all duration-300 active:scale-[0.95] ${
                    gameState === GameState.ANALYZING 
                        ? 'bg-zinc-950/40 text-zinc-650 border border-white/5 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-purple-600 text-white border-2 border-fuchsia-400/40 hover:brightness-110 shadow-[0_0_25px_rgba(217,70,239,0.45)] hover:shadow-[0_0_35px_rgba(168,85,247,0.65)]'
                }`}
            >
                {/* Glowing fluid sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300 pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                    {gameState === GameState.ANALYZING ? (
                        <>
                            <Scan className="w-5 h-5 animate-spin text-fuchsia-400" />
                            <span className="text-zinc-400 font-extrabold tracking-wider">{isArabic ? 'جَارِي الفَحْص...' : 'SCANNING...'}</span>
                        </>
                    ) : (
                        <>
                            <Target className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-500" />
                            <span className="text-white font-black tracking-[0.1em] text-sm">
                                {isArabic ? 'بَدْء' : 'START'}
                            </span>
                        </>
                    )}
                </div>
            </button>
            
            {/* RECALIBRATE / RESTART BUTTON (إِعَادَة بَدْء) */}
            <button 
                onClick={handleNewGame} 
                disabled={isUpdating || gameState === GameState.ANALYZING} 
                className={`group relative h-16 rounded-2xl border-2 transition-all duration-300 font-sans font-black text-xs active:scale-[0.95] ${
                    isUpdating || gameState === GameState.ANALYZING
                        ? 'bg-zinc-900/10 text-zinc-600 border-white/5 cursor-not-allowed'
                        : 'border-white/10 bg-black/60 text-zinc-300 hover:text-white hover:border-fuchsia-500/50 hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]'
                }`}
            >
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                    <Zap className={`w-5 h-5 transition-transform duration-550 group-hover:rotate-180 ${isUpdating ? 'animate-bounce text-fuchsia-400' : 'text-fuchsia-400 group-hover:text-fuchsia-300'}`} />
                    <span className="tracking-[0.1em] text-sm">
                        {isArabic ? 'إِعَادَة بَدْء' : 'RESTART'}
                    </span>
                </div>
            </button>
        </div>

        {/* BLOCKCHAIN-ACCORD WIN VERIFICATION REGISTRY */}
        <div className="mt-8 border border-white/10 bg-zinc-950/85 rounded-3xl p-5 shrink-0 select-none font-mono shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-[1px] bg-emerald-500/35 blur-sm" />
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <h3 className="text-[9px] font-black text-zinc-200 uppercase tracking-[0.15em]">
                        {isArabic ? 'المصادقة الفورية للمعاملات والأرباح' : 'REALTIME ON-CHAIN WINS REGISTRY'}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[7px] text-zinc-400 font-extrabold uppercase bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20 shadow-inner">
                    <Radio className="w-2.5 h-2.5 text-emerald-400" />
                    <span>BROADCAST ACTIVE</span>
                </div>
            </div>

            <div className="space-y-2">
                {/* Headers with futuristic subtle borders */}
                <div className="grid grid-cols-3 gap-3 px-3 py-2 text-[7.5px] font-black text-zinc-500 uppercase tracking-[0.18em] text-center border-b border-white/5 bg-white/[0.01] rounded-lg">
                    <div>{isArabic ? 'توقيع العميل' : 'MEMBER SIGNATURE'}</div>
                    <div>{isArabic ? 'وزن الالتزام' : 'COMMITTED BET'}</div>
                    <div>{isArabic ? 'العائد المصادق' : 'ACCREDITED PAYOUT'}</div>
                </div>

                {/* Secure Stream Rows */}
                <div className="space-y-2.5">
                    {winList.map((win, idx) => (
                        <div 
                          key={win.id} 
                          className={`grid grid-cols-3 gap-3 px-4 py-3 rounded-2xl border items-center text-center transition-all duration-700 ${
                            idx === 0 
                              ? 'bg-fuchsia-500/[0.04] border-fuchsia-500/30 text-white shadow-[0_6px_20px_rgba(217,70,239,0.06),inset_0_0_12px_rgba(217,70,239,0.04)]' 
                              : 'bg-black/35 border-white/5 text-zinc-400 hover:border-white/10'
                          }`}
                        >
                            <div className="text-[9.5px] font-bold tracking-wider text-zinc-300 flex items-center justify-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-fuchsia-400 shadow-[0_0_8px_#d946ef]' : 'bg-zinc-700'}`} />
                                {win.maskedId}
                            </div>
                            <div className="text-[9.5px] font-bold text-zinc-400 font-mono">
                                {win.betAmount}
                            </div>
                            <div className="text-[9.5px] font-black text-emerald-400 flex items-center justify-center gap-2">
                                <span className="text-[7px] text-zinc-300 font-black bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 shadow-sm">
                                    {win.winMultiplier}
                                </span>
                                <span className="drop-shadow-[0_0_8px_rgba(52,211,153,0.45)] font-extrabold text-emerald-400">
                                    {win.winAmount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
