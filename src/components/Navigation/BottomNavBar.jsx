import React from 'react';
import {
  Home,
  Search,
  Plus,
  Film,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const BottomNavBar = () => {
  const { activeTab, setActiveTab, setCreatePostOpen, setViewingUser, setIsSearchActive } = useSocial();
  const { user: authUser } = useAuth();

  const user = authUser || CURRENT_USER;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090C15]/95 backdrop-blur-2xl border-t border-slate-800/80 max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none">
      {/* Home Button */}
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeTab === 'home' ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'
        }`}
        title="Home Feed"
      >
        <Home className="w-6 h-6" />
        {activeTab === 'home' && <span className="w-1 h-1 bg-purple-500 rounded-full mt-1" />}
      </button>

      {/* Search Button */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('search');
          setIsSearchActive(true);
        }}
        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeTab === 'search' ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'
        }`}
        title="Search & Explore"
      >
        <Search className="w-6 h-6" />
        {activeTab === 'search' && <span className="w-1 h-1 bg-purple-500 rounded-full mt-1" />}
      </button>

      {/* Create Post Button */}
      <button
        type="button"
        onClick={() => setCreatePostOpen(true)}
        className="p-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-110 active:scale-95"
        title="Create Post"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
      </button>

      {/* Reels Button */}
      <button
        type="button"
        onClick={() => setActiveTab('reels')}
        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeTab === 'reels' ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'
        }`}
        title="Reels"
      >
        <Film className="w-6 h-6" />
        {activeTab === 'reels' && <span className="w-1 h-1 bg-purple-500 rounded-full mt-1" />}
      </button>

      {/* Profile Button */}
      <button
        type="button"
        onClick={() => {
          if (setViewingUser) setViewingUser(null);
          setActiveTab('profile');
        }}
        className={`p-1.5 rounded-full transition-all ${
          activeTab === 'profile' ? 'ring-2 ring-purple-500 scale-110' : 'opacity-70 hover:opacity-100'
        }`}
        title="Profile"
      >
        <img
          src={user.avatar || CURRENT_USER.avatar}
          alt={user.name}
          className="w-6 h-6 rounded-full object-cover"
        />
      </button>
    </nav>
  );
};

export default BottomNavBar;
