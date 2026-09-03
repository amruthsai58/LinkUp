import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const IntroSplash = ({ onFinish }) => {
  const [stage, setStage] = useState(0); // 0: approach, 1: interlock & glow, 2: text reveal, 3: sparkle & complete
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 700); // Interlock
    const timer2 = setTimeout(() => setStage(2), 1500); // Logo Image / Wordmark reveal
    const timer3 = setTimeout(() => setStage(3), 2400); // Sparkle & Accent
    const timer4 = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onFinish();
      }, 500);
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      onFinish();
    }, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F5F3EE] transition-opacity duration-500 select-none overflow-hidden ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 opacity-30 animate-float"
            style={{
              width: `${(i % 3) * 6 + 4}px`,
              height: `${(i % 3) * 6 + 4}px`,
              left: `${(i * 19) % 95}%`,
              top: `${(i * 21) % 90}%`,
              animationDelay: `${(i * 0.3).toFixed(1)}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Center Animation Stage */}
      <div className="relative flex flex-col items-center justify-center p-6">
        {/* The Exact Interlocking Links Logo Canvas */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {stage >= 2 ? (
            /* Revealed Exact Official Logo Asset */
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center animate-in zoom-in-90 duration-700">
              <img
                src="/logo.png"
                alt="LinkUp Logo"
                className="w-full h-full object-contain drop-shadow-[0_12px_28px_rgba(37,99,235,0.25)]"
              />
              <div className="absolute inset-0 rounded-3xl animate-glow-pulse pointer-events-none" />
            </div>
          ) : (
            /* 3D sliding & interlocking sequence */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Blue Upper-Left Link sliding in from left */}
              <div
                className={`absolute transition-all duration-800 ease-out ${
                  stage === 0
                    ? '-translate-x-48 opacity-0 scale-75 -rotate-45'
                    : '-translate-x-4 -translate-y-4 opacity-100 scale-100 -rotate-15'
                }`}
              >
                <div className="w-36 h-20 rounded-full border-[18px] border-blue-600 shadow-[0_10px_25px_rgba(37,99,235,0.4)]" />
              </div>

              {/* Purple Lower-Right Link sliding in from right */}
              <div
                className={`absolute transition-all duration-800 ease-out ${
                  stage === 0
                    ? 'translate-x-48 opacity-0 scale-75 rotate-45'
                    : 'translate-x-4 translate-y-4 opacity-100 scale-100 -rotate-15'
                }`}
              >
                <div className="w-36 h-20 rounded-full border-[18px] border-purple-600 shadow-[0_10px_25px_rgba(139,92,246,0.4)]" />
              </div>
            </div>
          )}

          {/* Sparkle on lower-right accent */}
          <div
            className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 transition-all duration-700 ${
              stage >= 3 ? 'opacity-100 scale-120 rotate-12' : 'opacity-0 scale-0'
            }`}
          >
            <Sparkles className="w-9 h-9 text-amber-500 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-spin-slow" />
          </div>
        </div>

        {/* Wordmark & Tagline */}
        <div
          className={`flex flex-col items-center mt-3 transition-all duration-700 transform ${
            stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <div className="flex items-baseline text-4xl sm:text-5xl font-black tracking-tight font-display">
            <span className="text-[#0B132B]">Link</span>
            <span className="text-[#1E6BFF] ml-0.5">Up</span>
          </div>

          <p className="mt-2 text-xs sm:text-sm font-extrabold uppercase tracking-[0.28em] text-[#0A192F]/80 font-sans">
            CONNECT <span className="text-blue-600 font-black">•</span> SHARE <span className="text-purple-600 font-black">•</span> GROW<span className="text-blue-600 font-black">.</span>
          </p>

          <div className="mt-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-[11px] font-bold shadow-sm">
            <span>Kannada</span>
            <span>•</span>
            <span>Telugu</span>
            <span>•</span>
            <span>Tamil</span>
            <span className="text-purple-600 font-black ml-1">Live Audio Streamed</span>
          </div>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-4 py-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-800 font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5 border border-black/10 hover:scale-105 active:scale-95 shadow-sm"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default IntroSplash;
