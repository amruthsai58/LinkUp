import React from 'react';
import { Plus } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const StoriesBar = () => {
  const { stories, setCreateStoryOpen, setActiveStoryIndex } = useSocial();
  const { user: authUser } = useAuth();

  const user = authUser || CURRENT_USER;

  return (
    <div className="w-full flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1 select-none">
      {/* Your Story (Create Story) */}
      <div
        onClick={() => setCreateStoryOpen(true)}
        className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full p-0.5 border-2 border-slate-700 group-hover:border-purple-500 transition-colors">
            <img
              src={user.avatar || CURRENT_USER.avatar}
              alt={user.name || CURRENT_USER.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 p-1 rounded-full bg-blue-600 text-white border-2 border-[#090C15] shadow-md group-hover:scale-110 transition-transform">
            <Plus className="w-3 h-3 stroke-[3]" />
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-300">Your Story</span>
      </div>

      {/* Friends Stories with Gradient Rings */}
      {stories.slice(1).map((story, idx) => {
        // gradient ring colors
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
            onClick={() => setActiveStoryIndex(idx + 1)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr ${ring} shadow-md group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full rounded-full p-[2px] bg-[#090C15]">
                <img
                  src={story.user.avatar}
                  alt={story.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[65px]">
              {story.user.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StoriesBar;
