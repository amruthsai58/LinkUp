import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Smile,
  MapPin,
  Music,
  Globe,
  Users,
  Lock,
  X,
  Sparkles,
  Wand2,
  Upload,
  Film,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { AiAssistantModal } from '../AI/AiAssistantModal';

const FEELINGS_LIST = [
  { emoji: '🔥', text: 'feeling pumped' },
  { emoji: '🎧', text: 'vibing to South Indian beats' },
  { emoji: '💖', text: 'feeling loved' },
  { emoji: '✨', text: 'feeling inspired' },
  { emoji: '🕺', text: 'dancing & celebrating' },
  { emoji: '☕', text: 'chilling' },
];

export const CreatePostCard = () => {
  const { user } = useAuth();
  const { createPostOpen, setCreatePostOpen, addPost } = useSocial();
  const { tracks } = useMusic();

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('Public');
  const [selectedSongId, setSelectedSongId] = useState('');
  const [mediaItems, setMediaItems] = useState([]); // [{ type: 'image' | 'video', url: string, name?: string }]

  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Handle local file uploads (Photos & Videos)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const objectUrl = URL.createObjectURL(file);

      setMediaItems((prev) => [
        ...prev,
        {
          type: isVideo ? 'video' : 'image',
          url: objectUrl,
          name: file.name,
        },
      ]);
    });

    setCreatePostOpen(true);
    e.target.value = ''; // reset file input
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && mediaItems.length === 0 && !selectedSongId) return;

    addPost({
      content,
      media: mediaItems,
      musicTrackId: selectedSongId || null,
      feeling: selectedFeeling,
      location: location || null,
      privacy,
    });

    // Reset
    setContent('');
    setSelectedFeeling(null);
    setLocation('');
    setSelectedSongId('');
    setMediaItems([]);
    setShowFeelingPicker(false);
    setShowMusicPicker(false);
    setShowLocationInput(false);
  };

  const handleApplyAiPost = ({ content: aiContent, feeling: aiFeeling, musicTrackId: aiMusicTrackId }) => {
    setContent(aiContent);
    if (aiFeeling) setSelectedFeeling(aiFeeling);
    if (aiMusicTrackId) setSelectedSongId(aiMusicTrackId);
    setCreatePostOpen(true);
  };

  const removeMedia = (index) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedTrack = tracks.find((t) => t.id === selectedSongId);

  return (
    <>
      {/* Hidden File Upload Inputs for Media */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleFileUpload}
        accept="video/*"
        multiple
        className="hidden"
      />

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl relative">
        {/* Top row: Avatar + Text Trigger / Box */}
        <div className="flex items-start gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />

          <div className="flex-1">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setCreatePostOpen(true)}
                placeholder={`What's on your mind, ${user?.name ? user.name.split(' ')[0] : 'friend'}? Post photos, videos, or use AI Assistant...`}
                rows={createPostOpen ? 3 : 2}
                className="w-full bg-slate-800/60 hover:bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl p-3 pr-24 border border-slate-700/60 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
              />

              {/* Instant AI Post Generator Trigger Button */}
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
                title="Generate with AI Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>AI Write</span>
              </button>
            </div>

            {/* Selected Attached Tags Bar */}
            {(selectedFeeling || location || selectedTrack) && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {selectedFeeling && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    <span>{selectedFeeling.emoji}</span>
                    <span>{selectedFeeling.text}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white ml-1"
                      onClick={() => setSelectedFeeling(null)}
                    />
                  </span>
                )}

                {location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{location}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white ml-1"
                      onClick={() => setLocation('')}
                    />
                  </span>
                )}

                {selectedTrack && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                    <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    <span>
                      {selectedTrack.title} ({selectedTrack.movie} - {selectedTrack.language.toUpperCase()})
                    </span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white ml-1"
                      onClick={() => setSelectedSongId('')}
                    />
                  </span>
                )}
              </div>
            )}

            {/* Media Previews (Supports uploaded photos AND videos) */}
            {mediaItems.length > 0 && (
              <div className={`grid gap-2 mt-3 ${mediaItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {mediaItems.map((item, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden group bg-black border border-slate-700 min-h-[140px] max-h-[260px] flex items-center justify-center">
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        controls
                        className="w-full h-full max-h-[260px] object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt="upload"
                        className="w-full h-full max-h-[260px] object-cover"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none">
                      {item.type === 'video' ? <Film className="w-3 h-3 text-rose-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
                      <span>{item.type === 'video' ? 'Video' : 'Photo'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Tool Pickers Drawer */}
            {createPostOpen && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-3">
                {/* Music Attachment Selector */}
                {showMusicPicker && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-pink-400" />
                        Attach Regional Song (105 Tracks in Kannada, Telugu, Tamil)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMusicPicker(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <select
                      value={selectedSongId}
                      onChange={(e) => setSelectedSongId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-purple-500/40 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option value="">-- Choose a Track to Embed in Post --</option>
                      <optgroup label="🟡🔴 Kannada Tracks">
                        {tracks
                          .filter((t) => t.language === 'kannada')
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} — {t.movie} ({t.singers})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="🟠🟢 Telugu Tracks">
                        {tracks
                          .filter((t) => t.language === 'telugu')
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} — {t.movie} ({t.singers})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="🔴⚪ Tamil Tracks">
                        {tracks
                          .filter((t) => t.language === 'tamil')
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} — {t.movie} ({t.singers})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                )}

                {/* Feelings Picker */}
                {showFeelingPicker && (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-wrap gap-1.5">
                    {FEELINGS_LIST.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedFeeling(f);
                          setShowFeelingPicker(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>{f.emoji}</span>
                        <span>{f.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Location Input */}
                {showLocationInput && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru, Karnataka or Hyderabad, TG"
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLocationInput(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* Privacy Selector & Post Submit Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        className="pl-7 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Public">Public</option>
                        <option value="Friends">Friends Only</option>
                        <option value="Only Me">Only Me</option>
                      </select>
                      {privacy === 'Public' && (
                        <Globe className="w-3.5 h-3.5 text-blue-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                      {privacy === 'Friends' && (
                        <Users className="w-3.5 h-3.5 text-cyan-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                      {privacy === 'Only Me' && (
                        <Lock className="w-3.5 h-3.5 text-amber-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCreatePostOpen(false)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!content.trim() && mediaItems.length === 0 && !selectedSongId}
                      className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      Publish Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tool Icons Bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-slate-400">
          {/* Upload Photo from Local Media */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-emerald-400 text-xs font-semibold transition-colors"
            title="Upload Photos from device"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo</span>
          </button>

          {/* Upload Video from Local Media */}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-rose-400 text-xs font-semibold transition-colors"
            title="Upload Videos from device"
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>

          {/* AI Assistant Action */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 hover:from-purple-500/20 text-purple-300 hover:text-pink-200 text-xs font-bold border border-purple-500/30 transition-all hover:scale-105"
          >
            <Wand2 className="w-4 h-4 text-pink-400" />
            <span>AI Assistant</span>
          </button>

          {/* Song Attachment */}
          <button
            type="button"
            onClick={() => {
              setCreatePostOpen(true);
              setShowMusicPicker(!showMusicPicker);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 transition-all hover:scale-105"
          >
            <Music className="w-4 h-4 text-pink-400" />
            <span>Song</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreatePostOpen(true);
              setShowFeelingPicker(!showFeelingPicker);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-amber-400 text-xs font-semibold transition-colors"
          >
            <Smile className="w-4 h-4" />
            <span className="hidden sm:inline">Feeling</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyToPost={handleApplyAiPost}
        initialPrompt={content}
      />
    </>
  );
};

export default CreatePostCard;
