import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  ListMusic,
  Heart,
  Music,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

export const MusicPlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    queue,
    likedSongIds,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
    changeVolume,
    toggleMute,
    toggleLikeSong,
    setIsShuffle,
    setIsRepeat,
    formatTime,
  } = useMusic();

  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!currentTrack || isDismissed) return null;

  const isLiked = likedSongIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const activeLyricIndex = (currentTrack.lyrics || []).findLastIndex(
    (l) => currentTime >= l.time
  );

  return (
    <>
      {/* Floating Persistent Mini Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 sm:px-6 py-2.5 shadow-2xl transition-all">
        {/* Top Progress Bar Scrubber */}
        <div className="absolute -top-1.5 left-0 right-0 h-2 group cursor-pointer">
          <div className="w-full h-1 bg-slate-700/60 group-hover:h-2 transition-all">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Track Artwork & Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0 group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-1 bg-pink-400 animate-equalizer" />
                    <div className="w-1 bg-pink-400 animate-equalizer delay-100" />
                    <div className="w-1 bg-pink-400 animate-equalizer delay-200" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[9px] uppercase border border-purple-500/30">
                  {currentTrack.language}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentTrack.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack.movie} • {currentTrack.singers}
              </p>
            </div>

            <button
              onClick={() => toggleLikeSong(currentTrack.id)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors hidden sm:block"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'text-rose-500 fill-rose-500' : ''
                }`}
              />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                  isShuffle ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => togglePlay()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                  isRepeat ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Repeat Track"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Time Indicators */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Lyrics, Queue, Volume & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Synced Lyrics Toggle */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-2 rounded-xl transition-colors ${
                showLyrics ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Lyrics"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-xl transition-colors ${
                showQueue ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="items-center gap-2 hidden lg:flex">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(e.target.value)}
                className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg cursor-pointer accent-blue-500"
              />
            </div>

            {/* Hide / Dismiss Player */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Hide Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Lyrics Popup Drawer */}
      {showLyrics && (
        <div className="fixed bottom-20 right-4 sm:right-8 w-80 sm:w-96 glass-dropdown rounded-3xl p-5 border border-purple-500/30 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synced Lyrics</span>
            </h4>
            <button
              onClick={() => setShowLyrics(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto no-scrollbar py-2">
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((lyric, idx) => {
                const isActive = activeLyricIndex === idx;
                return (
                  <p
                    key={idx}
                    className={`text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'text-pink-400 scale-105 pl-2 font-bold drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {lyric.text}
                  </p>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Lyrics for this regional track will be available soon!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Queue Drawer */}
      {showQueue && (
        <div className="fixed bottom-20 right-4 sm:right-28 w-80 sm:w-96 glass-dropdown rounded-3xl p-5 border border-slate-700 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5 text-blue-400" />
              <span>Playback Queue ({queue.length})</span>
            </h4>
            <button
              onClick={() => setShowQueue(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto no-scrollbar">
            {queue.map((track, idx) => (
              <div
                key={idx}
                onClick={() => togglePlay(track)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-9 h-9 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                  <p className="text-[10px] text-slate-400 truncate">
                    {track.movie} • {track.language.toUpperCase()}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatTime(track.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MusicPlayerBar;
