import React, { useState } from 'react';
import { X, Users, Plus, Check, Search, Sparkles } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const GroupsModal = () => {
  const { groups, isGroupsOpen, setIsGroupsOpen, toggleGroupJoin } = useSocial();
  const [filter, setFilter] = useState('all');

  if (!isGroupsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Groups & Communities</h3>
              <p className="text-xs text-slate-400">
                Join regional music circles, cinema forums, and local hobby clubs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGroupsOpen(false)}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Groups Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 no-scrollbar">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between gap-3 group hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={group.cover}
                  alt={group.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                    {group.category}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{group.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {group.membersCount.toLocaleString()} members • {group.privacy}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">{group.description}</p>

              <button
                onClick={() => toggleGroupJoin(group.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  group.isJoined
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                }`}
              >
                {group.isJoined ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Joined Group</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Join Group</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupsModal;
