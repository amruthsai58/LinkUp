import React from 'react';
import {
  Flame,
  Play,
  UserPlus,
  Check,
  Tv,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const SidebarRight = () => {
  const {
    friends,
    sendFriendRequest,
    acceptFriendRequest,
    setIsChatOpen,
    setActiveChatFriend,
    reels,
    setIsReelsOpen,
  } = useSocial();

  const friendSuggestions = friends.filter((f) => !f.isFriend);
  const onlineFriends = friends.filter((f) => f.isFriend && f.status === 'online');

  return (
    <aside className="w-72 xl:w-80 hidden lg:flex flex-col gap-6 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pl-2 select-none pb-24">
      {/* Trending Reels Quick Watch Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/40 border border-rose-500/20 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 animate-pulse">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                <span>Trending Reels</span>
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-rose-300">Short video moments</p>
            </div>
          </div>
          <button
            onClick={() => setIsReelsOpen(true)}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Watch All</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {reels.slice(0, 2).map((reel) => (
            <div
              key={reel.id}
              onClick={() => setIsReelsOpen(true)}
              className="relative h-32 rounded-xl overflow-hidden cursor-pointer group border border-slate-700/60 shadow"
            >
              <img
                src={reel.posterUrl}
                alt="poster"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 rounded-full bg-rose-600 text-white shadow">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[10px] font-bold text-white truncate drop-shadow">
                  @{reel.creator.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Suggestions / Requests */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            People You May Know
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {friendSuggestions.map((person) => (
            <div key={person.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 truncate">{person.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {person.mutualFriends} mutual friends • {person.hometown}
                  </p>
                </div>
              </div>

              {person.hasPendingRequest ? (
                <button
                  onClick={() => acceptFriendRequest(person.id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3 h-3" />
                  <span>Accept</span>
                </button>
              ) : (
                <button
                  onClick={() => sendFriendRequest(person.id)}
                  className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Online Contacts for Chat */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Online Friends</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {onlineFriends.length}
            </span>
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          {onlineFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => {
                setActiveChatFriend(friend);
                setIsChatOpen(true);
              }}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                    {friend.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">{friend.hometown}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarRight;
