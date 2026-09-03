import React from 'react';
import {
  Users,
  Film,
  Bookmark,
  Clock,
  Calendar,
  ShoppingBag,
  Flag,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const MenuView = () => {
  const { setActiveTab } = useSocial();
  const { user: authUser, logout } = useAuth();

  const user = authUser || CURRENT_USER;

  const handleLogout = () => {
    logout();
    setActiveTab('auth_welcome');
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-20 select-none text-slate-100 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Menu</h2>
      </div>

      {/* User Profile Card */}
      <div
        onClick={() => setActiveTab('profile')}
        className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer transition-all mx-2"
      >
        <img
          src={user.avatar || CURRENT_USER.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
          <p className="text-xs text-slate-400">View your profile</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>

      {/* Your Shortcuts Colorful Tiles */}
      <div className="px-2 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your shortcuts</h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Friends */}
          <div
            onClick={() => setActiveTab('search')}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Friends</span>
          </div>

          {/* Reels */}
          <div
            onClick={() => setActiveTab('reels')}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Reels</span>
          </div>

          {/* Saved */}
          <div
            onClick={() => alert('Saved posts and bookmarks')}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Saved</span>
          </div>

          {/* Memories */}
          <div
            onClick={() => alert('LinkUp Memories & Highlights')}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Memories</span>
          </div>
        </div>
      </div>

      {/* Navigation List Items with Chevrons */}
      <div className="flex flex-col gap-1 px-2 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => alert('Events calendar')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Events</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => alert('LinkUp Marketplace')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Marketplace</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => alert('Pages you follow')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors"
        >
          <div className="flex items-center gap-3">
            <Flag className="w-4 h-4 text-orange-400" />
            <span>Pages</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => alert('Settings & Privacy')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Privacy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => alert('Help & Support Center')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Log Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-bold transition-colors mt-2"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400/60" />
        </button>
      </div>
    </div>
  );
};

export default MenuView;
