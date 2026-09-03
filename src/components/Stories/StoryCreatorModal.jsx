import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Music,
  Sparkles,
  Search,
  Play,
  Pause,
  Check,
  Wand2,
  Image as ImageIcon,
  Upload,
  Volume2,
  Shield,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { REGIONAL_LANGUAGES } from '../../data/musicCatalog';
import { fileToBase64 } from '../../utils/imageUtils';
import { AiAssistantModal } from '../AI/AiAssistantModal';
import { StoryPrivacyModal } from './StoryPrivacyModal';

export const StoryCreatorModal = () => {
  const { createStoryOpen, setCreateStoryOpen, addStory } = useSocial();
  const { tracks, playTrack, stopAudio, togglePlay, currentTrack, isPlaying } = useMusic();

  const fileInputRef = useRef(null);

  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'
  );
  const [caption, setCaption] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState('kan-01');
  const [showMusicPicker, setShowMusicPicker] = useState(true);
  const [musicSearch, setMusicSearch] = useState('');
  const [musicLanguage, setMusicLanguage] = useState('all');
  const [showAiModal, setShowAiModal] = useState(false);

  // Privacy & Hide settings state
  const [privacy, setPrivacy] = useState('Public');
  const [hiddenFromUserIds, setHiddenFromUserIds] = useState([]);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Stop audio preview when modal is closed
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (!createStoryOpen) return null;

  const sampleBackgrounds = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
  ];

  const selectedTrack = tracks.find((t) => t.id === selectedMusicId);
  const isSelectedTrackPlaying = isPlaying && currentTrack?.id === selectedTrack?.id;

  // Filter songs for story from the full 105 catalog
  const filteredSongs = tracks.filter((t) => {
    const matchesLang = musicLanguage === 'all' || t.language === musicLanguage;
    const matchesSearch =
      musicSearch === '' ||
      t.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
      t.movie.toLowerCase().includes(musicSearch.toLowerCase()) ||
      t.singers.toLowerCase().includes(musicSearch.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const handleApplyAiStory = ({ caption: aiCaption, musicTrackId: aiMusicId }) => {
    setCaption(aiCaption);
    if (aiMusicId) {
      setSelectedMusicId(aiMusicId);
      const match = tracks.find((t) => t.id === aiMusicId);
      if (match) playTrack(match);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const permanentDataUrl = await fileToBase64(file, 900, 1200, 0.85);
        setMediaUrl(permanentDataUrl);
      } catch (err) {
        console.warn('Error reading photo:', err);
      }
    }
  };

  const handleClose = () => {
    stopAudio();
    setCreateStoryOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mediaUrl) return;

    stopAudio();
    addStory({
      mediaUrl,
      caption,
      musicTrackId: selectedMusicId || null,
      privacy,
      hiddenFromUserIds,
    });
  };

  const handleSongClick = (track) => {
    if (selectedMusicId === track.id && isPlaying && currentTrack?.id === track.id) {
      togglePlay(track);
    } else {
      setSelectedMusicId(track.id);
      playTrack(track);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-lg bg-[#0F1424] border border-slate-700/80 rounded-3xl p-5 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Create 24-Hour Story</span>
            </h3>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-4">
            {/* Story Live Preview Canvas */}
            <div className="relative w-full aspect-[9/13] max-h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-inner flex items-center justify-center group">
              <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Music sticker badge overlay */}
              {selectedTrack && (
                <div
                  onClick={() => togglePlay(selectedTrack)}
                  className="absolute top-3 left-3 right-3 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-purple-500/50 flex items-center gap-2 text-white cursor-pointer shadow-lg"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-purple-900 flex items-center justify-center">
                    <img
                      src={selectedTrack.coverUrl}
                      alt={selectedTrack.title}
                      className={`w-full h-full object-cover ${isSelectedTrackPlaying ? 'animate-spin-slow' : ''}`}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      {isSelectedTrackPlaying ? (
                        <Pause className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-bold text-purple-200">
                      {selectedTrack.title} • {selectedTrack.movie}
                    </span>
                  </div>

                  <div className="flex items-end gap-0.5 h-2.5">
                    <div className={`w-0.5 bg-pink-400 ${isSelectedTrackPlaying ? 'animate-equalizer' : 'h-1'}`} />
                    <div className={`w-0.5 bg-pink-400 ${isSelectedTrackPlaying ? 'animate-equalizer delay-100' : 'h-1'}`} />
                    <div className={`w-0.5 bg-pink-400 ${isSelectedTrackPlaying ? 'animate-equalizer delay-200' : 'h-1'}`} />
                  </div>
                </div>
              )}

              {/* Caption Overlay */}
              {caption && (
                <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium text-center border border-white/10">
                  {caption}
                </div>
              )}
            </div>

            {/* Select Background / Upload Photo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Choose Background Photo</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {sampleBackgrounds.map((bg, idx) => (
                  <div
                    key={idx}
                    onClick={() => setMediaUrl(bg)}
                    className={`relative w-14 h-18 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${
                      mediaUrl === bg ? 'border-purple-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={bg} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Caption & AI Writer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Story Caption</label>
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-bold text-white flex items-center gap-1 hover:opacity-90 transition-all shadow-sm"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AI Story Writer</span>
                </button>
              </div>

              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a vibe caption to your story..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Attach Music Track */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                  <span>Attach Soundtrack ({filteredSongs.length} available)</span>
                </label>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setMusicLanguage('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    musicLanguage === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  All (105 Tracks)
                </button>
                {REGIONAL_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setMusicLanguage(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      musicLanguage === lang.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {/* Search Songs */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={musicSearch}
                  onChange={(e) => setMusicSearch(e.target.value)}
                  placeholder="Search tracks, movies, singers..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Songs List */}
              <div className="max-h-40 overflow-y-auto no-scrollbar flex flex-col gap-1.5 pr-1">
                {filteredSongs.slice(0, 15).map((track) => {
                  const isSelected = selectedMusicId === track.id;
                  const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSongClick(track)}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600/30 border border-purple-500 shadow-md scale-[1.01]'
                          : 'hover:bg-slate-800/80 border border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {isThisPlaying ? (
                              <Pause className="w-3 h-3 text-white" />
                            ) : (
                              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h6 className="text-xs font-bold text-white truncate">{track.title}</h6>
                          <p className="text-[10px] text-slate-400 truncate">
                            {track.movie} • {track.singers} ({track.language.toUpperCase()})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isThisPlaying && (
                          <div className="flex items-end gap-0.5 h-3">
                            <div className="w-0.5 bg-pink-400 animate-equalizer" />
                            <div className="w-0.5 bg-pink-400 animate-equalizer delay-100" />
                            <div className="w-0.5 bg-pink-400 animate-equalizer delay-200" />
                          </div>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Audience Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Privacy:</span>
                <span className="text-xs font-bold text-white">{privacy}</span>
                {hiddenFromUserIds.length > 0 && (
                  <span className="text-[10px] text-red-400 font-bold">
                    (Hidden from {hiddenFromUserIds.length})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-purple-300 border border-purple-500/30 transition-colors"
              >
                Change Privacy
              </button>
            </div>

            {/* Share Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Share to Your Story
            </button>
          </form>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyToStory={handleApplyAiStory}
        initialPrompt={caption}
      />

      {/* Story Privacy Modal */}
      <StoryPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        currentPrivacy={privacy}
        hiddenUserIds={hiddenFromUserIds}
        onSavePrivacy={({ privacy: p, hiddenFromUserIds: h }) => {
          setPrivacy(p);
          setHiddenFromUserIds(h);
        }}
      />
    </>
  );
};

export default StoryCreatorModal;
