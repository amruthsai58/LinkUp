import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Check, X } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const NotificationsView = () => {
  const { notifications, handleFriendRequest } = useSocial();
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Unread' | 'Mentions' | 'Friends'

  const FILTERS = ['All', 'Unread', 'Mentions', 'Friends'];

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Mentions') return n.type === 'mention';
    if (activeFilter === 'Friends') return n.type === 'friend_request';
    return true;
  });

  const newNotifs = filteredNotifs.filter((n) => n.section === 'New' || !n.section);
  const earlierNotifs = filteredNotifs.filter((n) => n.section === 'Earlier');

  return (
    <div className="w-full flex flex-col gap-4 pb-20 select-none text-slate-100 animate-in fade-in duration-200">
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
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 mt-0.5 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-slate-200 leading-snug">
                      <span className="font-bold text-white mr-1">{n.user.name}</span>
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
