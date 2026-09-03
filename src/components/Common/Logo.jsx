import React from 'react';

export const LogoSymbol = ({ size = 36, className = '', animated = false }) => {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${
          animated
            ? 'animate-logo-glow'
            : 'drop-shadow-[0_4px_16px_rgba(37,99,235,0.45)]'
        }`}
      >
        <defs>
          <linearGradient id="linkDarkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="linkDarkPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <filter id="darkShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Purple Loop Link (bottom right) */}
        <path
          d="M 90,85 C 90,68 104,54 122,54 L 146,54 C 164,54 178,68 178,85 C 178,102 164,116 146,116 L 122,116 C 104,116 90,102 90,85 Z"
          fill="none"
          stroke="url(#linkDarkPurple)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#darkShadow)"
        />

        {/* Blue Loop Link (top left, interlocking) */}
        <path
          d="M 22,85 C 22,68 36,54 54,54 L 78,54 C 96,54 110,68 110,85 C 110,102 96,116 78,116 L 54,116 C 36,116 22,102 22,85 Z"
          fill="none"
          stroke="url(#linkDarkBlue)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#darkShadow)"
        />
      </svg>
    </div>
  );
};

export const Logo = ({ size = 'md', showTagline = false, layout = 'horizontal', onClick = null }) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 72,
    xxl: 96,
  };

  const currentSize = iconSizes[size] || 36;

  return (
    <div
      onClick={onClick}
      className={`flex items-center cursor-pointer select-none group transition-transform ${
        layout === 'vertical' ? 'flex-col text-center gap-2' : 'flex-row gap-2.5'
      }`}
    >
      <LogoSymbol size={currentSize} className="group-hover:scale-105 transition-transform" />
      <div className={`flex flex-col leading-none ${layout === 'vertical' ? 'items-center' : ''}`}>
        <div
          className={`flex items-baseline font-black tracking-tight ${
            size === 'xxl'
              ? 'text-4xl sm:text-5xl'
              : size === 'xl'
              ? 'text-3xl sm:text-4xl'
              : size === 'lg'
              ? 'text-2xl sm:text-3xl'
              : size === 'sm'
              ? 'text-lg'
              : 'text-xl sm:text-2xl'
          }`}
        >
          <span className="text-white font-sans drop-shadow-md">Link</span>
          <span className="text-blue-500 font-sans ml-0.5 drop-shadow-md">Up</span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.24em] text-slate-300 mt-1.5 drop-shadow">
            <span>CONNECT<span className="text-blue-400 font-black">.</span></span>
            <span className="text-blue-500 font-black mx-0.5">•</span>
            <span>SHARE<span className="text-purple-400 font-black">.</span></span>
            <span className="text-purple-500 font-black mx-0.5">•</span>
            <span>GROW<span className="text-blue-400 font-black">.</span></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
