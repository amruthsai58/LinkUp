import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  Heart,
  Send,
  Play,
  Pause,
  Trash2,
  EyeOff,
  MoreVertical,
  Shield,
  Lock,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { StoryPrivacyModal } from './StoryPrivacyModal';

export const StoryViewerModal = () => {
  const { stories, activeStoryIndex, setActiveStoryIndex, deleteStory, updateStoryPrivacy } = useSocial();
  const { tracks, playTrack, stopAudio, togglePlay, currentTrack, isPlaying } = useMusic();

  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const attachedTrack = currentStory?.musicTrackId
    ? tracks.find((t) => t.id === currentStory.musicTrackId)
    : null;

  const isStoryMusicPlaying = isPlaying && currentTrack?.id === attachedTrack?.id;

  // Auto-play song when story opens and stop when advancing to a story without song or when exited
  useEffect(() => {
    if (activeStoryIndex === null) {
      stopAudio();
      return;
    }

    setProgress(0);
    setIsLiked(false);
    setMenuOpen(false);
    setShowDeleteConfirm(false);

    if (attachedTrack) {
      playTrack(attachedTrack);
    } else {
      stopAudio();
    }

    if (isPaused || menuOpen || privacyModalOpen || showDeleteConfirm) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            stopAudio();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [activeStoryIndex, isPaused, menuOpen, privacyModalOpen, showDeleteConfirm, stories.length]);

  // Stop audio immediately when story modal is closed or unmounted
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (activeStoryIndex === null || !currentStory) return null;

  const handleCloseStory = () => {
    stopAudio();
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

  const handleDeleteStory = () => {
    deleteStory(currentStory.id);
    setShowDeleteConfirm(false);
    if (stories.length <= 1) {
      handleCloseStory();
    } else {
      setActiveStoryIndex(Math.max(0, activeStoryIndex - 1));
    }
  };

  const handleSavePrivacy = ({ privacy, hiddenFromUserIds }) => {
    updateStoryPrivacy(currentStory.id, { privacy, hiddenFromUserIds });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none p-0 sm:p-4 animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={handleCloseStory}
          className="absolute top-4 right-4 sm:right-8 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-50 transition-all hover:scale-105 shadow-xl border border-slate-700"
          title="Exit Story"
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

          {/* User Info Header with Options Menu */}
          <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.user.avatar}
                alt={currentStory.user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div>
                <h4 className="text-sm font-bold text-white drop-shadow flex items-center gap-1.5">
                  <span>{currentStory.user.name}</span>
                  {currentStory.privacy && currentStory.privacy !== 'Public' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600/80 text-[9px] font-bold text-white">
                      {currentStory.privacy}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 drop-shadow">{currentStory.timestamp}</p>
              </div>
            </div>

            {/* Top Action Controls: Privacy & Options */}
            <div className="flex items-center gap-1.5">
              {/* Play / Pause toggle */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* Options Menu Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                  title="Story Settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 z-40 shadow-2xl text-xs flex flex-col gap-1 animate-in fade-in duration-150">
                    {/* Privacy / Hide settings */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setPrivacyModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold text-left"
                    >
                      <EyeOff className="w-4 h-4 text-purple-400" />
                      <span>Hide / Privacy</span>
                    </button>

                    {/* Delete Story */}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 font-semibold text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Story</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Banner */}
          {showDeleteConfirm && (
            <div className="absolute top-20 inset-x-4 z-40 p-3.5 rounded-2xl bg-slate-950/95 border border-red-500/40 backdrop-blur-xl shadow-2xl flex flex-col gap-2.5 text-center">
              <p className="text-xs font-bold text-white">Delete this story?</p>
              <p className="text-[11px] text-slate-400">It will be removed from your friends' story feed.</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStory}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

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
          <div
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="absolute inset-0 z-10 bg-black flex items-center justify-center"
          >
            <img
              src={currentStory.mediaUrl}
              alt="story"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

            {/* Hotspot tap navigation */}
            <div
              onClick={handlePrev}
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-20"
            />
            <div
              onClick={handleNext}
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-20"
            />
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
                type="button"
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
                type="button"
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

      {/* Story Privacy & Hide Modal */}
      <StoryPrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        currentPrivacy={currentStory.privacy || 'Public'}
        hiddenUserIds={currentStory.hiddenFromUserIds || []}
        onSavePrivacy={handleSavePrivacy}
      />
    </>
  );
};

export default StoryViewerModal;
