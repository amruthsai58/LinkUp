import React, { useEffect, useRef, useMemo } from 'react';
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

  // Deduplicate and sort posts
  const sortedPosts = useMemo(() => {
    const map = new Map();
    (posts || []).forEach((p) => {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values()).sort((a, b) => {
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
  }, [posts, feedMode]);

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
        <div className="flex flex-col gap-2 mx-1">
          {activeLiveStreams.map((stream) => (
            <div
              key={stream.id || stream.broadcasterId}
              className="p-3 rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-purple-950/60 border border-red-500/40 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300"
            >
              <div
                onClick={() => watchLive(stream)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2 group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-md animate-pulse">
                    <img
                      src={
                        stream.broadcasterAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
                      }
                      alt={stream.broadcasterName}
                      className="w-full h-full rounded-full object-cover border border-[#090C15]"
                    />
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-red-600 rounded-md text-[8px] font-black text-white uppercase tracking-wider">
                    LIVE
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white group-hover:text-red-300 transition-colors truncate">
                      {stream.broadcasterName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-extrabold flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      Broadcasting Now
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs">
                    {stream.title || 'Live Stream Session'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => watchLive(stream)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Watch Live</span>
              </button>
            </div>
          ))}
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
