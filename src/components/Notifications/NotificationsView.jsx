import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Check, X, Radio, Share2 } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';

export const NotificationsView = () => {
  const { notifications, handleFriendRequest, viewUserProfile, watchLive, activeLiveStreams } = useSocial();
  const { user: authUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Unread' | 'Mentions' | 'Friends'

  const FILTERS = ['All', 'Unread', 'Mentions', 'Friends'];

  // Strictly deduplicate notifications to ensure a single notification per event
  const deduplicatedNotifs = [];
  const seenNotificationKeys = new Set();
  notifications.forEach((n) => {
    const username = (n.user?.username || n.user?.id || '').toLowerCase();
    const actionKey = (n.action || n.text || '').toLowerCase().replace(/[^a-z]/g, '');
    const dedupKey =
      n.type === 'friend_request'
        ? `freq_${username}_${actionKey.includes('accept') ? 'accept' : 'req'}`
        : (n.id || `${n.type}_${username}_${actionKey}`);

    if (!seenNotificationKeys.has(dedupKey)) {
      seenNotificationKeys.add(dedupKey);
      deduplicatedNotifs.push(n);
    }
  });

  const filteredNotifs = deduplicatedNotifs.filter((n) => {
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Mentions') return n.type === 'mention';
    if (activeFilter === 'Friends') return n.type === 'friend_request';
    return true;
  });

  const newNotifs = filteredNotifs.filter((n) => n.section === 'New' || !n.section);
  const earlierNotifs = filteredNotifs.filter((n) => n.section === 'Earlier');

  return (
    <div className="w-full flex flex-col gap-4 pb-20 text-slate-100 animate-in fade-in duration-200">
      {/* Active Live Streams Banner — visible to all followers */}
      {(activeLiveStreams || []).filter((s) => !authUser || s.broadcasterId !== authUser.id).length > 0 && (
        <div className="mx-2 mt-1 flex flex-col gap-2">
          {activeLiveStreams
            .filter((s) => !authUser || s.broadcasterId !== authUser.id)
            .slice(0, 3)
            .map((stream) => (
            <button
              key={stream.id || stream.broadcasterId}
              type="button"
              onClick={() => watchLive(stream)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-rose-950/40 border border-red-500/60 shadow-xl gap-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={stream.broadcasterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                    alt={stream.broadcasterName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-red-600 rounded text-[7px] font-black text-white uppercase leading-none">LIVE</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate">{stream.broadcasterName || 'Friend'} is LIVE! 🔴</p>
                  <p className="text-[11px] text-slate-300 truncate">{stream.title || 'Live Broadcast'}</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 flex-shrink-0 shadow-lg shadow-red-600/40">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Watch
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Notifications</h2>
      </div>

      {/* Filter Tabs Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-0.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === f
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>


      {/* New Section */}
      {newNotifs.length > 0 && (
        <div className="flex flex-col gap-2 px-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">New</h3>

          <div className="flex flex-col gap-2.5">
            {newNotifs.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={n.user.avatar}
                    alt={n.user.name}
                    onClick={() => viewUserProfile(n.user)}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 mt-0.5 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    title={`View ${n.user.name}'s Profile`}
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-slate-200 leading-snug">
                      <span
                        onClick={() => viewUserProfile(n.user)}
                        className="font-bold text-white mr-1 cursor-pointer hover:text-purple-300 hover:underline transition-colors"
                        title={`View ${n.user.name}'s Profile`}
                      >
                        {n.user.name}
                      </span>
                      <span>{n.action}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{n.time}</span>

                    {/* Action buttons for friend request */}
                    {n.hasActions && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleFriendRequest(n.user?.id || n.id, 'confirm')}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFriendRequest(n.user?.id || n.id, 'delete')}
                          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {/* Action button for Live Stream */}
                    {(n.type === 'live' || n.liveStream) && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => watchLive(n.liveStream)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-1.5 animate-pulse transition-all active:scale-95"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Watch Live</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Post Thumbnail */}
                {n.postThumbnail && (
                  <img
                    src={n.postThumbnail}
                    alt="thumb"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0 ml-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earlier Section */}
      {earlierNotifs.length > 0 && (
        <div className="flex flex-col gap-2 px-2 pt-2 border-t border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earlier</h3>

          <div className="flex flex-col gap-2.5">
            {earlierNotifs.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={n.user.avatar}
                    alt={n.user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 mt-0.5 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-slate-200 leading-snug">
                      <span className="font-bold text-white mr-1">{n.user.name}</span>
                      <span>{n.action}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{n.time}</span>

                    {/* Action button for Live Stream */}
                    {(n.type === 'live' || n.liveStream) && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => watchLive(n.liveStream)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-1.5 animate-pulse transition-all active:scale-95"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Watch Live</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
