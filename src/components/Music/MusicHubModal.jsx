import React, { useState } from 'react';
import {
  X,
  Search,
  Flame,
  Sparkles,
  Music,
  Play,
  Pause,
  Heart,
  Plus,
  Share2,
  Radio,
  Disc,
  Headphones,
  Check,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useSocial } from '../../context/SocialContext';
import { REGIONAL_LANGUAGES, GENRE_MOODS } from '../../data/musicCatalog';

export const MusicHubModal = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    likedSongIds,
    activeLanguage,
    isMusicHubOpen,
    setIsMusicHubOpen,
    setActiveLanguage,
    togglePlay,
    toggleLikeSong,
    addToQueue,
    createListenTogetherRoom,
    formatTime,
  } = useMusic();

  const { addPost, setCreatePostOpen } = useSocial();

  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [shareToastSong, setShareToastSong] = useState(null);

  if (!isMusicHubOpen) return null;

  // Filter songs by Language, Genre/Mood, and Search Query
  const filteredTracks = tracks.filter((track) => {
    const matchesLang =
      activeLanguage === 'all' || track.language === activeLanguage;

    const matchesGenre =
      selectedGenre === 'all'
        ? true
        : selectedGenre === 'trending'
        ? track.isTrending
        : selectedGenre === 'new'
        ? true
        : track.genre === selectedGenre;

    const matchesSearch =
      search === '' ||
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.movie.toLowerCase().includes(search.toLowerCase()) ||
      track.singers.toLowerCase().includes(search.toLowerCase()) ||
      track.musicDirector.toLowerCase().includes(search.toLowerCase());

    return matchesLang && matchesGenre && matchesSearch;
  });

  const handleShareToPost = (track) => {
    addPost({
      content: `Vibing to "${track.title}" from the movie ${track.movie} on LinkUp Regional Music! 🎶✨ #SouthBeats #${track.language.toUpperCase()}`,
      musicTrackId: track.id,
      feeling: { emoji: '🎧', text: `listening to ${track.title}` },
      privacy: 'Public',
    });
    setShareToastSong(track.title);
    setTimeout(() => setShareToastSong(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Search & Language Tabs */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-600/30">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Regional Music Hub</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-bold">
                    LIVE STREAMING
                  </span>
                </h2>
                <p className="text-xs text-purple-300">
                  Kannada • Telugu • Tamil — Real-time Play Counts & Charts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  createListenTogetherRoom('Regional Music Live Room')
                }
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-transform active:scale-95"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Listen Together</span>
              </button>

              <button
                onClick={() => setIsMusicHubOpen(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar + Language Filter Chips */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search song, movie, singer, composer..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-purple-500/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {REGIONAL_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLanguage(lang.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeLanguage === lang.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Genre / Mood Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedGenre === 'all'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {GENRE_MOODS.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Share Feedback Toast */}
        {shareToastSong && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Shared "{shareToastSong}" as a new post on your LinkUp Feed!</span>
          </div>
        )}

        {/* Tracks Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTracks.map((track, idx) => {
              const isThisPlaying = isPlaying && currentTrack?.id === track.id;
              const isLiked = likedSongIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-2xl transition-all flex items-center gap-3.5 group border ${
                    isThisPlaying
                      ? 'bg-gradient-to-r from-purple-900/40 to-slate-900 border-purple-500/60 shadow-lg'
                      : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50'
                  }`}
                >
                  {/* Artwork + Play overlay */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => togglePlay(track)}
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
                    >
                      {isThisPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      )}
                    </button>
                    {track.isTrending && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-black rounded shadow">
                        #{track.trendingRank || idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[9px] uppercase border border-purple-500/30">
                        {track.language}
                      </span>
                      <span className="text-[10px] text-pink-400 font-bold">
                        {track.movie}
                      </span>
                    </div>

                    <h4
                      onClick={() => togglePlay(track)}
                      className="text-sm font-bold text-white truncate hover:text-purple-300 cursor-pointer mt-0.5"
                    >
                      {track.title}
                    </h4>

                    <p className="text-xs text-slate-400 truncate">
                      {track.singers} • {track.musicDirector}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{track.playCount.toLocaleString()} plays</span>
                      <span>•</span>
                      <span>{formatTime(track.duration)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLikeSong(track.id)}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Save to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => addToQueue(track)}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShareToPost(track)}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-purple-400 transition-colors"
                      title="Share into Feed Post"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicHubModal;
