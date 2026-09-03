import React, { useState } from 'react';
import {
  X,
  Search,
  User,
  Music,
  Users,
  FileText,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { PostCard } from '../Feed/PostCard';

export const GlobalSearchModal = () => {
  const {
    searchQuery,
    setSearchQuery,
    isSearchActive,
    setIsSearchActive,
    friends,
    posts,
    groups,
    pages,
    setIsProfileOpen,
    setProfileUserId,
    setIsGroupsOpen,
  } = useSocial();

  const { tracks, togglePlay, currentTrack, isPlaying } = useMusic();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'people' | 'music' | 'posts' | 'groups'

  if (!isSearchActive || !searchQuery.trim()) return null;

  const q = searchQuery.toLowerCase();

  // Search Results
  const matchedPeople = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.username.toLowerCase().includes(q) ||
      (f.hometown && f.hometown.toLowerCase().includes(q))
  );

  const matchedSongs = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.movie.toLowerCase().includes(q) ||
      t.singers.toLowerCase().includes(q) ||
      t.musicDirector.toLowerCase().includes(q) ||
      t.language.toLowerCase().includes(q)
  );

  const matchedPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      (p.location && p.location.toLowerCase().includes(q))
  );

  const matchedGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-3 sm:px-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-blue-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across LinkUp..."
              className="w-full bg-transparent text-sm text-white focus:outline-none"
              autoFocus
            />
          </div>

          <button
            onClick={() => setIsSearchActive(false)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-4 flex items-center gap-2 border-b border-slate-800 text-xs font-bold overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'music'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Regional Songs ({matchedSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'people'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            People ({matchedPeople.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Posts ({matchedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'groups'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Groups ({matchedGroups.length})
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar">
          {/* Songs Results */}
          {(activeTab === 'all' || activeTab === 'music') && matchedSongs.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                <span>Kannada, Telugu, Tamil Songs</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedSongs.map((track) => {
                  const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => togglePlay(track)}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-purple-950/40 border border-purple-500/20 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                        <p className="text-[10px] text-slate-300 truncate">
                          {track.movie} • {track.language.toUpperCase()}
                        </p>
                      </div>
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 text-pink-400" />
                      ) : (
                        <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* People Results */}
          {(activeTab === 'all' || activeTab === 'people') && matchedPeople.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>People</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedPeople.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => {
                      setProfileUserId(person.id);
                      setIsProfileOpen(true);
                      setIsSearchActive(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">{person.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">
                        @{person.username} • {person.hometown}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {(activeTab === 'all' || activeTab === 'posts') && matchedPosts.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Posts</span>
              </h4>
              {matchedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Groups Results */}
          {(activeTab === 'all' || activeTab === 'groups') && matchedGroups.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Groups & Communities</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      setIsGroupsOpen(true);
                      setIsSearchActive(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={group.cover}
                      alt={group.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">{group.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{group.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
