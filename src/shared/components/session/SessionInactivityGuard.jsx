import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

export default function SessionInactivityGuard() {
  const { currentUser, logoutUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const WARNING_DURATION_SECONDS = 60; // 60s countdown warning
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Helper to get configured timeout in milliseconds
  const getTimeoutMs = useCallback(() => {
    try {
      const savedMins = localStorage.getItem('agro_session_timeout_mins');
      const mins = savedMins ? parseInt(savedMins, 10) : 15;
      const validMins = isNaN(mins) || mins < 1 ? 15 : mins;
      return validMins * 60 * 1000;
    } catch {
      return 15 * 60 * 1000;
    }
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(WARNING_DURATION_SECONDS);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  }, [showWarning]);

  // Activity listeners
  useEffect(() => {
    if (!currentUser) return;

    let throttleTimer = null;
    const handleUserActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 1000); // Throttled every 1s

      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [currentUser, showWarning]);

  // Main inactivity checker loop
  useEffect(() => {
    if (!currentUser) {
      setShowWarning(false);
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    const checkInterval = setInterval(() => {
      const timeoutMs = getTimeoutMs();
      const warningThresholdMs = timeoutMs - (WARNING_DURATION_SECONDS * 1000);
      const elapsedMs = Date.now() - lastActivityRef.current;

      if (elapsedMs >= timeoutMs) {
        // Inactivity exceeded -> Logout
        clearInterval(checkInterval);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setShowWarning(false);
        logoutUser('INACTIVITY');
      } else if (elapsedMs >= warningThresholdMs && !showWarning) {
        // Enter warning countdown
        const leftSecs = Math.max(1, Math.ceil((timeoutMs - elapsedMs) / 1000));
        setSecondsRemaining(leftSecs);
        setShowWarning(true);
      }
    }, 2000);

    warningTimerRef.current = checkInterval;

    return () => {
      clearInterval(checkInterval);
    };
  }, [currentUser, getTimeoutMs, logoutUser, showWarning]);

  // Countdown timer effect during warning state
  useEffect(() => {
    if (!showWarning) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowWarning(false);
          logoutUser('INACTIVITY');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning, logoutUser]);

  if (!currentUser || !showWarning) return null;

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / WARNING_DURATION_SECONDS) * 100));

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-md w-full p-6 border border-amber-500/40 shadow-2xl rounded-2xl text-center relative overflow-hidden bg-slate-900/95">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <ShieldAlert size={32} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          ¿Sigues trabajando en AgroGestión?
        </h3>

        <p className="text-sm text-slate-300 mb-6">
          Por razones de seguridad y protección de la información del predio, tu sesión se cerrará automáticamente por inactividad.
        </p>

        <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
          <Clock className="text-amber-400 animate-spin" size={24} style={{ animationDuration: '4s' }} />
          <div className="text-left">
            <span className="text-xs text-amber-300/80 block uppercase tracking-wider font-semibold">Cierre automático en:</span>
            <span className="text-2xl font-black text-amber-400 tabular-nums">
              {secondsRemaining} {secondsRemaining === 1 ? 'segundo' : 'segundos'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={resetActivity}
            className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 size={18} />
            <span>Mantener Sesión Activa</span>
          </button>

          <button
            type="button"
            onClick={() => logoutUser('MANUAL')}
            className="btn-secondary bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700"
          >
            <LogOut size={16} />
            <span>Cerrar Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
