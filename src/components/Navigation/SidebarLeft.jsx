import React, { useState } from 'react';
import {
  User,
  Users,
  Tv,
  Store,
  Bookmark,
  Settings,
  Flame,
  Layers,
  Sparkles,
  PlusSquare,
  Wand2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { AiAssistantModal } from '../AI/AiAssistantModal';

export const SidebarLeft = () => {
  const { user } = useAuth();
  const {
    setIsProfileOpen,
    setProfileUserId,
    setIsGroupsOpen,
    setIsMarketplaceOpen,
    setIsReelsOpen,
    setIsSettingsOpen,
    setCreateStoryOpen,
    setCreatePostOpen,
    addPost,
    groups,
  } = useSocial();

  const [showAiModal, setShowAiModal] = useState(false);

  const handleApplyAiPost = ({ content, feeling, musicTrackId }) => {
    addPost({
      content,
      media: [],
      musicTrackId,
      feeling,
      privacy: 'Public',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <aside className="w-64 xl:w-72 hidden md:flex flex-col gap-6 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pr-2 select-none">
        {/* User Profile Card */}
        {user && (
          <div
            onClick={() => {
              setProfileUserId(null);
              setIsProfileOpen(true);
            }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 cursor-pointer transition-all hover:scale-[1.02] group shadow-sm"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/60 shadow-md group-hover:border-blue-400"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                {user.name}
              </h3>
              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="flex flex-col gap-1">
          {/* AI Post & Caption Studio Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/50 via-pink-950/40 to-transparent hover:from-purple-950/80 text-purple-300 hover:text-white border border-purple-500/40 transition-all group shadow-md"
          >
            <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow group-hover:scale-110 transition-transform animate-pulse">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold bg-gradient-to-r from-purple-300 via-pink-300 to-white bg-clip-text text-transparent">
                LinkUp AI Studio
              </span>
              <span className="text-[11px] text-purple-400/80">AI Post & Caption Assistant</span>
            </div>
          </button>

          <button
            onClick={() => setIsReelsOpen(true)}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-transparent hover:from-rose-950/60 text-rose-300 hover:text-white border border-rose-500/30 transition-all group"
          >
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
              <Tv className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold bg-gradient-to-r from-rose-300 to-purple-300 bg-clip-text text-transparent">
                LinkUp Reels
              </span>
              <span className="text-[11px] text-rose-400/80">Shorts & Trending Videos</span>
            </div>
          </button>

          <button
            onClick={() => setCreateStoryOpen(true)}
            className="flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <PlusSquare className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Add 24h Story</span>
          </button>

          <button
            onClick={() => setIsGroupsOpen(true)}
            className="flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Groups & Communities</span>
          </button>

          <button
            onClick={() => setIsMarketplaceOpen(true)}
            className="flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Marketplace & Audio Gear</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Settings & Privacy Checkup</span>
          </button>
        </div>

        {/* Your Top Groups Shortcut */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Communities</span>
            <button onClick={() => setIsGroupsOpen(true)} className="text-xs text-blue-400 hover:underline">
              See all
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {groups.slice(0, 3).map((group) => (
              <div
                key={group.id}
                onClick={() => setIsGroupsOpen(true)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <img src={group.cover} alt={group.name} className="w-9 h-9 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{group.name}</h4>
                  <p className="text-[10px] text-slate-400">{group.membersCount.toLocaleString()} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Copyright */}
        <div className="px-3 text-[11px] text-slate-400 leading-relaxed mt-auto pb-6">
          <p className="font-semibold text-slate-400">LinkUp Social Network &copy; 2026</p>
          <p className="mt-1">Connect • Share • Grow</p>
        </div>
      </aside>

      {/* Standalone AI Studio Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyToPost={handleApplyAiPost}
      />
    </>
  );
};

export default SidebarLeft;
