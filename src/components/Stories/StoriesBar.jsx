import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const StoriesBar = () => {
  const { stories, setCreateStoryOpen, setActiveStoryIndex, activeLiveStreams, watchLive } = useSocial();
  const { user: authUser } = useAuth();

  const user = authUser || CURRENT_USER;

  // Check if current user has an uploaded story
  const myStoryIndex = (stories || []).findIndex((s) => {
    if (!s || s.id === 'story-01' || s.user?.name === 'Your Story') return false;
    return Boolean(
      authUser && (
        (authUser.id && s.user?.id === authUser.id) ||
        (authUser.username && s.user?.username && s.user.username.toLowerCase() === authUser.username.toLowerCase())
      )
    );
  });
  const hasMyStory = myStoryIndex >= 0;

  const uniqueLiveStreams = useMemo(() => {
    const map = new Map();
    (activeLiveStreams || []).forEach((s) => {
      // Don't show current broadcaster's own live stream in their own StoriesBar
      const isSelf = Boolean(
        authUser && (
          (s.broadcasterId && s.broadcasterId === authUser.id) ||
          (s.broadcasterUsername && authUser.username && s.broadcasterUsername.toLowerCase() === authUser.username.toLowerCase())
        )
      );
      if (isSelf) return;

      const key = (s.broadcasterId || s.broadcasterUsername || s.id || '').toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, s);
      }
    });
    return Array.from(map.values());
  }, [activeLiveStreams, authUser]);

  const uniqueFriendsStories = useMemo(() => {
    const map = new Map();
    (stories || []).forEach((story, actualIdx) => {
      if (!story || story.id === 'story-01' || story.user?.name === 'Your Story') return;
      const sUser = story.user || {};
      const uName = (sUser.username || '').toLowerCase();
      const nName = (sUser.name || '').toLowerCase();
      const uId = (sUser.id || '').toLowerCase();
      if (
        story.id === 'story-1788501813453' ||
        uName.includes('ameensab') ||
        nName.includes('ameensab') ||
        uId === 'google-1788494183669'
      ) {
        return;
      }

      // Only hide from friends list if this story was explicitly posted by the current logged-in user
      const isMine = Boolean(
        authUser && (
          (authUser.id && story.user?.id === authUser.id) ||
          (authUser.username && story.user?.username && story.user.username.toLowerCase() === authUser.username.toLowerCase())
        )
      );

      if (isMine) return;

      const key = (story.user?.id || story.user?.username || story.id || '').toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, { story, actualIdx });
      }
    });
    return Array.from(map.values());
  }, [stories, authUser]);

  return (
    <div className="w-full flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1 select-none">
      {/* Your Story item */}
      <div
        onClick={() => {
          if (hasMyStory) {
            setActiveStoryIndex(myStoryIndex);
          } else {
            setCreateStoryOpen(true);
          }
        }}
        className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
        title={hasMyStory ? 'View Your Story (Click + to add new)' : 'Add Story'}
      >
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-full p-[2.5px] transition-all group-hover:scale-105 ${
              hasMyStory
                ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 shadow-lg shadow-purple-500/30'
                : 'border-2 border-dashed border-slate-700 group-hover:border-purple-500'
            }`}
          >
            <div className="w-full h-full rounded-full p-[1.5px] bg-[#090C15]">
              <img
                src={user.avatar || CURRENT_USER.avatar}
                alt={user.name || CURRENT_USER.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Plus icon badge */}
          <div
            onClick={(e) => {
              if (hasMyStory) {
                e.stopPropagation();
                setCreateStoryOpen(true);
              }
            }}
            className="absolute bottom-0 right-0 p-1 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white border-2 border-[#090C15] shadow-md hover:scale-110 active:scale-95 transition-transform"
            title="Create new story"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </div>
        </div>
        <span
          className={`text-[11px] font-medium truncate max-w-[68px] ${
            hasMyStory ? 'text-purple-300 font-bold' : 'text-slate-300'
          }`}
        >
          {hasMyStory ? 'Your Story' : 'Add Story'}
        </span>
      </div>

      {/* Active Live Broadcasts with Pulsing Red Rings */}
      {uniqueLiveStreams.map((stream) => (
        <div
          key={stream.id || stream.broadcasterId}
          onClick={() => watchLive(stream)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group animate-in fade-in"
          title={`Watch ${stream.broadcasterName} Live`}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-lg shadow-red-600/40 group-hover:scale-105 transition-transform animate-pulse">
              <div className="w-full h-full rounded-full p-[2px] bg-[#090C15]">
                <img
                  src={
                    stream.broadcasterAvatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
                  }
                  alt={stream.broadcasterName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-red-600 text-[8px] font-black text-white border border-[#090C15] uppercase tracking-wider animate-pulse shadow-md">
              LIVE
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-red-400 truncate max-w-[68px]">
            {stream.broadcasterName}
          </span>
        </div>
      ))}

      {/* Friends Stories with Gradient Rings */}
      {uniqueFriendsStories.map(({ story, actualIdx }, idx) => {
        const rings = [
          'from-purple-500 via-pink-500 to-amber-500',
          'from-pink-500 via-rose-500 to-yellow-500',
          'from-blue-500 via-indigo-500 to-purple-500',
          'from-emerald-500 via-teal-500 to-cyan-500',
        ];
        const ring = rings[idx % rings.length];

        return (
          <div
            key={story.id}
            onClick={() => setActiveStoryIndex(actualIdx)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr ${ring} shadow-md group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full rounded-full p-[2px] bg-[#090C15]">
                <img
                  src={story.user?.avatar}
                  alt={story.user?.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[65px]">
              {story.user?.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StoriesBar;
