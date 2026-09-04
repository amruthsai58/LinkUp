import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  UserCheck,
  UserPlus,
  MessageCircle,
  Users,
  Check,
  ShieldCheck,
  UserMinus,
  Sparkles,
} from 'lucide-react';

export const FollowersModal = ({
  isOpen,
  onClose,
  initialTab = 'followers',
  profileUser,
  isMyProfile,
  followersList = [],
  followingList = [],
  onUserClick,
  onToggleFollow,
  onOpenChat,
  followedUsers = {},
  onRemoveFollower,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'followers' | 'following'
  const [searchQuery, setSearchQuery] = useState('');

  // Keep activeTab in sync when modal opens with a different tab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  const currentList = activeTab === 'followers' ? followersList : followingList;

  // Filter list by search query (name, username, or linkupId)
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.linkupId?.toLowerCase().includes(q)
    );
  }, [currentList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#0A0D18] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              {isMyProfile ? 'Your Network' : `${profileUser?.name || 'User'}'s Network`}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isMyProfile
                ? 'Manage your followers and accounts you follow'
                : `Viewing connections for @${profileUser?.username || 'user'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-2xl mt-3 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'followers'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Followers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'followers'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {followersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'following'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Following</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'following'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {followingList.length}
            </span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} by name, @username, or ID...`}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User List Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar mt-3 space-y-2 pr-0.5 min-h-[220px] max-h-[50vh]">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
                <Users className="w-6 h-6 text-purple-400/60" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {searchQuery
                  ? `No ${activeTab} match "${searchQuery}"`
                  : `No ${activeTab} yet`}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs">
                {searchQuery
                  ? 'Check your spelling or search by their LinkUp ID (e.g. LK-20481).'
                  : activeTab === 'followers'
                  ? 'Share your official LinkUp ID with friends to start getting followers!'
                  : 'Search for friends or explore LinkUp to start following creators and accounts.'}
              </p>
            </div>
          ) : (
            filteredList.map((targetUser) => {
              const userKey = targetUser.username?.toLowerCase() || targetUser.id;
              const isCurrentlyFollowing = Boolean(
                followedUsers[userKey] ||
                followedUsers[targetUser.linkupId?.toLowerCase()] ||
                followedUsers[targetUser.id] ||
                targetUser.isFollowing
              );

              return (
                <div
                  key={targetUser.id || targetUser.username || targetUser.linkupId}
                  className="group flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-purple-500/30 transition-all shadow-sm"
                >
                  {/* Left: Avatar + Details (Clickable -> View Profile) */}
                  <div
                    onClick={() => onUserClick && onUserClick(targetUser)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-md">
                        <img
                          src={
                            targetUser.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
                          }
                          alt={targetUser.name}
                          className="w-full h-full rounded-full object-cover border border-[#090C15]"
                        />
                      </div>
                      {targetUser.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090C15]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {targetUser.name}
                        </h4>
                        {targetUser.linkupId && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-950/80 text-[10px] font-mono font-black text-purple-300 border border-purple-800/50">
                            {targetUser.linkupId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        @{targetUser.username}
                      </p>
                      {targetUser.role && (
                        <p className="text-[10px] text-slate-500 truncate">
                          {targetUser.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Direct Message button */}
                    {onOpenChat && !targetUser.isMe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChat(targetUser);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 transition-colors border border-slate-700/60"
                        title={`Message @${targetUser.username}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Follow / Following toggle or Self indicator */}
                    {targetUser.isMe ? (
                      <span className="px-3 py-1.5 rounded-xl bg-purple-950/50 text-[11px] font-bold text-purple-300 border border-purple-800/40">
                        You
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFollow && onToggleFollow(targetUser);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isCurrentlyFollowing
                            ? 'bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 group/btn'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20'
                        }`}
                      >
                        {isCurrentlyFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 group-hover/btn:hidden text-emerald-400" />
                            <UserMinus className="w-3.5 h-3.5 hidden group-hover/btn:block text-rose-400" />
                            <span className="group-hover/btn:hidden">Following</span>
                            <span className="hidden group-hover/btn:inline">Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{activeTab === 'followers' ? 'Follow Back' : 'Follow'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Optional Remove Follower button for own profile */}
                    {isMyProfile && activeTab === 'followers' && onRemoveFollower && !targetUser.isMe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFollower(targetUser);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove follower"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tap any user to view full profile</span>
          <span className="font-mono text-purple-400 font-bold">
            {filteredList.length} {activeTab}
          </span>
        </div>
      </div>
    </div>
  );
};
