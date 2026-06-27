import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Timer, X, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface AdminApprovalModalProps {
  userId: string;
  onApprove: () => void;
  onReject: () => void;
  lang: 'en' | 'ar';
  onDismiss?: () => void;
}

const MotionDiv = motion.div as any;

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  userId,
  onApprove,
  onReject,
  lang,
  onDismiss,
}) => {
  const isArabic = lang === 'ar';
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Instant bypass for Admin IDs
  useEffect(() => {
    if (userId === "1902716432" || userId === "1729018123") {
      localStorage.setItem(`admin_approval_status_${userId}`, 'approved');
      localStorage.setItem('bypass_approved_userId', userId);
      onApprove();
    }
  }, [userId, onApprove]);

  // Initialize and run the countdown timer
  useEffect(() => {
    // Get original start time or set new one
    let startTimeStr = localStorage.getItem(`admin_approval_timer_start_${userId}`);
    if (!startTimeStr) {
      const now = Date.now().toString();
      localStorage.setItem(`admin_approval_timer_start_${userId}`, now);
      startTimeStr = now;
    }

    const startTime = parseInt(startTimeStr, 10);
    const thirtyMinutesMs = 30 * 60 * 1000;

    const updateTimer = () => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = thirtyMinutesMs - elapsedMs;

      if (remainingMs <= 0) {
        // Do NOT automatically approve! Keep at 0 and wait for manual admin approval.
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(remainingMs / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [userId, onApprove]);

  // Periodic polling of the Firebase approval status
  useEffect(() => {
    let active = true;
    const checkApprovalStatus = async () => {
      if (!userId) return;
      try {
        setIsChecking(true);
        const response = await fetch(`https://shopping-ca5f4-default-rtdb.firebaseio.com/approval/${userId}.json`);
        if (!response.ok) throw new Error('Network error');
        const status = await response.json();

        if (!active) return;

        if (status === 'approved') {
          localStorage.setItem(`admin_approval_status_${userId}`, 'approved');
          localStorage.setItem('bypass_approved_userId', userId);
          audioManager.playSuccess();
          onApprove();
        } else if (status === 'rejected') {
          localStorage.removeItem('admin_approval_userId');
          localStorage.removeItem(`admin_approval_timer_start_${userId}`);
          localStorage.removeItem(`admin_approval_status_${userId}`);
          audioManager.playError();
          onReject();
        }
      } catch (err) {
        console.error('Error polling status:', err);
      } finally {
        if (active) setIsChecking(false);
      }
    };

    // Poll immediately, then every 6 seconds
    checkApprovalStatus();
    const pollInterval = setInterval(checkApprovalStatus, 6000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [userId, onApprove, onReject]);

  // Format time into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / 1800) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" dir="ltr">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-0.5 rounded-[25px] overflow-hidden bg-transparent shadow-[0_0_50px_rgba(6,182,212,0.35)] relative border-2 border-cyan-500/80"
      >
        <div className="p-6 bg-zinc-950/95 rounded-[23px] text-center relative overflow-hidden">
          {/* Subtle Glowing Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/15 blur-2xl pointer-events-none rounded-full" />

          {/* Icon Header using Custom Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-950/20 border border-cyan-500/30 mb-5 relative shadow-[0_0_25px_rgba(6,182,212,0.25)] p-0">
            <img 
              src="https://i.pinimg.com/736x/eb/d5/fb/ebd5fb2023eab6f8d038609c70d2f8d9.jpg" 
              className="w-full h-full object-contain animate-pulse rounded-full" 
              alt="Logo" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/10 animate-[spin_40s_linear_infinite]" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">
            {isArabic ? 'بإنتظار موافقة المسؤول' : 'Awaiting Admin Approval'}
          </h2>
          <p className="text-xs text-zinc-400 font-medium px-4 mb-6 leading-relaxed">
            {isArabic
              ? 'لقد تم إرسال طلب التفعيل الخاص بك بنجاح إلى الإدارة وجاري مراجعته الآن لربط حسابك بمزود الخدمة.'
              : 'Your activation request has been successfully submitted and is under review to bind your account.'}
          </p>

          {/* Queue & Handshake Indicator */}
          <div className="relative mb-6 p-5 rounded-2xl bg-black/60 border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(6,182,212,0.05)] flex flex-col items-center justify-center min-h-[120px]">
            <div className="relative flex items-center justify-center w-12 h-12 mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 animate-ping duration-1000" />
              <div className="absolute inset-2 rounded-full border border-cyan-500/30 animate-pulse" />
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
            <span className="block text-[9.5px] font-mono font-black tracking-widest text-cyan-400 uppercase">
              {isArabic ? 'جاري مراجعة الطلب وتأكيد التفعيل' : 'ANALYZING CONNECTIVITY MATRIX'}
            </span>
            <span className="block text-[8px] font-mono text-zinc-550 mt-1.5 uppercase tracking-wide px-4">
              {isArabic
                ? 'يرجى الانتظار، يتم الآن فحص الملفات المرفقة بواسطة المشرف تلقائياً'
                : 'Please hold, checking submitted assets and active channel'}
            </span>
          </div>

          {/* Connection status footer */}
          <button
            onClick={() => {
              if (onDismiss) {
                audioManager.playClick();
                onDismiss();
              }
            }}
            className="w-full flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-550 font-extrabold uppercase tracking-widest border-t border-white/5 pt-4 mt-2 hover:text-cyan-500 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-cyan-500' : 'text-zinc-655'}`} />
            <span>{isChecking ? (isArabic ? 'جاري الفحص الدائم...' : 'SYSTEM RETRY...') : (isArabic ? 'متصل بالشبكة المعزولة (اضغط للإغلاق)' : 'SECURE TUNNEL ACTIVE (CLICK TO DISMISS)')}</span>
          </button>
        </div>
      </MotionDiv>
    </div>
  );
};
