import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Search,
  User,
  Music,
  FileText,
  Play,
  Pause,
  MessageCircle,
  UserPlus,
  Check,
  Sparkles,
  Radio,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { realtime } from '../../services/realtimeService';
import { PostCard } from '../Feed/PostCard';

export const GlobalSearchModal = () => {
  const {
    searchQuery,
    setSearchQuery,
    isSearchActive,
    setIsSearchActive,
    friends,
    posts,
    viewUserProfile,
    openChatWithUser,
    toggleFollowFriend,
    activeLiveStreams,
    watchLive,
  } = useSocial();

  const { user: authUser } = useAuth();
  const { tracks, togglePlay, currentTrack, isPlaying } = useMusic();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'people' | 'music' | 'posts'
  const inputRef = useRef(null);

  // Auto-focus input whenever the search modal opens
  useEffect(() => {
    if (isSearchActive) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchActive]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchActive(false);
      }
    };
    if (isSearchActive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive, setIsSearchActive]);

  // Combined cloud registered users + mock friends
  const allPeople = useMemo(() => {
    const map = new Map();
    const add = (p) => {
      if (!p) return;
      const key = (p.linkupId || p.username || p.id || '').toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, p);
      }
    };

    // Add registered cloud users
    try {
      const reg = realtime.getRegisteredUsers();
      (reg || []).forEach((u) => {
        add({
          id: u.id || `reg-${u.username}`,
          name: u.name || u.username,
          username: u.username,
          linkupId: u.linkupId || 'LK-NET',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          role: u.bio || 'LinkUp Member',
          isFriend: false,
          isFollowing: false,
        });
      });
    } catch {}

    // Add mock friends
    (friends || []).forEach(add);

    return Array.from(map.values());
  }, [friends]);

  if (!isSearchActive) return null;

  const q = (searchQuery || '').trim().toLowerCase();
  const cleanQ = q.replace(/[^a-z0-9]/g, '');

  // Matching People by Name, Username, or LinkUp ID
  const matchedPeople = q
    ? allPeople.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const username = (p.username || '').toLowerCase();
        const linkupId = (p.linkupId || '').toLowerCase();
        const cleanId = linkupId.replace(/[^a-z0-9]/g, '');

        return (
          name.includes(q) ||
          username.includes(q) ||
          linkupId.includes(q) ||
          (cleanQ && cleanId.includes(cleanQ))
        );
      })
    : [];

  // Matching Regional Songs (105 Tracks)
  const matchedSongs = q
    ? (tracks || []).filter((t) => {
        const title = (t.title || '').toLowerCase();
        const movie = (t.movie || '').toLowerCase();
        const singers = (t.singers || '').toLowerCase();
        const director = (t.musicDirector || '').toLowerCase();
        const lang = (t.language || '').toLowerCase();

        return (
          title.includes(q) ||
          movie.includes(q) ||
          singers.includes(q) ||
          director.includes(q) ||
          lang.includes(q)
        );
      })
    : [];

  // Matching Posts
  const matchedPosts = q
    ? (posts || []).filter((p) => {
        const content = (p.content || '').toLowerCase();
        const author = (p.author?.name || '').toLowerCase();
        const location = (p.location || '').toLowerCase();

        return content.includes(q) || author.includes(q) || location.includes(q);
      })
    : [];

  const handleSelectUser = (person) => {
    setIsSearchActive(false);
    viewUserProfile(person);
  };

  const handleOpenChat = (person) => {
    setIsSearchActive(false);
    openChatWithUser(person);
  };

  return (
    <div
      onClick={() => setIsSearchActive(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85dvh] bg-[#0A0D18] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Search Header Bar with Auto-Focused Input */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search LinkUp ID (e.g. LK-20481), name, or song..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSearchActive(false)}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Tab Filters Bar (When query is active) */}
        {q && (
          <div className="px-3 sm:px-4 flex items-center gap-2 border-b border-slate-800/80 text-xs font-bold overflow-x-auto no-scrollbar py-2 bg-slate-900/30">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Results
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('people')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'people'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              People & IDs ({matchedPeople.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('music')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'music'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Songs ({matchedSongs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'posts'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Posts ({matchedPosts.length})
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 flex flex-col gap-4 no-scrollbar">
          {/* Empty State: Quick Suggestions */}
          {!q && (
            <div className="flex flex-col gap-4 py-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-400 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Popular LinkUp IDs</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['LK-20481', 'LK-10928', 'LK-55019', 'LK-33921', 'LK-88210'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSearchQuery(id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all hover:scale-105"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-400 uppercase tracking-wider mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trending Regional Hits</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(tracks || []).slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => togglePlay(t)}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/40 border border-slate-800 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img src={t.coverUrl} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white truncate">{t.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{t.movie} • {t.language.toUpperCase()}</p>
                      </div>
                      <div className="p-1.5 rounded-full bg-purple-600/30 text-purple-300">
                        {isPlaying && currentTrack?.id === t.id ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-purple-300 ml-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results State */}
          {q && (
            <>
              {/* People Results */}
              {(activeTab === 'all' || activeTab === 'people') && matchedPeople.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>People & IDs ({matchedPeople.length})</span>
                  </h4>
                  <div className="flex flex-col gap-2">
                    {matchedPeople.map((person) => {
                      const isLive = activeLiveStreams?.some(
                        (s) =>
                          s.broadcasterId === person.id ||
                          s.broadcasterId === person.linkupId ||
                          (s.broadcasterUsername && person.username && s.broadcasterUsername.toLowerCase() === person.username.toLowerCase())
                      );
                      const liveStreamObj = activeLiveStreams?.find(
                        (s) => s.broadcasterId === person.id || s.broadcasterId === person.linkupId
                      );

                      return (
                        <div
                          key={person.id}
                          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 flex items-center justify-between gap-3 transition-all"
                        >
                          <div
                            onClick={() => handleSelectUser(person)}
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={person.avatar}
                                alt={person.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-700 group-hover:border-purple-500 transition-colors"
                              />
                              {isLive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-red-600 rounded text-[7px] font-black text-white uppercase animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                  {person.name}
                                </h5>
                                {person.linkupId && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-purple-950 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300">
                                    {person.linkupId}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">@{person.username}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isLive && liveStreamObj && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSearchActive(false);
                                  watchLive(liveStreamObj);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 animate-pulse shadow-md"
                              >
                                <Radio className="w-3 h-3" />
                                <span>Live</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenChat(person)}
                              className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-colors"
                              title="Send Direct Message"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectUser(person)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                            >
                              Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Songs Results */}
              {(activeTab === 'all' || activeTab === 'music') && matchedSongs.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>Regional Music ({matchedSongs.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedSongs.map((track) => {
                      const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => togglePlay(track)}
                          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/40 border border-slate-800 flex items-center gap-3 cursor-pointer transition-colors"
                        >
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                            <p className="text-[10px] text-slate-400 truncate">
                              {track.movie} • {track.language.toUpperCase()}
                            </p>
                          </div>
                          <div className="p-1.5 rounded-full bg-purple-600/30 text-purple-300">
                            {isThisPlaying ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-purple-300 ml-0.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {(activeTab === 'all' || activeTab === 'posts') && matchedPosts.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Posts ({matchedPosts.length})</span>
                  </h4>
                  {matchedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {/* No Results Found */}
              {matchedPeople.length === 0 && matchedSongs.length === 0 && matchedPosts.length === 0 && (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-slate-600" />
                  <p className="text-sm font-bold text-slate-300">No results found for "{searchQuery}"</p>
                  <p className="text-xs text-slate-500">
                    Try searching with a LinkUp ID (e.g. LK-20481), friend name, or regional song title.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
