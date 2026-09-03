import React from 'react';
import {
  Bell,
  Heart,
  Music,
  UserPlus,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const NotificationsDropdown = () => {
  const {
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationRead,
    markAllNotificationsRead,
  } = useSocial();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed top-16 right-4 sm:right-20 z-50 w-80 sm:w-96 glass-dropdown rounded-3xl p-4 border border-slate-700 shadow-2xl animate-in slide-in-from-top-3 duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Notifications Center
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="text-[11px] text-blue-400 hover:underline font-semibold"
          >
            Mark all read
          </button>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto no-scrollbar">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => markNotificationRead(notif.id)}
            className={`p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
              !notif.read
                ? 'bg-blue-600/10 border border-blue-500/20'
                : 'hover:bg-slate-800/60'
            }`}
          >
            <div className="relative">
              <img
                src={notif.user.avatar}
                alt={notif.user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
              />
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700">
                {notif.icon === 'heart' && (
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                )}
                {notif.icon === 'music' && (
                  <Music className="w-2.5 h-2.5 text-purple-400" />
                )}
                {notif.icon === 'user-plus' && (
                  <UserPlus className="w-2.5 h-2.5 text-blue-400" />
                )}
                {notif.icon === 'sparkles' && (
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                )}
                {notif.icon === 'check' && (
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-200">
                <span className="font-bold text-white">{notif.user.name}</span>{' '}
                {notif.action}
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                {notif.time}
              </span>
            </div>

            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
