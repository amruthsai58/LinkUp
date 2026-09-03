import React from 'react';
import {
  Heart,
  MessageCircle,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { Logo } from '../Common/Logo';

export const Navbar = () => {
  const {
    activeTab,
    setActiveTab,
    notifications,
    conversations,
  } = useSocial();

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const unreadMsgCount = conversations.filter((c) => c.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-[#090C15]/95 backdrop-blur-2xl border-b border-slate-800/80 w-full select-none">
      {/* Main App Top Header */}
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: Official Brand Logo with intertwined Blue & Purple links */}
        <div onClick={() => setActiveTab('home')}>
          <Logo size="md" showTagline={false} />
        </div>

        {/* Right: Heart (Notifications) + Message (Direct Chat) */}
        <div className="flex items-center gap-2">
          {/* Notifications Heart */}
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-full hover:bg-slate-800/80 transition-colors ${
              activeTab === 'notifications' ? 'text-purple-400' : 'text-slate-200'
            }`}
            title="Notifications"
          >
            <Heart className="w-6 h-6" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#090C15]" />
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
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#090C15]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
