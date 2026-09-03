import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  Heart,
  Send,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';

export const StoryViewerModal = () => {
  const { stories, activeStoryIndex, setActiveStoryIndex } = useSocial();
  const { tracks, playTrack, stopAudio, togglePlay, currentTrack, isPlaying } = useMusic();

  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const attachedTrack = currentStory?.musicTrackId
    ? tracks.find((t) => t.id === currentStory.musicTrackId)
    : null;

  const isStoryMusicPlaying = isPlaying && currentTrack?.id === attachedTrack?.id;

  // Auto-play song when story opens and stop when advancing to a story without song or when exited
  useEffect(() => {
    if (activeStoryIndex === null) {
      stopAudio(); // Stop audio immediately when exiting story
      return;
    }

    setProgress(0);
    setIsLiked(false);

    // Automatically play the story's song
    if (attachedTrack) {
      playTrack(attachedTrack);
    } else {
      stopAudio();
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            stopAudio(); // Stop audio when story finishes
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [activeStoryIndex]);

  // Stop audio immediately when story modal is closed or unmounted
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (activeStoryIndex === null || !currentStory) return null;

  const handleCloseStory = () => {
    stopAudio(); // Immediately stop audio when exiting
    setActiveStoryIndex(null);
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      handleCloseStory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Close Button - Exits and stops audio immediately */}
      <button
        onClick={handleCloseStory}
        className="absolute top-4 right-4 sm:right-8 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-50 transition-all hover:scale-105 shadow-xl border border-slate-700"
        title="Exit Story (Stops Music)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Nav Arrows */}
      {activeStoryIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-12 p-3.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-50 transition-all hover:scale-110 shadow-2xl border border-slate-700 hidden sm:block"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {activeStoryIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-12 p-3.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-50 transition-all hover:scale-110 shadow-2xl border border-slate-700 hidden sm:block"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Story Phone Stage Container */}
      <div className="relative w-full sm:max-w-[420px] h-full sm:h-[90vh] max-h-[850px] bg-slate-900 sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-800 flex flex-col justify-between">
        {/* Top Progress Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width:
                    idx < activeStoryIndex
                      ? '100%'
                      : idx === activeStoryIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Header */}
        <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentStory.user.avatar}
              alt={currentStory.user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
            />
            <div>
              <h4 className="text-sm font-bold text-white drop-shadow">
                {currentStory.user.name}
              </h4>
              <p className="text-xs text-slate-300 drop-shadow">{currentStory.timestamp}</p>
            </div>
          </div>
        </div>

        {/* Floating Instagram-style Music Sticker in Center/Top of Story */}
        {attachedTrack && (
          <div className="absolute top-20 left-4 right-4 z-30 flex justify-center">
            <div
              onClick={() => togglePlay(attachedTrack)}
              className="px-3.5 py-2 rounded-2xl bg-black/70 hover:bg-black/85 backdrop-blur-xl border border-purple-500/50 text-white text-xs font-bold flex items-center gap-2.5 shadow-2xl cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-purple-950 flex items-center justify-center">
                <img
                  src={attachedTrack.coverUrl}
                  alt={attachedTrack.title}
                  className={`w-full h-full object-cover ${isStoryMusicPlaying ? 'animate-spin-slow' : ''}`}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {isStoryMusicPlaying ? (
                    <Pause className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  )}
                </div>
              </div>

              <div className="min-w-0 max-w-[170px]">
                <span className="block truncate font-bold text-purple-200">
                  {attachedTrack.title} • {attachedTrack.movie}
                </span>
                <span className="text-[10px] text-slate-300 font-normal truncate block">
                  {isStoryMusicPlaying ? 'Playing automatically' : 'Paused • Tap to play'}
                </span>
              </div>

              <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0">
                <div className={`w-1 bg-pink-400 ${isStoryMusicPlaying ? 'animate-equalizer' : 'h-1'}`} />
                <div className={`w-1 bg-pink-400 ${isStoryMusicPlaying ? 'animate-equalizer delay-100' : 'h-1.5'}`} />
                <div className={`w-1 bg-pink-400 ${isStoryMusicPlaying ? 'animate-equalizer delay-200' : 'h-1'}`} />
              </div>
            </div>
          </div>
        )}

        {/* Story Visual Media */}
        <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
          <img
            src={currentStory.mediaUrl}
            alt="story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
        </div>

        {/* Caption & Reply Footer */}
        <div className="relative z-30 p-4 mt-auto flex flex-col gap-3">
          {currentStory.caption && (
            <p className="text-sm font-medium text-white drop-shadow-md text-center bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
              {currentStory.caption}
            </p>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.user.name}...`}
              className="flex-1 px-4 py-2 bg-slate-800/80 backdrop-blur-md border border-slate-600 rounded-full text-white text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-transform active:scale-90 ${
                isLiked
                  ? 'text-rose-500 bg-rose-500/20'
                  : 'text-white bg-slate-800/80 hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (replyText.trim()) {
                  setReplyText('');
                  alert('Reply sent!');
                }
              }}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewerModal;
