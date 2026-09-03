import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { LogoSymbol } from '../Common/Logo';

export const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const audioContextRef = useRef(null);

  // Futuristic Web Audio Synthesizer for rich cinematic startup chime
  const playStartupChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      let ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioContextClass();
        audioContextRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // 1. Ambient sub-bass glide (deep whoosh)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(130, now + 0.8);
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.3, now + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 2.3);

      // 2. Harmonic Crystal Chimes (C-Major 9th chord: C5, E5, G5, B5, D6)
      const chordFrequencies = [523.25, 659.25, 783.99, 987.77, 1174.66];
      chordFrequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.2 + index * 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3400, now);

        const startTime = now + 0.2 + index * 0.12;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.5);
      });

      // 3. Shimmer Sparkle high tone
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(1567.98, now + 0.8); // G6
      shimmerGain.gain.setValueAtTime(0, now + 0.8);
      shimmerGain.gain.linearRampToValueAtTime(0.15, now + 0.9);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(now + 0.8);
      shimmerOsc.stop(now + 2.9);

      setSoundPlayed(true);
    } catch (e) {
      console.log('Audio playback prevented or unsupported', e);
    }
  };

  useEffect(() => {
    // Attempt playback immediately
    playStartupChime();

    // Auto-unlock audio on first touch/click/key if browser blocked autoplay
    const unlockAudio = () => {
      playStartupChime();
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    // Cinematic Extended Splash Duration (~4.0s total)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3800);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 4300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [onFinish]);

  const handleSkip = (e) => {
    if (e) e.stopPropagation();
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#06080F] flex flex-col items-center justify-between py-12 px-6 select-none transition-opacity duration-700 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient glowing neon halos matching interface */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/4 w-[460px] h-[460px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Top action bar: Replay sound & Skip button */}
      <div className="z-20 flex items-center justify-between w-full max-w-sm text-slate-400 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playStartupChime();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 text-slate-200 font-bold text-[11px] shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Sound {soundPlayed ? 'On 🔊' : 'Tap to Play 🎵'}</span>
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[11px] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Center Stage: Interlocking Blue & Purple Loops */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Animated Interlocking Logo */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center mb-6">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-[0_0_35px_rgba(59,130,246,0.35)] animate-in zoom-in-90 duration-1000"
          >
            <defs>
              <linearGradient id="splashBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>

              <linearGradient id="splashPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="50%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#6B21A8" />
              </linearGradient>

              <filter id="splashGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ambient Background Glow Behind Loops */}
            <circle cx="100" cy="100" r="70" fill="url(#splashBlueGrad)" opacity="0.12" filter="url(#splashGlow)" />
            <circle cx="120" cy="100" r="60" fill="url(#splashPurpleGrad)" opacity="0.12" filter="url(#splashGlow)" />

            {/* Left Interlocking Loop (Electric Blue) */}
            <path
              d="M 68 62 
                 C 40 62, 22 80, 22 100 
                 C 22 120, 40 138, 68 138 
                 C 88 138, 102 126, 110 114 
                 C 102 106, 92 98, 80 98 
                 C 66 98, 54 104, 48 100 
                 C 46 96, 50 86, 68 86 
                 C 80 86, 92 92, 100 100 
                 C 108 90, 112 80, 110 74 
                 C 100 64, 86 62, 68 62 Z"
              fill="url(#splashBlueGrad)"
              className="transition-all duration-1000 ease-out animate-pulse"
            />

            {/* Right Interlocking Loop (Deep Royal Purple) */}
            <path
              d="M 132 138 
                 C 160 138, 178 120, 178 100 
                 C 178 80, 160 62, 132 62 
                 C 112 62, 98 74, 90 86 
                 C 98 94, 108 102, 120 102 
                 C 134 102, 146 96, 152 100 
                 C 154 104, 150 114, 132 114 
                 C 120 114, 108 108, 100 100 
                 C 92 110, 88 120, 90 126 
                 C 100 136, 114 138, 132 138 Z"
              fill="url(#splashPurpleGrad)"
              className="transition-all duration-1000 ease-out"
            />

            {/* Intertwined Overlap Core */}
            <path
              d="M 90 86 C 98 94, 104 100, 110 114 C 112 106, 110 94, 100 86 Z"
              fill="#A855F7"
              opacity="0.9"
            />
          </svg>

          {/* Orbiting particle ring */}
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow pointer-events-none" />
          <div className="absolute inset-2 rounded-full border border-purple-500/20 border-dashed animate-reverse-spin pointer-events-none" />
        </div>

        {/* Brand Wordmark & Tagline */}
        <div className="flex flex-col items-center gap-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-lg">
            LinkUp
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-400 max-w-xs">
            Connect. Share. Groove to the Beat.
          </p>

          {/* Regional Sound Badge */}
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>105 Regional Hits • Kannada • Telugu • Tamil</span>
          </div>
        </div>
      </div>

      {/* Bottom loading bar & Version */}
      <div className="z-10 flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="w-full h-1 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/80">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-loading-bar" />
        </div>
        <div className="flex items-center justify-between w-full text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Loading Experience</span>
          <span className="text-blue-400 font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
