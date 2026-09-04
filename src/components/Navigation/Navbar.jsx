import React from 'react';
import {
  Bell,
  MessageCircle,
  Search,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { Logo } from '../Common/Logo';

export const Navbar = () => {
  const {
    activeTab,
    setActiveTab,
    notifications,
    conversations,
    setIsSearchActive,
  } = useSocial();

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const unreadMsgCount = conversations.filter((c) => c.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-[#090C15]/95 backdrop-blur-2xl border-b border-slate-800/80 w-full select-none">
      {/* Main App Top Header */}
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: Official Brand Logo with intertwined Blue & Purple links */}
        <div onClick={() => setActiveTab('home')} className="cursor-pointer">
          <Logo size="md" showTagline={false} />
        </div>

        {/* Center: Find by LinkUp ID Quick Button */}
        <button
          type="button"
          onClick={() => setIsSearchActive(true)}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 text-xs font-bold flex items-center gap-2 transition-all shadow-sm group"
          title="Open Search Bar (Enter LinkUp ID, Name, Song)"
        >
          <Search className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Enter LinkUp ID (LK-...)</span>
          <span className="sm:hidden">Find ID</span>
        </button>

        {/* Right: Heart (Notifications) + Message (Direct Chat) */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-full hover:bg-slate-800/80 transition-colors ${
              activeTab === 'notifications' ? 'text-purple-400' : 'text-slate-200'
            }`}
            title="Notifications & Friend Requests"
          >
            <Bell className="w-6 h-6" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white border-2 border-[#090C15] shadow-lg animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Messages Chat */}
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`relative p-2 rounded-full hover:bg-slate-800/80 transition-colors ${
              activeTab === 'messages' || activeTab === 'chat_direct'
                ? 'text-purple-400'
                : 'text-slate-200'
            }`}
            title="Messages"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadMsgCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white border-2 border-[#090C15] shadow-lg animate-pulse">
                {unreadMsgCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
