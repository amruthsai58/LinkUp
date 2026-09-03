import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Music,
  Send,
  Sparkles,
  Check,
  UserPlus,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';

export const ReelsModal = () => {
  const { reels, isReelsOpen, setIsReelsOpen } = useSocial();
  const { isPlaying, togglePlay } = useMusic();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState({});
  const [bookmarkedReels, setBookmarkedReels] = useState({});
  const [followingCreators, setFollowingCreators] = useState({});
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reelComments, setReelComments] = useState({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const videoRef = useRef(null);

  const currentReel = reels[currentIndex] || reels[0];

  const isLiked = likedReels[currentReel?.id] ?? currentReel?.isLiked ?? false;
  const isBookmarked = bookmarkedReels[currentReel?.id] ?? false;
  const isFollowing =
    followingCreators[currentReel?.creator?.username] ??
    currentReel?.creator?.isFollowing ??
    false;

  const commentsList = reelComments[currentReel?.id] || currentReel?.comments || [];

  // When Reels modal is opened, pause any background music player so only the reel video audio is heard
  useEffect(() => {
    if (isReelsOpen) {
      if (isPlaying) {
        togglePlay(); // pause background player
      }
      setIsPlayingVideo(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isReelsOpen, currentIndex]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space for play/pause, M for mute, Esc to close)
  useEffect(() => {
    if (!isReelsOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handleTogglePlayVideo();
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsReelsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReelsOpen, currentIndex]);

  if (!isReelsOpen || !currentReel) return null;

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop back to first
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  const handleTogglePlayVideo = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
        setIsPlayingVideo(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlayingVideo(true);
      }
    }
  };

  const handleDoubleTap = (e) => {
    e.stopPropagation();
    if (!isLiked) {
      setLikedReels((prev) => ({ ...prev, [currentReel.id]: true }));
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleToggleLike = () => {
    setLikedReels((prev) => ({
      ...prev,
      [currentReel.id]: !isLiked,
    }));
  };

  const handleToggleBookmark = () => {
    setBookmarkedReels((prev) => ({
      ...prev,
      [currentReel.id]: !isBookmarked,
    }));
  };

  const handleToggleFollow = () => {
    setFollowingCreators((prev) => ({
      ...prev,
      [currentReel.creator.username]: !isFollowing,
    }));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: `rc-${Date.now()}`,
      author: user?.name || 'Amruth Sai',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      text: newComment.trim(),
    };

    setReelComments((prev) => ({
      ...prev,
      [currentReel.id]: [commentObj, ...(prev[currentReel.id] || currentReel.comments || [])],
    }));
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4 select-none animate-in fade-in duration-200">
      {/* Top Controls: LinkUp Branding */}
      <div className="absolute top-4 left-4 sm:left-8 z-50 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-xl">
          <img src="/logo.png" alt="LinkUp" className="w-5 h-5 rounded-md object-contain" />
          <span className="text-xs font-black tracking-tight text-white font-display">
            Link<span className="text-blue-500">Up</span> <span className="text-rose-400 font-bold">Reels</span>
          </span>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setIsReelsOpen(false)}
        className="absolute top-4 right-4 sm:right-8 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-50 transition-all hover:scale-105 shadow-xl border border-slate-700"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Up / Down Navigation Controls for Desktop */}
      <div className="hidden md:flex absolute right-8 sm:right-16 flex-col gap-4 z-50">
        <button
          onClick={handlePrev}
          className="p-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white transition-all hover:scale-110 shadow-2xl border border-slate-700 active:scale-95"
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="p-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white transition-all hover:scale-110 shadow-2xl border border-slate-700 active:scale-95"
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>Reel link copied to clipboard!</span>
        </div>
      )}

      {/* Main Reel Video Player Frame */}
      <div className="relative w-full sm:max-w-[420px] h-full sm:h-[90vh] max-h-[850px] bg-black sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-800 flex flex-col justify-between">
        {/* Video Player */}
        <div
          onClick={handleTogglePlayVideo}
          onDoubleClick={handleDoubleTap}
          className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer"
        >
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            poster={currentReel.posterUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Vignette Gradient Protection */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

          {/* Double Tap Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-ping">
              <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.9)]" />
            </div>
          )}

          {/* Pause / Play Center Indicator Overlay */}
          {!isPlayingVideo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-2xl">
                <Play className="w-10 h-10 fill-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Top Header info (Mute toggle, Index indicator) */}
        <div className="relative z-30 p-4 pt-16 sm:pt-4 flex items-center justify-between pointer-events-auto">
          <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-slate-200 text-xs font-semibold border border-white/10">
            <span>{currentIndex + 1} / {reels.length}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/10 transition-transform active:scale-95"
            title={isMuted ? 'Unmute Reel Audio' : 'Mute Reel Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Right Interaction Sidebar Rail (Instagram / YouTube Shorts style) */}
        <div className="absolute right-3.5 bottom-20 z-30 flex flex-col items-center gap-4 pointer-events-auto">
          {/* Creator Avatar with Follow Button */}
          <div className="relative mb-2">
            <img
              src={currentReel.creator.avatar}
              alt={currentReel.creator.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xl"
            />
            {!isFollowing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFollow();
                }}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
                title="Follow Creator"
              >
                <UserPlus className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Like Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLike();
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`p-3 rounded-full backdrop-blur-md transition-all group-hover:scale-110 active:scale-90 shadow-lg ${
                isLiked
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/10'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {(currentReel.likesCount + (isLiked ? 1 : 0)).toLocaleString()}
            </span>
          </button>

          {/* Comments Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentsDrawer(true);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/10 transition-all group-hover:scale-110 active:scale-90 shadow-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {commentsList.length || currentReel.commentsCount}
            </span>
          </button>

          {/* Share Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border border-white/10 transition-all group-hover:scale-110 active:scale-90 shadow-lg">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {currentReel.sharesCount}
            </span>
          </button>

          {/* Save / Bookmark Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBookmark();
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all group-hover:scale-110 active:scale-90 shadow-lg ${
                isBookmarked ? 'bg-amber-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-white' : ''}`} />
            </div>
          </button>
        </div>

        {/* Bottom Reel Caption & Sound Info */}
        <div className="relative z-30 p-4 pr-16 flex flex-col gap-2 pointer-events-auto">
          {/* Creator Details */}
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white drop-shadow">
              @{currentReel.creator.username}
            </h4>
            <span className="text-xs text-slate-300">•</span>
            <button
              onClick={handleToggleFollow}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                isFollowing
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Caption */}
          <p className="text-xs text-slate-100 line-clamp-2 leading-relaxed drop-shadow">
            {currentReel.caption}
          </p>

          {/* Reel Audio Soundtrack Info */}
          {currentReel.soundTitle && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-semibold max-w-[280px]">
              <Music className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span className="truncate text-[11px]">{currentReel.soundTitle}</span>
            </div>
          )}
        </div>

        {/* Slide-over Comments Drawer */}
        {showCommentsDrawer && (
          <div className="absolute inset-x-0 bottom-0 top-36 bg-slate-900/98 backdrop-blur-xl rounded-t-3xl border-t border-slate-700 z-50 flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span>Comments ({commentsList.length})</span>
              </h4>
              <button
                onClick={() => setShowCommentsDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments Stream */}
            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 no-scrollbar">
              {commentsList.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <img
                    src={c.avatar}
                    alt={c.author}
                    className="w-7 h-7 rounded-full object-cover mt-0.5"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-white">{c.author}</span>
                    <p className="text-slate-200 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment on this reel..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsModal;
