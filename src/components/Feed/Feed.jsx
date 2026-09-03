import React, { useEffect, useRef } from 'react';
import { Radio } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { StoriesBar } from '../Stories/StoriesBar';
import { PostCard } from './PostCard';

export const Feed = () => {
  const {
    feedMode,
    posts,
    activeStoryIndex,
    isReelsOpen,
    createStoryOpen,
    activeLiveStreams,
    watchLive,
  } = useSocial();
  const { tracks, playTrack, stopAudio, isPlaying, currentTrack } = useMusic();

  const userHasScrolledRef = useRef(false);

  // Sort posts based on feed mode
  const sortedPosts = [...posts].sort((a, b) => {
    if (feedMode === 'chronological') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    const scoreA =
      Object.values(a.reactions || {}).reduce((x, y) => x + y, 0) +
      (a.comments?.length || 0) * 2;
    const scoreB =
      Object.values(b.reactions || {}).reduce((x, y) => x + y, 0) +
      (b.comments?.length || 0) * 2;
    return scoreB - scoreA;
  });

  // Only auto-play when user actively scrolls into a post (never upon initial home page load)
  useEffect(() => {
    if (activeStoryIndex !== null || isReelsOpen || createStoryOpen) {
      return;
    }

    let scrollTimeout = null;

    const checkVisiblePostsOnScroll = () => {
      if (activeStoryIndex !== null || isReelsOpen || createStoryOpen) {
        return;
      }

      // If user is at the top of the home page (near stories), keep it quiet
      if (window.scrollY < 160) {
        if (isPlaying && activeStoryIndex === null) {
          stopAudio();
        }
        return;
      }

      const postElements = document.querySelectorAll('[data-post-music-id]');
      let foundTrack = null;

      const viewportHeight = window.innerHeight;
      const centerY = viewportHeight / 2;

      for (const el of postElements) {
        const musicId = el.getAttribute('data-post-music-id');
        if (!musicId) continue;

        const rect = el.getBoundingClientRect();
        // Post is centered in the active viewing area
        if (rect.top <= centerY + 100 && rect.bottom >= centerY - 100) {
          foundTrack = tracks.find((t) => t.id === musicId);
          break;
        }
      }

      if (foundTrack) {
        if (!isPlaying || currentTrack?.id !== foundTrack.id) {
          playTrack(foundTrack);
        }
      } else {
        if (isPlaying && activeStoryIndex === null && !createStoryOpen && !isReelsOpen) {
          stopAudio();
        }
      }
    };

    const handleScroll = () => {
      userHasScrolledRef.current = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkVisiblePostsOnScroll, 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [posts, tracks, activeStoryIndex, isReelsOpen, createStoryOpen, isPlaying, currentTrack?.id]);

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col gap-4 pb-24 select-none">
      {/* 24-Hour Stories Bar */}
      <StoriesBar />

      {/* Real-time Active Live Streams Tray */}
      {activeLiveStreams && activeLiveStreams.length > 0 && (
        <div className="mx-2 p-3 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-purple-950/50 border border-red-500/40 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeLiveStreams[0].broadcasterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'}
                alt={activeLiveStreams[0].broadcasterName}
                className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shadow-md ring-2 ring-red-500/30 ring-offset-2 ring-offset-slate-900 animate-pulse"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-red-600 rounded-md text-[8px] font-black text-white uppercase tracking-wider">
                LIVE
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{activeLiveStreams[0].broadcasterName}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Broadcasting Now
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-[180px] sm:max-w-xs">
                {activeLiveStreams[0].title || 'Live Stream Session'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => watchLive(activeLiveStreams[0])}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Watch Live</span>
          </button>
        </div>
      )}

      {/* Posts Stream matching Screen 2 of Mockup */}
      <div className="flex flex-col gap-4">
        {sortedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
