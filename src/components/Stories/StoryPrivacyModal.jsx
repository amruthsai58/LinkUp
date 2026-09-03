import React, { useState } from 'react';
import { X, Shield, Lock, EyeOff, Users, Star, Check, Search } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const StoryPrivacyModal = ({
  isOpen,
  onClose,
  currentPrivacy = 'Public',
  hiddenUserIds = [],
  onSavePrivacy,
}) => {
  const { friends } = useSocial();

  const [privacy, setPrivacy] = useState(currentPrivacy);
  const [selectedHiddenIds, setSelectedHiddenIds] = useState(hiddenUserIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('audience'); // 'audience' | 'hide'

  if (!isOpen) return null;

  const PRIVACY_OPTIONS = [
    {
      id: 'Public',
      label: 'Public',
      desc: 'Anyone on LinkUp can view your story',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    },
    {
      id: 'Friends',
      label: 'Friends Only',
      desc: 'Only your confirmed LinkUp friends',
      icon: Shield,
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    },
    {
      id: 'CloseFriends',
      label: 'Close Friends',
      desc: 'Only people in your close friends circle',
      icon: Star,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    },
  ];

  const toggleHideUser = (userId) => {
    setSelectedHiddenIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredFriends = friends.filter(
    (f) =>
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    onSavePrivacy({
      privacy,
      hiddenFromUserIds: selectedHiddenIds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#0A0D18] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Story Privacy & Hide Settings</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 my-3 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('audience')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'audience' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Who Can View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hide')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hide' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide Story From ({selectedHiddenIds.length})</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pr-1">
          {activeTab === 'audience' ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-slate-400">Choose who can see this story:</p>

              {PRIVACY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = privacy === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPrivacy(opt.id)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-md'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                        <p className="text-[11px] text-slate-400">{opt.desc}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-purple-600 border-purple-500' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Hide Story From Section */
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Select people you want to hide your story from:
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {filteredFriends.map((f) => {
                  const isHidden = selectedHiddenIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => toggleHideUser(f.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isHidden
                          ? 'bg-red-950/30 border-red-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white">{f.name}</h5>
                          <p className="text-[10px] text-slate-400">@{f.username}</p>
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          isHidden
                            ? 'bg-red-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isHidden ? 'Hidden' : 'Visible'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="pt-3 border-t border-slate-800 mt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
          >
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryPrivacyModal;
