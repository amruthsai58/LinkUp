import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Send,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_REELS } from '../../data/mockSocialData';

export const ReelsView = () => {
  const { user } = useAuth();
  const { reels: contextReels, setCreateStoryOpen } = useSocial();
  const { stopAudio } = useMusic();

  const allReels = useMemo(() => {
    const raw = contextReels && contextReels.length >= INITIAL_REELS.length ? contextReels : INITIAL_REELS;
    const map = new Map();
    (raw || []).forEach((r) => {
      if (r && r.id && !map.has(r.id)) {
        map.set(r.id, r);
      }
    });
    return Array.from(map.values());
  }, [contextReels]);

  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likesState, setLikesState] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [touchStartY, setTouchStartY] = useState(0);
  const [sharedState, setSharedState] = useState({});

  const videoRef = useRef(null);
  const currentReel = allReels[activeReelIndex] || allReels[0];

  // Stop background music tracks when viewing Reels
  useEffect(() => {
    stopAudio();
    if (currentReel?.comments) {
      setCommentsList(currentReel.comments);
    }
  }, [activeReelIndex, currentReel]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleLike = (index) => {
    setLikesState((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNextReel = () => {
    if (activeReelIndex < allReels.length - 1) {
      setActiveReelIndex(activeReelIndex + 1);
    } else {
      setActiveReelIndex(0);
    }
  };

  const handlePrevReel = () => {
    if (activeReelIndex > 0) {
      setActiveReelIndex(activeReelIndex - 1);
    } else {
      setActiveReelIndex(allReels.length - 1);
    }
  };

  // Keyboard navigation (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        handleNextReel();
      } else if (e.key === 'ArrowUp') {
        handlePrevReel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, allReels.length]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (diff > 50) {
      handleNextReel(); // swipe up
    } else if (diff < -50) {
      handlePrevReel(); // swipe down
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList((prev) => [
      ...prev,
      { id: `rc-${Date.now()}`, author: user?.name || 'LinkUp User', text: newComment, time: 'Just now' },
    ]);
    setNewComment('');
  };

  const isLiked = likesState[activeReelIndex] ?? currentReel?.isLiked ?? false;

  const handleShareReel = async (e) => {
    e.stopPropagation();
    const reelUrl = currentReel?.videoUrl
      ? `${window.location.origin}${window.location.pathname}?reel=${encodeURIComponent(currentReel.id || 'latest')}`
      : window.location.href;
    const shareData = {
      title: `Watch this Reel on LinkUp by @${currentReel?.creator?.username || 'linkup'}`,
      text: currentReel?.caption || 'Check out this reel on LinkUp! 🎬',
      url: reelUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(reelUrl);
        setSharedState((prev) => ({ ...prev, [activeReelIndex]: true }));
        setTimeout(() => setSharedState((prev) => ({ ...prev, [activeReelIndex]: false })), 2500);
      }
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = reelUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setSharedState((prev) => ({ ...prev, [activeReelIndex]: true }));
        setTimeout(() => setSharedState((prev) => ({ ...prev, [activeReelIndex]: false })), 2500);
      } catch {}
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[calc(100dvh-135px)] sm:h-[84vh] sm:max-h-[820px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl select-none"
    >
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-white drop-shadow-md">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight">Reels</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-purple-300 border border-purple-500/30">
            {activeReelIndex + 1} / {allReels.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>

          <button
            type="button"
            onClick={() => setCreateStoryOpen(true)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
            title="Create Reel / Story"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Vertical Navigation Arrow Floating Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 z-30 flex flex-col gap-2">
        <button
          type="button"
          onClick={handlePrevReel}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg transition-transform hover:scale-110 active:scale-95"
          title="Previous Reel"
        >
          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={handleNextReel}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-lg transition-transform hover:scale-110 active:scale-95"
          title="Next Reel"
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Video Stage */}
      <div
        onClick={togglePlayPause}
        className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black"
      >
        <video
          key={currentReel.videoUrl}
          ref={videoRef}
          src={currentReel.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onError={(e) => {
            if (e.target.src !== 'https://vjs.zencdn.net/v/oceans.mp4') {
              e.target.src = 'https://vjs.zencdn.net/v/oceans.mp4';
              e.target.play().catch(() => {});
            }
          }}
          className="w-full h-full object-cover"
        />

        {/* Gradient shadow overlays for UI readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Play/Pause center flash indicator */}
        {!isPlaying && (
          <div className="absolute p-5 rounded-full bg-black/60 text-white backdrop-blur-md animate-in zoom-in-75 duration-150">
            <Play className="w-10 h-10 fill-white" />
          </div>
        )}
      </div>

      {/* Right Side Vertical Action Buttons */}
      <div className="absolute right-3.5 bottom-16 z-30 flex flex-col items-center gap-5 text-white">
        {/* Like */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(activeReelIndex);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform group-hover:scale-110">
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {(currentReel.likesCount / 1000).toFixed(1)}K
          </span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform group-hover:scale-110">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-bold drop-shadow">{currentReel.commentsCount}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShareReel}
          className="flex flex-col items-center gap-1 group"
          title="Share Reel with followers"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-transform group-hover:scale-110 ${
            sharedState[activeReelIndex]
              ? 'bg-emerald-500/30 border border-emerald-400/60'
              : 'bg-black/40 hover:bg-black/60'
          }`}>
            <Share2 className={`w-6 h-6 ${ sharedState[activeReelIndex] ? 'text-emerald-400' : 'text-white' }`} />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {sharedState[activeReelIndex] ? 'Copied!' : currentReel.sharesCount}
          </span>
        </button>

        {/* Spinning Vinyl Audio Disc */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleNextReel();
          }}
          className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-900 p-1 flex items-center justify-center cursor-pointer animate-spin-slow shadow-xl hover:scale-110 transition-transform"
          title="Next Reel"
        >
          <img
            src={currentReel.creator.avatar}
            alt="music creator"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Creator Info & Caption Bar */}
      <div className="absolute left-4 right-16 bottom-4 z-30 text-white flex flex-col gap-2 pointer-events-auto">
        {/* Creator Row */}
        <div className="flex items-center gap-2.5">
          <img
            src={currentReel.creator.avatar}
            alt={currentReel.creator.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-lg"
          />
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-tight drop-shadow">
              @{currentReel.creator.username}
            </h3>
          </div>

          <button
            type="button"
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-[11px] border border-white/30 transition-all hover:scale-105"
          >
            Follow
          </button>
        </div>

        {/* Caption */}
        <p className="text-xs text-slate-200 line-clamp-2 drop-shadow font-medium">
          {currentReel.caption}
        </p>

        {/* Audio Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] text-slate-200 border border-white/10 w-fit drop-shadow">
          <Music className="w-3 h-3 text-pink-400 animate-pulse" />
          <span className="truncate max-w-[200px]">{currentReel.audioTitle}</span>
        </div>
      </div>

      {/* Slide-Up Comments Drawer */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-950/95 border-t border-slate-800 rounded-t-3xl p-4 flex flex-col gap-3 max-h-[60%] backdrop-blur-2xl animate-in slide-in-from-bottom duration-200 text-slate-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white">Comments ({commentsList.length})</h4>
            <button
              type="button"
              onClick={() => setShowComments(false)}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5 pr-1 max-h-48">
            {commentsList.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {c.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.author}</span>
                    <span className="text-[10px] text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReelsView;
