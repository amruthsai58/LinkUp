import React, { useEffect, useRef } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { StoriesBar } from '../Stories/StoriesBar';
import { PostCard } from './PostCard';

export const Feed = () => {
  const { feedMode, posts, activeStoryIndex, isReelsOpen, createStoryOpen } = useSocial();
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
