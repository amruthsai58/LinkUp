import React, { useState } from 'react';
import { X, UserPlus, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

export const GoogleAuthModal = () => {
  const { googleAuthModalOpen, setGoogleAuthModalOpen, loginWithGoogle } = useAuth();
  const { setActiveTab } = useSocial();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(null);

  if (!googleAuthModalOpen) return null;

  const PRESET_ACCOUNTS = [
    {
      name: 'Amruth Sai',
      email: 'amruth.sai@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    },
    {
      name: 'Ashok Lingaraddi',
      email: 'ashok.lingaraddi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
  ];

  const handleSelectAccount = (account) => {
    setLoadingEmail(account.email);
    setTimeout(() => {
      loginWithGoogle(account.email, account.name, account.avatar);
      setActiveTab('home');
      setLoadingEmail(null);
    }, 400);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const finalEmail = customEmail.includes('@') ? customEmail : `${customEmail}@gmail.com`;
    const finalName = customName || finalEmail.split('@')[0];
    setLoadingEmail(finalEmail);
    setTimeout(() => {
      loginWithGoogle(finalEmail, finalName);
      setActiveTab('home');
      setLoadingEmail(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#0F1424] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-100 flex flex-col gap-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setGoogleAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <svg className="w-9 h-9" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>

          <h3 className="text-lg font-bold text-white">Sign in with Google</h3>
          <p className="text-xs text-slate-400">Choose an account to continue to LinkUp</p>
        </div>

        {/* Account Choices List */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          {PRESET_ACCOUNTS.map((acc) => (
            <div
              key={acc.email}
              onClick={() => handleSelectAccount(acc)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-850 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-blue-400 transition-colors"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                  <p className="text-[11px] text-slate-400">{acc.email}</p>
                </div>
              </div>

              {loadingEmail === acc.email ? (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
          ))}

          {/* Use another custom account option */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold transition-all text-left mt-1"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <span>Use another Gmail account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 mt-1">
              <h4 className="text-xs font-bold text-white">Enter any Gmail Address:</h4>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Full Name (Optional)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          To continue, Google will share your name, email address, and profile picture with LinkUp.
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
