import React, { useState } from 'react';
import {
  ChevronDown,
  Menu,
  UserPlus,
  Grid,
  Film,
  Tag,
  Share2,
  Bookmark,
  Plus,
  Edit2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';
import { EditProfileModal } from './EditProfileModal';
import { HighlightViewerModal } from './HighlightViewerModal';
import { CreateHighlightModal } from './CreateHighlightModal';
import { EditHighlightModal } from './EditHighlightModal';

export const ProfileView = () => {
  const { setActiveTab } = useSocial();
  const { user: authUser, updateUserProfile } = useAuth();
  const [activeTabSub, setActiveTabSub] = useState('grid'); // 'grid' | 'reels' | 'tagged'

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [isCreateHighlightOpen, setIsCreateHighlightOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [contextMenuHlId, setContextMenuHlId] = useState(null);
  const [idCopied, setIdCopied] = useState(false);

  const user = authUser || CURRENT_USER;
  const highlights = user.highlights || CURRENT_USER.highlights;

  const handleCopyId = () => {
    if (user.linkupId) {
      navigator.clipboard?.writeText(user.linkupId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  };

  const handleAddHighlight = (newHl) => {
    const updatedHighlights = [...highlights, newHl];
    updateUserProfile({ highlights: updatedHighlights });
  };

  const handleUpdateHighlight = (updatedHl) => {
    const updatedHighlights = highlights.map((hl) => (hl.id === updatedHl.id ? updatedHl : hl));
    updateUserProfile({ highlights: updatedHighlights });
    if (activeHighlight && activeHighlight.id === updatedHl.id) {
      setActiveHighlight(updatedHl);
    }
  };

  const handleDeleteHighlight = (highlightId) => {
    const updatedHighlights = highlights.filter((hl) => hl.id !== highlightId);
    updateUserProfile({ highlights: updatedHighlights });
    if (activeHighlight && activeHighlight.id === highlightId) {
      setActiveHighlight(null);
    }
    setContextMenuHlId(null);
  };

  const handleUpdateHighlightStories = (highlightId, newStories) => {
    const updatedHighlights = highlights.map((hl) => {
      if (hl.id === highlightId) {
        return { ...hl, stories: newStories };
      }
      return hl;
    });
    updateUserProfile({ highlights: updatedHighlights });
    if (activeHighlight && activeHighlight.id === highlightId) {
      setActiveHighlight((prev) => (prev ? { ...prev, stories: newStories } : null));
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 pb-20 select-none text-slate-100 animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1 cursor-pointer">
            <h2 className="text-base font-extrabold tracking-tight text-white">{user.username}</h2>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
            title="Menu & Settings"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Main Profile Header Row: Avatar + Stats */}
        <div className="flex items-center justify-between px-2 gap-4">
          {/* Large Avatar with Gradient Ring */}
          <div
            onClick={() => setIsEditModalOpen(true)}
            className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 shadow-xl flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            title="Click to edit profile picture"
          >
            <img
              src={user.avatar || CURRENT_USER.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#090C15]"
            />
            <div className="absolute bottom-0 right-0 p-1 rounded-full bg-purple-600 text-white border-2 border-[#090C15] shadow-md">
              <Edit2 className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* 3 Stats Columns */}
          <div className="flex-1 flex items-center justify-around text-center">
            <div className="cursor-pointer hover:opacity-80">
              <span className="block text-base sm:text-lg font-black text-white">{user.postsCount ?? 42}</span>
              <span className="text-[11px] text-slate-400 font-medium">Posts</span>
            </div>

            <div className="cursor-pointer hover:opacity-80">
              <span className="block text-base sm:text-lg font-black text-white">{user.friendsCount ?? 842}</span>
              <span className="text-[11px] text-slate-400 font-medium">Friends</span>
            </div>

            <div className="cursor-pointer hover:opacity-80">
              <span className="block text-base sm:text-lg font-black text-white">{user.followingCount ?? 126}</span>
              <span className="text-[11px] text-slate-400 font-medium">Following</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-2 flex flex-col gap-0.5">
          <h3 className="text-sm font-black text-white">{user.name}</h3>
          <p className="text-xs text-slate-300 font-medium">{user.role || user.work || 'Computer Science Student'}</p>
          <p className="text-xs text-slate-400">{user.subtitle || user.bio || 'Java Developer | Problem Solver'}</p>
          <a
            href={`https://${user.website || 'linkup.dev/' + user.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline w-fit mt-0.5"
          >
            {user.website || `linkup.dev/${user.username}`}
          </a>
        </div>

        {/* LinkUp Official ID Badge */}
        <div className="mx-2 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              ID
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400">Official LinkUp ID</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs font-mono font-black text-white tracking-wider">{user.linkupId || 'LK-84920'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-purple-300 flex items-center gap-1.5 transition-all active:scale-95 shadow"
          >
            {idCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 px-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all hover:scale-[1.01]"
          >
            Edit Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <span>Add Friends</span>
            <UserPlus className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* Story Highlights Row with Quick Context Actions */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar px-2 py-1 relative">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className="relative flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div
                onClick={() => setActiveHighlight(hl)}
                className={`w-14 h-14 rounded-full bg-slate-900 border-2 ${hl.color} flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform`}
              >
                <span>{hl.icon}</span>
              </div>

              <span
                onClick={() => setActiveHighlight(hl)}
                className="text-[11px] font-bold text-slate-300 group-hover:text-purple-300 transition-colors"
              >
                {hl.name}
              </span>

              {/* 3-dots Quick Edit Indicator */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuHlId(contextMenuHlId === hl.id ? null : hl.id);
                }}
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-700 shadow-md transition-colors"
                title="Highlight Options"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {/* Popup Context Menu */}
              {contextMenuHlId === hl.id && (
                <div className="absolute top-12 left-0 z-40 w-36 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl text-xs flex flex-col gap-1 animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      setContextMenuHlId(null);
                      setEditingHighlight(hl);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold text-left"
                  >
                    <Edit className="w-3.5 h-3.5 text-purple-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteHighlight(hl.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-red-400 font-semibold text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Highlight Button */}
          <div
            onClick={() => setIsCreateHighlightOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-purple-500 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400">New</span>
          </div>
        </div>

        {/* Gallery Tabs Bar */}
        <div className="flex items-center justify-around border-t border-slate-800/80 pt-1">
          <button
            type="button"
            onClick={() => setActiveTabSub('grid')}
            className={`flex-1 py-2.5 flex items-center justify-center transition-all ${
              activeTabSub === 'grid' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('reels')}
            className={`flex-1 py-2.5 flex items-center justify-center transition-all ${
              activeTabSub === 'reels' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Film className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('tagged')}
            className={`flex-1 py-2.5 flex items-center justify-center transition-all ${
              activeTabSub === 'tagged' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Tag className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Photo Grid */}
        <div className="grid grid-cols-3 gap-1 px-0.5">
          {(user.gallery || CURRENT_USER.gallery).map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-square bg-slate-800 overflow-hidden cursor-pointer group"
            >
              <img
                src={imgUrl}
                alt="post grid"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Story Highlight Viewer Modal */}
      {activeHighlight && (
        <HighlightViewerModal
          highlight={activeHighlight}
          isOpen={Boolean(activeHighlight)}
          onClose={() => setActiveHighlight(null)}
          onOpenEditModal={(hl) => {
            setActiveHighlight(null);
            setEditingHighlight(hl);
          }}
          onDeleteHighlight={handleDeleteHighlight}
          onUpdateHighlightStories={handleUpdateHighlightStories}
        />
      )}

      {/* Create New Highlight Modal */}
      <CreateHighlightModal
        isOpen={isCreateHighlightOpen}
        onClose={() => setIsCreateHighlightOpen(false)}
        onAddHighlight={handleAddHighlight}
      />

      {/* Edit / Remove Highlight Modal */}
      {editingHighlight && (
        <EditHighlightModal
          highlight={editingHighlight}
          isOpen={Boolean(editingHighlight)}
          onClose={() => setEditingHighlight(null)}
          onUpdateHighlight={handleUpdateHighlight}
          onDeleteHighlight={handleDeleteHighlight}
        />
      )}
    </>
  );
};

export default ProfileView;
