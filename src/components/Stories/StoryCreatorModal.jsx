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
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { REGIONAL_LANGUAGES } from '../../data/musicCatalog';
import { AiAssistantModal } from '../AI/AiAssistantModal';

export const StoryCreatorModal = () => {
  const { createStoryOpen, setCreateStoryOpen, addStory } = useSocial();
  const { tracks, playTrack, stopAudio, togglePlay, currentTrack, isPlaying } = useMusic();

  const fileInputRef = useRef(null);

  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'
  );
  const [caption, setCaption] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState('kan-01');
  const [showMusicPicker, setShowMusicPicker] = useState(true); // Open by default for easy song exploration
  const [musicSearch, setMusicSearch] = useState('');
  const [musicLanguage, setMusicLanguage] = useState('all');
  const [showAiModal, setShowAiModal] = useState(false);

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setMediaUrl(objUrl);
    }
  };

  const handleClose = () => {
    stopAudio(); // Stop audio immediately when modal is exited
    setCreateStoryOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mediaUrl) return;

    stopAudio(); // Stop preview playback upon publishing
    addStory({
      mediaUrl,
      caption,
      musicTrackId: selectedMusicId || null,
    });
  };

  // Tapping a song in the list selects it and immediately plays it
  const handleSongClick = (track) => {
    if (selectedMusicId === track.id && isPlaying && currentTrack?.id === track.id) {
      togglePlay(track); // Pause if currently playing
    } else {
      setSelectedMusicId(track.id);
      playTrack(track); // Directly play preview on user tap
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Close button stops audio immediately */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20"
            title="Exit (Stops Audio)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Create 24-Hour Story</span>
            </h3>

            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="mr-8 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md hover:opacity-90 transition-all hover:scale-105"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Caption</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto no-scrollbar">
            {/* Story Visual Preview Canvas with Live Music Preview */}
            <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center flex-shrink-0">
              <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

              {/* Instagram Style Live Music Sticker with Interactive Play/Pause Indicator */}
              {selectedTrack && (
                <div className="absolute top-3 left-3 right-3 flex justify-center z-10">
                  <div
                    onClick={() => togglePlay(selectedTrack)}
                    className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-purple-500/50 text-white text-xs font-bold flex items-center gap-2 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                    title={isSelectedTrackPlaying ? 'Tap to pause preview' : 'Tap to play preview'}
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-purple-950 flex items-center justify-center">
                      <img
                        src={selectedTrack.coverUrl}
                        alt={selectedTrack.title}
                        className={`w-full h-full object-cover ${isSelectedTrackPlaying ? 'animate-spin-slow' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isSelectedTrackPlaying ? (
                          <Pause className="w-3 h-3 text-white" />
                        ) : (
                          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    <span className="truncate max-w-[170px] text-[11px]">
                      {selectedTrack.title} • {selectedTrack.movie}
                    </span>

                    <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                      <div className={`w-0.5 bg-pink-400 ${isSelectedTrackPlaying ? 'animate-equalizer' : 'h-1'}`} />
                      <div className={`w-0.5 bg-pink-400 ${isSelectedTrackPlaying ? 'animate-equalizer delay-100' : 'h-1.5'}`} />
                      <div className={`w-0.5 bg-pink-400 ${isSelectedTrackPlaying ? 'animate-equalizer delay-200' : 'h-1'}`} />
                    </div>
                  </div>
                </div>
              )}

              {caption && (
                <p className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-xs font-semibold text-white bg-black/60 backdrop-blur-sm p-1.5 rounded-lg">
                  {caption}
                </p>
              )}
            </div>

            {/* Photo Picker (Upload from device + Presets) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Choose Photo
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload from Device</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {sampleBackgrounds.map((bg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMediaUrl(bg)}
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      mediaUrl === bg ? 'border-blue-500 scale-105' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={bg} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Input */}
            <div>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a story caption (e.g. Vibe of the day ✨)..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 105 Songs Regional Music Hub with Instant Tap-to-Play Testing */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span>Choose Song ({tracks.length} Regional Songs)</span>
                </span>
                <span className="text-[10px] text-pink-300 font-semibold flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  <span>Tap any song to play</span>
                </span>
              </div>

              {/* Music Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={musicSearch}
                  onChange={(e) => setMusicSearch(e.target.value)}
                  placeholder="Search 105 songs (e.g. Kantara, RRR, Jailer, Pushpa, KGF)..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Language filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {REGIONAL_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setMusicLanguage(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      musicLanguage === lang.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>

              {/* Song choices list with instant tap-to-play */}
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {filteredSongs.map((track) => {
                  const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                  const isSelected = selectedMusicId === track.id;

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
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {isThisPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
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

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              Share to Your Story
            </button>
          </form>
        </div>
      </div>

      {/* AI Assistant Modal for Story */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyToStory={handleApplyAiStory}
        initialPrompt={caption}
      />
    </>
  );
};

export default StoryCreatorModal;
