import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Users,
  Video,
  Music,
  Plus,
  Globe,
  Wand2,
  Check,
  Search,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import { CURRENT_USER } from '../../data/mockSocialData';
import { fileToBase64 } from '../../utils/imageUtils';
import { AiAssistantModal } from '../AI/AiAssistantModal';
import { LiveStreamModal } from './LiveStreamModal';

export const CreatePostModal = () => {
  const { createPostOpen, setCreatePostOpen, addPost, friends } = useSocial();
  const { user: authUser } = useAuth();
  const { tracks } = useMusic();

  const user = authUser || CURRENT_USER;
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('Public');
  const [selectedSongId, setSelectedSongId] = useState('');
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [mediaItems, setMediaItems] = useState([
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
    },
  ]);

  // Sub-modal triggers
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [showTagFriendsModal, setShowTagFriendsModal] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');

  if (!createPostOpen) return null;

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.username.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith('video');
      let finalUrl;
      if (isVideo) {
        finalUrl = URL.createObjectURL(file);
      } else {
        finalUrl = await fileToBase64(file, 800, 800, 0.85);
      }
      setMediaItems((prev) => [
        ...prev,
        {
          type: isVideo ? 'video' : 'image',
          url: finalUrl,
        },
      ]);
    }
    e.target.value = '';
  };

  const removeMedia = (index) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTagFriend = (friendName) => {
    if (taggedFriends.includes(friendName)) {
      setTaggedFriends((prev) => prev.filter((n) => n !== friendName));
    } else {
      setTaggedFriends((prev) => [...prev, friendName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && mediaItems.length === 0 && !selectedSongId) return;

    let finalContent = content;
    if (taggedFriends.length > 0) {
      finalContent += ` — with ${taggedFriends.join(', ')}`;
    }

    addPost({
      content: finalContent,
      media: mediaItems,
      musicTrackId: selectedSongId || null,
      feeling: null,
      location: null,
      privacy,
    });

    setContent('');
    setSelectedSongId('');
    setTaggedFriends([]);
    setCreatePostOpen(false);
  };

  const handleApplyAiPost = ({ content: aiContent, musicTrackId: aiMusicTrackId }) => {
    setContent(aiContent);
    if (aiMusicTrackId) setSelectedSongId(aiMusicTrackId);
  };

  const selectedTrack = tracks.find((t) => t.id === selectedSongId);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-lg bg-[#0A0D18] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <button
              type="button"
              onClick={() => setCreatePostOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Create Post</h3>

            {/* AI Assistant button */}
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md hover:scale-105 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Write</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-3.5 overflow-y-auto no-scrollbar">
            {/* User Row */}
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || CURRENT_USER.avatar}
                alt={user.name || CURRENT_USER.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{user.name || CURRENT_USER.name}</h4>
                <div className="flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 w-fit">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>Public ▾</span>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none"
              autoFocus
            />

            {/* Tagged Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tagged Friends badge */}
              {taggedFriends.length > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>With {taggedFriends.length} friends</span>
                  <X
                    className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-white"
                    onClick={() => setTaggedFriends([])}
                  />
                </div>
              )}

              {/* Attached Track Badge */}
              {selectedTrack && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs font-semibold">
                  <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  <span>{selectedTrack.title}</span>
                  <X
                    className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-white"
                    onClick={() => setSelectedSongId('')}
                  />
                </div>
              )}
            </div>

            {/* Media Carousel Preview */}
            {mediaItems.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {mediaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700 group"
                  >
                    <img src={item.url} alt="thumb" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add more media tile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Feature Action Options List */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80">
              {/* Photo / Video */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs font-semibold transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span>Photo / Video</span>
              </button>

              {/* Tag Friends */}
              <button
                type="button"
                onClick={() => setShowTagFriendsModal(true)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs font-semibold transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Tag Friends</span>
                  {taggedFriends.length > 0 && (
                    <span className="text-[10px] text-blue-400 font-bold">{taggedFriends.length} tagged</span>
                  )}
                </div>
              </button>

              {/* Live Video */}
              <button
                type="button"
                onClick={() => setShowLiveStreamModal(true)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200 text-xs font-semibold transition-colors text-left group"
              >
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                  <Video className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Live Video Broadcast</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 text-[9px] font-black uppercase tracking-wider">
                    Go Live
                  </span>
                </div>
              </button>

              {/* Song Attachment */}
              <button
                type="button"
                onClick={() => setShowMusicPicker(!showMusicPicker)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/70 text-purple-300 text-xs font-bold transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-pink-400">
                  <Music className="w-4 h-4" />
                </div>
                <span>Attach Regional Song (105 Tracks)</span>
              </button>

              {/* Music Dropdown */}
              {showMusicPicker && (
                <select
                  value={selectedSongId}
                  onChange={(e) => setSelectedSongId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Track --</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} — {t.movie} ({t.language.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Bottom Purple Gradient Post Button */}
            <button
              type="submit"
              disabled={!content.trim() && mediaItems.length === 0 && !selectedSongId}
              className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      </div>

      {/* TAG FRIENDS PICKER MODAL */}
      {showTagFriendsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0C101D] border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 max-h-[80vh]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Tag Friends</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowTagFriendsModal(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-60">
              {filteredFriends.map((f) => (
                <div
                  key={f.id}
                  onClick={() => toggleTagFriend(f.name)}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    taggedFriends.includes(f.name)
                      ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                      : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{f.name}</h5>
                      <p className="text-[10px] text-slate-400">@{f.username}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      taggedFriends.includes(f.name)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {taggedFriends.includes(f.name) && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTagFriendsModal(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md mt-1"
            >
              Done ({taggedFriends.length} Tagged)
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyToPost={handleApplyAiPost}
        initialPrompt={content}
      />

      {/* Live Video Broadcast Stage Modal */}
      <LiveStreamModal
        isOpen={showLiveStreamModal}
        onClose={() => setShowLiveStreamModal(false)}
      />
    </>
  );
};

export default CreatePostModal;
