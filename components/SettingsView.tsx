import React, { useState } from 'react';
import { Copy, Check, Upload, ArrowRight, ArrowLeft, Download, CreditCard, ShieldCheck, Server, Fingerprint, Database, Image, Shield, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { Language } from '../utils/translations';
import { Platform } from '../types';
import { audioManager } from '../utils/audioManager';

interface SettingsViewProps {
  onComplete: (userId: string, bypass?: boolean) => void;
  lang: Language;
  t: any;
  platform: Platform;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onComplete, lang, t, platform }) => {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ userId?: boolean; screenshot?: boolean; profileScreenshot?: boolean; userIdLength?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [statusText, setStatusText] = useState("ESTABLISHING...");
  const [isApprovedOnServer, setIsApprovedOnServer] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const platformName = "Megapari";
  const platformImg = 'https://i.pinimg.com/736x/eb/d5/fb/ebd5fb2023eab6f8d038609c70d2f8d9.jpg';
  const megapariDownloadUrl = "https://4718241mp.pro/ar/mobile";

  const isArabic = lang === 'ar';

  const [verificationSteps, setVerificationSteps] = useState([
    { id: 'server', label: isArabic ? "مزامنة الخادم البنفسجي" : "Syncing Royal Amethyst Core", status: "pending", icon: Server },
    { id: 'deposit', label: isArabic ? "توثيق رصيد المحفظة" : "Validating VIP Token Limits", status: "pending", icon: Database },
    { id: 'id', label: isArabic ? "مصادقة العقدة المشفرة" : "Authorizing Secure Signature", status: "pending", icon: Fingerprint }
  ]);

  // Dynamically check Firebase if entered ID is already approved by Administrator
  React.useEffect(() => {
    const trimmedId = userId.trim();
    if (trimmedId.length >= 8 && trimmedId.length <= 15) {
      if (trimmedId === "000999000") {
        setIsApprovedOnServer(false);
        return;
      }
      
      if (trimmedId === "1902716432" || trimmedId === "1729018123") {
        setIsApprovedOnServer(true);
        return;
      }
      
      const checkStatus = async () => {
        try {
          const res = await fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${trimmedId}.json`);
          if (res.ok) {
            const status = await res.json();
            if (status === 'approved') {
              setIsApprovedOnServer(true);
              localStorage.setItem(`admin_approval_status_${trimmedId}`, 'approved');
              localStorage.setItem('bypass_approved_userId', trimmedId);
              return;
            }
          }
          setIsApprovedOnServer(false);
        } catch (e) {
          console.error("Error reading approval database node:", e);
          setIsApprovedOnServer(false);
        }
      };

      const timer = setTimeout(checkStatus, 400);
      return () => clearTimeout(timer);
    } else {
      setIsApprovedOnServer(false);
    }
  }, [userId]);

  const handleCopy = () => {
    audioManager.playCopy();
    navigator.clipboard.writeText("DARK200"); 
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      try {
        const base64 = await fileToBase64(file);
        setScreenshotBase64(base64);
        setErrors(prev => ({ ...prev, screenshot: false }));
      } catch (err) {
        console.error("Error reading file to base64", err);
      }
    }
  };

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProfilePreviewUrl(url);
      try {
        const base64 = await fileToBase64(file);
        setProfileBase64(base64);
        setErrors(prev => ({ ...prev, profileScreenshot: false }));
      } catch (err) {
        console.error("Error reading file to base64", err);
      }
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 15) {
        setUserId(val);
        if (val.length >= 8) {
             setErrors(prev => ({ ...prev, userId: false, userIdLength: false }));
        }
    }
  };

  const validateAndSubmit = async () => {
    audioManager.playClick();
    const trimmedId = userId.trim();
    
    // Check if user entered Admin ID Bypass code
    if (trimmedId === "000999000") {
      setIsSubmitting(true);
      setStatusText(isArabic ? "مصادقة المشرف العام..." : "AUTHORIZING MASTER ACCESS...");
      setOverallProgress(50);
      setTimeout(() => {
        setOverallProgress(100);
        setTimeout(() => {
          setIsSubmitting(false);
          onComplete("000999000");
        }, 300);
      }, 1000);
      return;
    }

    if (trimmedId === "1902716432" || trimmedId === "1729018123") {
      setIsSubmitting(true);
      setStatusText(isArabic ? "تأمين ونقل العقدة مباشرة..." : "SPINNING DIRECT ROYAL PURPLE TUNNEL...");
      setOverallProgress(35);
      setTimeout(() => {
        setOverallProgress(100);
        setTimeout(() => {
          setIsSubmitting(false);
          localStorage.setItem('bypass_approved_userId', trimmedId);
          localStorage.setItem(`admin_approval_status_${trimmedId}`, 'approved');
          onComplete(trimmedId, true);
        }, 350);
      }, 1200);
      return;
    }

    const isLengthValid = trimmedId.length >= 8 && trimmedId.length <= 15;
    
    const newErrors = {
      userId: !trimmedId,
      userIdLength: !isLengthValid && !!trimmedId,
      screenshot: !isApprovedOnServer && !previewUrl,
      profileScreenshot: !isApprovedOnServer && !profilePreviewUrl
    };

    setErrors(newErrors);

    if (!newErrors.userId && !newErrors.userIdLength && !newErrors.screenshot && !newErrors.profileScreenshot) {
      const startTime = Date.now();

      // If already pre-approved, skip upload flow and bypass instantly
      if (isApprovedOnServer) {
        setIsSubmitting(true);
        setStatusText(isArabic ? "تأمين ونقل العقدة مباشرة..." : "SPINNING DIRECT ROYAL PURPLE TUNNEL...");
        setOverallProgress(35);
        setTimeout(() => {
          setOverallProgress(100);
          setTimeout(() => {
            setIsSubmitting(false);
            localStorage.setItem('bypass_approved_userId', trimmedId);
            localStorage.setItem(`admin_approval_status_${trimmedId}`, 'approved');
            onComplete(trimmedId, true);
          }, 350);
        }, 1200);
        return;
      }

      setIsSubmitting(true);
      
      const updateStep = (index: number, status: string) => {
        setVerificationSteps(prev => 
          prev.map((step, i) => i === index ? { ...step, status } : step)
        );
      };

      updateStep(0, "active");
      setStatusText(isArabic ? "نقل مستندات التوثيق الفاخرة..." : "TRANSMITTING ROYAL PROOF ASSETS...");
      
      let uploadSuccess = false;

      // Trigger Firebase uploads
      try {
        const picPromise = fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/pics/${trimmedId}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: trimmedId,
            screenshot: screenshotBase64,
            profileScreenshot: profileBase64,
            createdAt: startTime
          })
        });

        const statusPromise = fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${trimmedId}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify("pending")
        });

        const responses = await Promise.all([picPromise, statusPromise]);
        if (responses[0].ok && responses[1].ok) {
          uploadSuccess = true;
        }
      } catch (err) {
        console.error("Firebase Realtime DB upload failed", err);
      }

      // Progress bar simulation for smooth user feedback
      const duration = 5000;
      const interval = 30;
      const totalStepsCount = duration / interval;
      const increment = 100 / totalStepsCount;

      const timer = setInterval(() => {
        setOverallProgress(prev => {
            const next = prev + increment;
            if (next >= 33 && next < 66 && verificationSteps[0].status !== 'completed') {
                updateStep(0, "completed");
                updateStep(1, "active");
                setStatusText(isArabic ? "مراجعة أرصدة التفعيل مع الخادم..." : "AUDITING INTEGRITY MATRIX LIMITS...");
            }
            if (next >= 66 && next < 95 && verificationSteps[1].status !== 'completed') {
                updateStep(1, "completed");
                updateStep(2, "active");
                setStatusText(isArabic ? "تسجيل وبناء بروتوكول العقدة الحصري..." : "ENGAGING SECURE DUAL-CHANNEL CIPHER...");
            }
            if (next >= 100) {
                updateStep(2, "completed");
                setStatusText(isArabic ? "تم حفظ طلب التفعيل بنجاح" : "VIP ACCESS RECORD COMMITTED");
                clearInterval(timer);
                return 100;
            }
            return next;
        });
      }, interval);

      setTimeout(() => {
        // Save to local storage for countdown and tracking
        localStorage.setItem('admin_approval_userId', trimmedId);
        
        // Only set a new timer start time if it doesn't already exist
        const existingTimerStart = localStorage.getItem(`admin_approval_timer_start_${trimmedId}`);
        if (!existingTimerStart) {
          localStorage.setItem(`admin_approval_timer_start_${trimmedId}`, startTime.toString());
        }
        
        localStorage.setItem(`admin_approval_status_${trimmedId}`, 'pending');

        setIsSubmitting(false);
        onComplete(trimmedId);
      }, duration + 500);
    }
  };

  const stepTexts = {
    step1_tag: isArabic ? "المصادقة" : "PASS 01",
    step1_title: isArabic ? "شفرة التفعيل الخاصة" : "ROYAL PROMO KEY",
    step1_desc: isArabic ? "قم بالتسجيل داخل التطبيق باستخدام الرمز الخاص DARK200 لتسجيل جهازك في مصفوفة كبار الشخصيات." : "Register a brand new account and input code DARK200 to link your client to the premium oracle.",
    step1_copy: isArabic ? "نسخ رمز التفعيل الفريد" : "COPY ACTION KEY",
    step1_copied: isArabic ? "تم النسخ بنجاح!" : "COPIED TO CLIPBOARD",
    
    step2_tag: isArabic ? "شريان الاتصال" : "LINK 02",
    step2_title: isArabic ? "تحميل العميل الرسمي" : "OBTAIN ROYAL APP CLIENT",
    step2_desc: isArabic ? "انقر أدناه للحصول على تطبيق Megapari الرسمي للبدء في ربط وتزامن مصفوفة التنبؤات الملكية." : "Acquire the official, unmodified Megapari client on your device to unlock predictions syncing.",
    step2_btn: isArabic ? "تحميل تطبيق Megapari" : "DOWNLOAD CLIENT NOW",
    
    step3_tag: isArabic ? "الموازنة" : "LIMIT 03",
    step3_title: isArabic ? "شحن رصيد البوابة" : "VIP ACTIVATION LIMITS",
    step3_desc: isArabic ? "قم بتمويل حسابك الجديد بالحد الأدنى المطلوب لتأكيد تفعيل البوابة على مخدمات التنبؤ مباشرة:" : "Fund your new client account with the limit below to trigger direct live bypass authorization:",
    step3_global: isArabic ? "الخادم العالمي" : "GLOBAL NODE",
    step3_local: isArabic ? "الخ مصر المحلي" : "EGYPT LOCAL NODE",
    
    step4_tag: isArabic ? "التوثيق" : "SIGN 04",
    step4_title: isArabic ? "توثيق الهوية الرقمية" : "AUTHENTICATE VIP IDENTITY",
    step4_desc: isArabic ? "أدخل معرف الحساب الجديد وارفع لقطات الشاشة المطلوبة للمصادقة وبدء تشغيل المصفوفة." : "Submit your registered user ID and upload validation documents to active the gold oracle forecast.",
    userid_placeholder: isArabic ? "أدخل المعرف (مثال: 5493028)" : "Enter registered ID (e.g. 5493028)",
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-20 overflow-y-auto custom-scrollbar relative bg-transparent select-none" dir="ltr">
      {/* Radiant Velvet Purple Background Glows */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none h-64 z-0 opacity-40 blur-3xl" />
      
      {/* Sleek, Modern Minimal Header */}
      <div className="mb-6 text-center relative z-10 animate-in fade-in duration-500 mt-2">
        <div className="inline-flex flex-col items-center">
          <div className="w-14 h-14 mb-3 rounded-[1.5rem] bg-gradient-to-tr from-[#160c2b] to-[#040107] border border-fuchsia-500/30 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.8)] p-1 relative group">
            <img 
              src="https://i.pinimg.com/736x/eb/d5/fb/ebd5fb2023eab6f8d038609c70d2f8d9.jpg" 
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(217,70,239,0.5)] rounded-xl" 
              alt="Logo" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border border-dashed border-fuchsia-500/20 rounded-[1.5rem] animate-[spin_30s_linear_infinite]" />
          </div>
          
          <h2 className="text-xl font-display font-black text-white tracking-tight uppercase leading-none mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            {isArabic ? "مصفوفة شروط التفعيل" : "GATEWAY SIGNATURE BOARD"}
          </h2>
          
          <p className="text-[7.5px] font-mono text-fuchsia-400 uppercase tracking-widest font-extrabold">
            {isArabic ? "أكمل متطلبات التحقق لبدء البث المباشر للمصفوفة" : "EXECUTE PORT VALIDATION TO ACTIVATE SYSTEM"}
          </p>
        </div>
      </div>

      {localStorage.getItem('admin_approval_userId') && localStorage.getItem(`admin_approval_status_${localStorage.getItem('admin_approval_userId')}`) === 'pending' && (
        <div 
          onClick={() => {
            audioManager.playClick();
            onComplete(localStorage.getItem('admin_approval_userId') || userId || "000"); 
          }}
          className="mb-5 mx-auto max-w-[325px] w-full p-3.5 rounded-2xl bg-fuchsia-950/15 border border-fuchsia-500/30 text-center cursor-pointer hover:bg-fuchsia-950/25 transition-all flex items-center justify-between group shadow-[0_0_15px_rgba(168,85,247,0.1)] active:scale-98 relative z-10 animate-in zoom-in duration-300"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-ping shadow-[0_0_8px_#d946ef]" />
            <div className="text-left">
              <span className="block text-[7.5px] font-mono text-zinc-500 font-extrabold uppercase tracking-widest leading-none">
                {isArabic ? "حالة التحقق: معلق بالمخدم" : "PORT VECTOR STATUS: PENDING"}
              </span>
              <span className="block text-[11px] text-white font-mono font-black mt-0.5">
                ID: {localStorage.getItem('admin_approval_userId')}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-fuchsia-300">
            {isArabic ? "فتح شاشة الموقت" : "OPEN TIMER"} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Premium Step Wizard Stepper Progress Bar */}
      <div className="max-w-[325px] mx-auto w-full mb-6 relative z-10 px-2">
        <div className="flex justify-between items-center relative">
          {/* Progress bar line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-850 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-fuchsia-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ 
              width: `${((currentStep - 1) / 3) * 100}%`
            }} 
          />
          
          {[1, 2, 3, 4].map((stepNum) => {
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <button
                key={stepNum}
                onClick={() => {
                  if (stepNum < currentStep) {
                    audioManager.playClick();
                    setCurrentStep(stepNum);
                  }
                }}
                disabled={stepNum >= currentStep}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border font-mono text-xs font-black transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-fuchsia-500 border-fuchsia-500 text-black shadow-[0_0_12px_rgba(217,70,239,0.4)]' 
                    : isActive 
                      ? 'bg-zinc-950 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.25)] scale-110' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-550'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3.5px]" /> : stepNum}
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-2.5 text-[8.5px] font-mono font-black uppercase text-zinc-500 tracking-wider">
          <span className={currentStep === 1 ? 'text-fuchsia-400' : ''}>{isArabic ? '1. الرمز' : '1. KEY'}</span>
          <span className={currentStep === 2 ? 'text-fuchsia-400' : ''}>{isArabic ? '2. التحميل' : '2. DOWNLOAD'}</span>
          <span className={currentStep === 3 ? 'text-fuchsia-400' : ''}>{isArabic ? '3. الإيداع' : '3. LIMIT'}</span>
          <span className={currentStep === 4 ? 'text-fuchsia-400' : ''}>{isArabic ? '4. التوثيق' : '4. SIGN'}</span>
        </div>
      </div>

      {/* RE-IMAGINED: ASYMMETRICAL VIP STEPS & REQUIREMENT BOARD */}
      <div className="relative z-10 max-w-[325px] mx-auto w-full pb-8">
        
        {/* STEP 1: PROMO KEY */}
        {currentStep === 1 && (
          <div className="relative rounded-[2rem] bg-gradient-to-b from-[#180e29]/70 to-[#06030a]/90 border border-fuchsia-500/30 backdrop-blur-xl p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9),_0_0_50px_rgba(168,85,247,0.12)] transition-all duration-500 hover:border-fuchsia-400/60 overflow-hidden group animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Custom ticket mock holes */}
            <div className="absolute top-1/2 -left-3.5 w-7 h-7 bg-[#020104] rounded-full border border-fuchsia-500/15 pointer-events-none -translate-y-1/2 z-10" />
            <div className="absolute top-1/2 -right-3.5 w-7 h-7 bg-[#020104] rounded-full border border-fuchsia-500/15 pointer-events-none -translate-y-1/2 z-10" />
            
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-black font-display text-4xl text-white select-none pointer-events-none">
              01
            </div>

            <div className="flex items-start gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shrink-0">
                 <Shield className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="flex-1 min-w-0 text-left" dir="ltr">
                 <span className="text-[7px] font-mono text-fuchsia-400 uppercase font-black tracking-widest block mb-0.5">{stepTexts.step1_tag}</span>
                 <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                   {stepTexts.step1_title}
                 </h3>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed mb-4 font-bold font-mono">
              {stepTexts.step1_desc}
            </p>

            <div 
              onClick={handleCopy}
              className={`relative bg-black/40 rounded-xl border border-dashed p-3 flex items-center justify-between cursor-pointer transition-all duration-300 mb-4 text-left ${
                copied ? 'border-fuchsia-500 bg-fuchsia-500/[0.02] shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'border-zinc-800 hover:border-fuchsia-500/40'
              }`}
            >
               <div className="z-10 flex flex-col justify-center">
                  <span className={`text-[7px] font-mono font-black tracking-wider uppercase mb-0.5 ${copied ? 'text-fuchsia-400 animate-pulse' : 'text-zinc-550'}`}>
                    {copied ? stepTexts.step1_copied : stepTexts.step1_copy}
                  </span>
                  <span className="text-md font-mono font-black tracking-[0.25em] text-white">
                    DARK200
                  </span>
               </div>

               <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                  copied ? 'bg-fuchsia-500 text-black scale-105 shadow-[0_0_10px_#d946ef]' : 'bg-[#020104] text-zinc-500 border border-white/5'
                }`}>
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3px] text-black" /> : <Copy className="w-3.5 h-3.5" />}
               </div>
            </div>

            {/* Next Button inside Step 1 */}
            <button
              onClick={() => { audioManager.playClick(); setCurrentStep(2); }}
              className="w-full mt-4 h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white font-black font-display text-[9px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.99] transition-all border border-fuchsia-500/20"
            >
               <span>{isArabic ? "التالي" : "NEXT STEP"}</span>
               <ArrowRight className="w-3.5 h-3.5 text-fuchsia-350" />
            </button>
          </div>
        )}

        {/* STEP 2: DOWNLOAD CLIENT */}
        {currentStep === 2 && (
          <div className="relative rounded-[2.2rem] rounded-tr-[1rem] rounded-bl-[1rem] bg-gradient-to-b from-[#180e29]/70 to-[#06030a]/90 border border-fuchsia-500/30 backdrop-blur-xl p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9),_0_0_50px_rgba(168,85,247,0.12)] transition-all duration-500 hover:border-fuchsia-400/60 overflow-hidden group animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-fuchsia-500/35" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-fuchsia-500/35" />
            
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-black font-display text-4xl text-white select-none pointer-events-none">
              02
            </div>
            
            <div className="flex items-start gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-fuchsia-500/20 p-[1.5px] bg-[#07030c] flex items-center justify-center">
                 <img src={platformImg} alt={platformName} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0 text-left" dir="ltr">
                 <span className="text-[7px] font-mono text-fuchsia-400 uppercase font-black tracking-widest block mb-0.5">{stepTexts.step2_tag}</span>
                 <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                   {stepTexts.step2_title}
                 </h3>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed mb-4 font-bold font-mono">
              {stepTexts.step2_desc}
            </p>

            <a 
              href={megapariDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioManager.playClick()}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-fuchsia-500/20 via-purple-600/10 to-fuchsia-500/5 text-white font-black font-display text-[9px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(217,70,239,0.1)] hover:border-fuchsia-500/45 active:scale-[0.99] transition-all border border-fuchsia-500/30"
            >
               <Download className="w-3.5 h-3.5 text-fuchsia-400" />
               <span>{stepTexts.step2_btn}</span>
            </a>

            {/* Back & Next Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => { audioManager.playClick(); setCurrentStep(1); }}
                className="h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all font-black text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5"
              >
                 <ArrowLeft className="w-3.5 h-3.5" />
                 <span>{isArabic ? "السابق" : "BACK"}</span>
              </button>
              <button
                onClick={() => { audioManager.playClick(); setCurrentStep(3); }}
                className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white font-black font-display text-[9px] tracking-[0.15em] uppercase flex items-center justify-center gap-1.5 shadow-lg hover:opacity-90 active:scale-[0.99] transition-all border border-fuchsia-500/20"
              >
                 <span>{isArabic ? "التالي" : "NEXT"}</span>
                 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEPOSIT LIMITS */}
        {currentStep === 3 && (
          <div className="relative rounded-[2.2rem] rounded-tl-[1rem] rounded-br-[1rem] bg-gradient-to-b from-[#180e29]/70 to-[#06030a]/90 border border-fuchsia-500/30 backdrop-blur-xl p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9),_0_0_50px_rgba(168,85,247,0.12)] transition-all duration-500 hover:border-fuchsia-400/60 overflow-hidden group animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-fuchsia-500/35" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-fuchsia-500/35" />

            <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-black font-display text-4xl text-white select-none pointer-events-none">
              03
            </div>

            <div className="flex items-start gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shrink-0">
                 <CreditCard className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="flex-1 min-w-0 text-left" dir="ltr">
                 <span className="text-[7px] font-mono text-fuchsia-400 uppercase font-black tracking-widest block mb-0.5">{stepTexts.step3_tag}</span>
                 <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                   {stepTexts.step3_title}
                 </h3>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed mb-4 font-bold font-mono">
              {stepTexts.step3_desc}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4" dir="ltr">
              <div className="bg-[#05020a]/80 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center hover:border-fuchsia-500/20 transition-all duration-300">
                   <span className="text-[7px] text-zinc-500 font-black uppercase tracking-wider mb-1 font-mono">{stepTexts.step3_global}</span>
                   <span className="text-md font-black text-white font-display">$5.00</span>
              </div>
              <div className="bg-[#05020a]/80 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center hover:border-fuchsia-500/20 transition-all duration-300">
                   <span className="text-[7px] text-zinc-550 font-black uppercase tracking-wider mb-1 font-mono">{stepTexts.step3_local}</span>
                   <span className="text-md font-black text-fuchsia-400 font-display">250 EGP</span>
              </div>
            </div>

            {/* Back & Next Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => { audioManager.playClick(); setCurrentStep(2); }}
                className="h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all font-black text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5"
              >
                 <ArrowLeft className="w-3.5 h-3.5" />
                 <span>{isArabic ? "السابق" : "BACK"}</span>
              </button>
              <button
                onClick={() => { audioManager.playClick(); setCurrentStep(4); }}
                className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white font-black font-display text-[9px] tracking-[0.15em] uppercase flex items-center justify-center gap-1.5 shadow-lg hover:opacity-90 active:scale-[0.99] transition-all border border-fuchsia-500/20"
              >
                 <span>{isArabic ? "التالي" : "NEXT"}</span>
                 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFICATION & UPLOAD */}
        {currentStep === 4 && (
          <div className={`relative p-0.5 rounded-[2.5rem] border backdrop-blur-md transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            errors.userId || errors.screenshot || errors.profileScreenshot || errors.userIdLength 
              ? 'bg-red-950/5 border-red-500/30' 
              : 'bg-gradient-to-b from-[#180e29]/70 to-[#06030a]/90 border-fuchsia-500/30 shadow-[0_30px_70px_rgba(0,0,0,0.9),_0_0_50px_rgba(168,85,247,0.12)]'
          }`}>
            <div className="bg-black/30 p-5 rounded-[2.4rem]">
              <div className="absolute top-4 right-4 p-4 opacity-[0.05] font-black font-display text-4xl text-white select-none pointer-events-none">
                04
              </div>
              
              <div className="flex justify-between items-start mb-4">
                 <div className="text-left" dir="ltr">
                    <span className="text-[7px] font-mono text-fuchsia-400 uppercase font-black tracking-widest block mb-0.5">{stepTexts.step4_tag}</span>
                    <h3 className="font-black font-display text-xs text-white tracking-wider uppercase leading-none">
                      {stepTexts.step4_title}
                    </h3>
                 </div>
                 <ShieldCheck className={`w-5 h-5 transition-colors shrink-0 ${userId ? 'text-fuchsia-400 animate-pulse' : 'text-zinc-700'}`} />
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed mb-4 font-bold font-mono">
                {stepTexts.step4_desc}
              </p>

              <div className="space-y-4">
                {/* User ID Field */}
                <div>
                  <label className="block text-[8px] text-zinc-450 mb-1.5 uppercase font-mono font-black tracking-widest font-bold">
                    {isArabic ? "معرف مستخدم المنصة" : "PLATFORM ACCOUNT USER ID"}
                  </label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 border-r border-white/10 pr-3 pl-3.5 flex items-center justify-center">
                         <Fingerprint className={`w-4 h-4 ${userId ? 'text-fuchsia-400 animate-pulse' : 'text-zinc-550'}`} />
                      </div>
                      <input 
                        type="tel" 
                        value={userId}
                        onChange={handleUserIdChange}
                        placeholder={stepTexts.userid_placeholder}
                        disabled={isSubmitting}
                        maxLength={15}
                        className={`w-full bg-black/60 border text-white font-mono text-sm py-3 rounded-xl focus:outline-none transition-all pl-12 pr-4 text-left ${
                          errors.userId || errors.userIdLength 
                            ? 'border-red-500 focus:border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                            : 'border-fuchsia-500/20 focus:border-fuchsia-500/40'
                        }`}
                      />
                  </div>
                  {(errors.userId || errors.userIdLength) && (
                    <span className="text-[8px] font-mono text-red-500 font-black block mt-1 uppercase tracking-wider">
                      {errors.userId ? (isArabic ? "الحقل مطلوب *" : "Required field *") : (isArabic ? "يجب أن يتكون المعرف من 8 إلى 15 رقمًا" : "Must be between 8 and 15 digits")}
                    </span>
                  )}
                </div>

                {/* Secure Document Upload Blocks */}
                {!isApprovedOnServer && (
                  <>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-zinc-450 mb-1.5 uppercase font-mono font-black tracking-widest text-[7px] font-bold">
                          {isArabic ? "إيصال الإيداع الموثق" : "DEPOSIT RECEIPT"}
                        </label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="screenshot-upload" disabled={isSubmitting} />
                        <label htmlFor="screenshot-upload" className={`flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-2xl cursor-pointer transition-all relative overflow-hidden bg-black/60 ${
                          errors.screenshot ? 'border-red-500 bg-red-950/10' : 'border-fuchsia-500/15 hover:border-fuchsia-500/35'
                        }`}>
                          {previewUrl ? (
                            <img src={previewUrl} alt="Deposit Proof" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-center p-2">
                               <Upload className="w-4 h-4 text-fuchsia-500/30 animate-pulse" />
                               <span className="text-[7px] text-zinc-500 font-black uppercase tracking-wider font-mono">
                                 {isArabic ? "رفع الإيصال" : "UPLOAD RECEIPT"}
                               </span>
                            </div>
                          )}
                        </label>
                      </div>

                      <div>
                        <label className="block text-zinc-450 mb-1.5 uppercase font-mono font-black tracking-widest text-[7px] font-bold">
                          {isArabic ? "صورة الملف الشخصي" : "PROFILE PREVIEW"}
                        </label>
                        <input type="file" accept="image/*" onChange={handleProfileFileChange} className="hidden" id="profile-upload" disabled={isSubmitting} />
                        <label htmlFor="profile-upload" className={`flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-2xl cursor-pointer transition-all relative overflow-hidden bg-black/60 ${
                          errors.profileScreenshot ? 'border-red-500 bg-red-950/10' : 'border-fuchsia-500/15 hover:border-fuchsia-500/35'
                        }`}>
                          {profilePreviewUrl ? (
                            <img src={profilePreviewUrl} alt="Profile Proof" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-center p-2">
                               <Image className="w-4 h-4 text-fuchsia-500/30 animate-pulse" />
                               <span className="text-[7px] text-zinc-500 font-black uppercase tracking-wider font-mono">
                                 {isArabic ? "رفع الملف" : "UPLOAD PROFILE"}
                               </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    {(errors.screenshot || errors.profileScreenshot) && (
                      <span className="text-[8px] font-mono text-red-500 font-black block uppercase tracking-wider">
                        {isArabic ? "برجاء رفع كلا الملفين للمواصلة *" : "Please upload both verification files *"}
                      </span>
                    )}
                  </>
                )}
                
                {isApprovedOnServer && (
                  <div className="p-3.5 rounded-2xl border border-fuchsia-500/35 bg-fuchsia-950/10 text-center animate-in zoom-in duration-300">
                    <ShieldCheck className="w-5 h-5 text-fuchsia-400 mx-auto mb-1 animate-bounce" />
                    <span className="block text-[8px] font-mono text-fuchsia-400 font-black uppercase tracking-widest">
                      {isArabic ? "العقدة الذهبية نشطة" : "VIP SECURE TUNNEL ACTIVE"}
                    </span>
                    <p className="text-[9px] text-zinc-450 font-mono mt-1 font-bold">
                      {isArabic ? "تم التحقق والمصادقة على هذا المعرف بنجاح! يمكنك العبور والولوج مباشرة." : "This ID has been validated on our servers! Click below for instant VIP entrance."}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Actions for Step 4 */}
              <div className="grid grid-cols-3 gap-3.5 mt-5">
                <button
                  onClick={() => { audioManager.playClick(); setCurrentStep(3); }}
                  className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all font-black text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-1"
                >
                   <ArrowLeft className="w-3.5 h-3.5" />
                   <span>{isArabic ? "السابق" : "BACK"}</span>
                </button>
                <button 
                  onClick={validateAndSubmit}
                  disabled={isSubmitting}
                  className={`col-span-2 h-12 rounded-xl text-white font-black font-display text-[9px] tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] border uppercase shadow-lg ${
                    isApprovedOnServer 
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:opacity-90 border-fuchsia-500/20 shadow-fuchsia-950/10' 
                      : 'bg-gradient-to-r from-fuchsia-500/20 via-purple-600/10 to-fuchsia-500/5 hover:opacity-90 border-fuchsia-500/20 shadow-fuchsia-950/10'
                  }`}
                >
                    <span>
                      {isApprovedOnServer ? (isArabic ? "الدخول" : "ENTER") : (isArabic ? "إرسال التفعيل" : "SUBMIT")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RE-IMAGINED LUXURIOUS LOADING PORTAL OVERLAY */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/96 backdrop-blur-3xl animate-in fade-in duration-500 p-6">
           <div className="relative w-full max-w-sm">
              <div className="bg-[#0b0515] border border-fuchsia-500/20 rounded-[2.8rem] rounded-tr-[1.2rem] rounded-bl-[1.2rem] p-8 relative z-10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col items-center text-center">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.06)_0%,_transparent_75%)] pointer-events-none" />
                 
                 <div className="mb-6 w-full">
                    <h3 className="text-[7.5px] font-mono text-zinc-550 uppercase tracking-[0.4em] mb-2 font-black">SECURE AMETHYST BINDING</h3>
                    <h2 className="text-lg font-display font-black text-white tracking-tight uppercase mb-4 leading-none">
                       {isArabic ? "التحقق من " : "VERIFYING "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-200">{isArabic ? "التوقيع المشفر" : "VIP SIGNATURE"}</span>
                    </h2>
                    
                    <div className="w-full mt-4">
                       <div className="flex justify-between items-end px-1 mb-1.5">
                          <span className="text-[8px] font-mono text-zinc-500 tracking-wider font-extrabold animate-pulse uppercase truncate max-w-[200px]">{statusText}</span>
                          <span className="text-xs font-black text-fuchsia-400 font-display">{Math.round(overallProgress)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-zinc-950 rounded-full border border-white/5 overflow-hidden p-[1px] relative">
                          <div 
                            className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                            style={{ width: `${overallProgress}%` }}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3.5 w-full text-left" dir="ltr">
                    {verificationSteps.map((step, idx) => {
                      const isCompleted = step.status === 'completed';
                      const isActive = step.status === 'active';
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : isCompleted ? 'opacity-30' : 'opacity-10'}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                              step.status === 'pending' ? 'bg-black border-zinc-900 text-zinc-800' : 
                              step.status === 'active' ? 'bg-fuchsia-500 border-white/20 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] animate-pulse' : 
                              'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400'
                            }`}>
                                <step.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isActive ? 'text-white' : 'text-zinc-550'}`}>
                               {step.label}
                            </span>
                        </div>
                      )
                    })}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
