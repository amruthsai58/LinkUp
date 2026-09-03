import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER, INITIAL_FRIENDS } from '../../data/mockSocialData';
import { Logo, LogoSymbol } from '../Common/Logo';

export const WelcomeScreen = () => {
  const { setActiveTab } = useSocial();
  const { setAuthModalOpen, setAuthMode, login } = useAuth();

  const handleOpenSignup = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleExploreGuest = () => {
    login(CURRENT_USER);
    setActiveTab('home');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between items-center px-6 py-6 text-center select-none relative overflow-hidden bg-[#090C15] text-slate-100">
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-60 h-60 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Brand Header with Official Logo & Tagline */}
      <div className="flex flex-col items-center gap-1 pt-4 z-10">
        <Logo size="lg" showTagline={true} layout="vertical" />
        <p className="text-xs text-slate-400 font-medium max-w-xs mt-2 leading-relaxed">
          Connect with friends and the world around you.
        </p>
      </div>

      {/* Center Floating Orbital Avatar Galaxy with Central Intertwined Logo Ring */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 flex items-center justify-center z-10">
        {/* Concentric orbital rings */}
        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-purple-500/20 border-dashed animate-reverse-spin" />
        <div className="absolute inset-16 rounded-full border border-indigo-500/30" />

        {/* Center Logo with User Avatar Badge */}
        <div
          onClick={handleExploreGuest}
          className="relative z-20 w-24 h-24 rounded-3xl p-3 bg-gradient-to-tr from-slate-900 via-[#0E1428] to-slate-900 border-2 border-blue-500/50 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
          title="Explore LinkUp"
        >
          <LogoSymbol size={64} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-[9px] font-black text-white shadow-md uppercase tracking-wider">
            Explore
          </div>
        </div>

        {/* Satellite Friend Avatar 1 (Top Left - Rahul) */}
        <div className="absolute top-2 left-6 z-20 w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg animate-bounce duration-1000">
          <img
            src={INITIAL_FRIENDS[0]?.avatar}
            alt={INITIAL_FRIENDS[0]?.name}
            className="w-full h-full rounded-full object-cover border border-[#090C15]"
          />
        </div>

        {/* Satellite Friend Avatar 2 (Top Right - Priya) */}
        <div className="absolute top-6 right-4 z-20 w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500 shadow-lg animate-pulse">
          <img
            src={INITIAL_FRIENDS[1]?.avatar}
            alt={INITIAL_FRIENDS[1]?.name}
            className="w-full h-full rounded-full object-cover border border-[#090C15]"
          />
        </div>

        {/* Satellite Friend Avatar 3 (Middle Right - Kiran) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-orange-400 shadow-lg">
          <img
            src={INITIAL_FRIENDS[2]?.avatar}
            alt={INITIAL_FRIENDS[2]?.name}
            className="w-full h-full rounded-full object-cover border border-[#090C15]"
          />
        </div>

        {/* Satellite Friend Avatar 4 (Bottom Left - Ananya) */}
        <div className="absolute bottom-4 left-4 z-20 w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg animate-pulse">
          <img
            src={INITIAL_FRIENDS[3]?.avatar}
            alt={INITIAL_FRIENDS[3]?.name}
            className="w-full h-full rounded-full object-cover border border-[#090C15]"
          />
        </div>

        {/* Satellite Friend Avatar 5 (Middle Left - Sahana) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg">
          <img
            src={INITIAL_FRIENDS[4]?.avatar}
            alt={INITIAL_FRIENDS[4]?.name}
            className="w-full h-full rounded-full object-cover border border-[#090C15]"
          />
        </div>
      </div>

      {/* Bottom Auth Buttons & Explore Link */}
      <div className="w-full max-w-sm flex flex-col gap-3.5 z-10 pb-4">
        <button
          type="button"
          onClick={handleOpenSignup}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-98"
        >
          Create New Account
        </button>

        <button
          type="button"
          onClick={handleOpenLogin}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 shadow-lg transition-all hover:scale-[1.02] active:scale-98"
        >
          Log In
        </button>

        <button
          type="button"
          onClick={handleExploreGuest}
          className="mt-1 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
        >
          <span>Explore LinkUp</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
