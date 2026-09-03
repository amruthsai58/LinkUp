import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { LogoSymbol } from '../Common/Logo';

export const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const audioContextRef = useRef(null);

  // Futuristic Web Audio Synthesizer for rich cinematic startup chime
  const playStartupChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const now = ctx.currentTime;

      // 1. Ambient sub-bass glide (deep whoosh)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(130, now + 0.8);
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.28, now + 0.3);
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
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.08);
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
      shimmerGain.gain.linearRampToValueAtTime(0.12, now + 0.9);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(now + 0.8);
      shimmerOsc.stop(now + 2.9);
    } catch (e) {
      console.log('Audio playback prevented or unsupported', e);
    }
  };

  useEffect(() => {
    // Play startup sound on mount
    playStartupChime();

    // Cinematic Extended Splash Duration (~4.0s total)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3500);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 4100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 350);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-[#06080F] flex flex-col items-center justify-between py-12 px-6 select-none cursor-pointer transition-opacity duration-700 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient glowing neon halos matching interface */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/4 w-[460px] h-[460px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Top subtle hint */}
      <div className="z-10 flex items-center justify-between w-full max-w-sm text-slate-500 text-xs">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-[11px] text-blue-400 uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>LinkUp Network</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playStartupChime();
          }}
          className="p-1.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
          title="Replay Sound"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Center Stage: Interlocking Blue & Purple Loops matching Dark Interface */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Animated Interlocking Logo with Ambient Glow */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center mb-6">
          {/* SVG Animated High-Resolution Vector with exact Interface Color Palettes */}
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_15px_35px_rgba(37,99,235,0.45)]"
          >
            <defs>
              <linearGradient id="splashDarkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="45%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="splashDarkPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="45%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
              <filter id="splashDarkShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Purple Loop Link (sliding in from bottom right) */}
            <g className="animate-link-purple">
              <path
                d="M 90,85 C 90,68 104,54 122,54 L 146,54 C 164,54 178,68 178,85 C 178,102 164,116 146,116 L 122,116 C 104,116 90,102 90,85 Z"
                fill="none"
                stroke="url(#splashDarkPurple)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#splashDarkShadow)"
              />
            </g>

            {/* Blue Loop Link (sliding in from top left and interlocking) */}
            <g className="animate-link-blue">
              <path
                d="M 22,85 C 22,68 36,54 54,54 L 78,54 C 96,54 110,68 110,85 C 110,102 96,116 78,116 L 54,116 C 36,116 22,102 22,85 Z"
                fill="none"
                stroke="url(#splashDarkBlue)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#splashDarkShadow)"
              />
            </g>
          </svg>

          {/* Central Glow Sparkle Burst on Interlock */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 bg-blue-400/30 rounded-full blur-md animate-ping duration-1000" />
          </div>
        </div>

        {/* Brand Typography "LinkUp" Matching Dark Theme */}
        <div className="flex flex-col items-center text-center animate-text-reveal">
          <div className="flex items-baseline text-4xl sm:text-5xl font-black tracking-tight drop-shadow-2xl">
            <span className="text-white font-sans">Link</span>
            <span className="text-blue-500 font-sans ml-1">Up</span>
          </div>

          {/* Subtitle "CONNECT. • SHARE. • GROW." */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.28em] text-slate-300 mt-2.5 drop-shadow">
            <span>CONNECT<span className="text-blue-400 font-black">.</span></span>
            <span className="text-blue-500 font-black mx-1">•</span>
            <span>SHARE<span className="text-purple-400 font-black">.</span></span>
            <span className="text-purple-500 font-black mx-1">•</span>
            <span>GROW<span className="text-blue-400 font-black">.</span></span>
          </div>
        </div>

        {/* Cinematic Loading Progress Bar */}
        <div className="w-44 sm:w-56 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-8 border border-slate-800 shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse w-full duration-1000" />
        </div>
      </div>

      {/* Bottom info & skip hint */}
      <div className="z-10 flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider">
          Connecting you to friends & regional music...
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          Tap anywhere to skip intro
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
