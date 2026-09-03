import React, { useState } from 'react';
import {
  Search,
  Users,
  Film,
  Tag,
  Sparkles,
  Heart,
  Play,
  Grid,
  TrendingUp,
  ChevronRight,
  X,
  MessageCircle,
  UserPlus,
  Check,
  Copy,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from '../Feed/PostCard';

export const ExploreView = () => {
  const {
    friends,
    posts,
    reels,
    toggleFollowFriend,
    searchCategory,
    setSearchCategory,
    setActiveTab,
    openChatWithUser,
  } = useSocial();
  const { searchRegisteredUsers, user: authUser } = useAuth();

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [followedIds, setFollowedIds] = useState({});

  // Removed Groups option
  const CATEGORIES = ['All', 'People', 'Posts', 'Reels', 'Tags'];

  // Trending Hashtags Data
  const TRENDING_TAGS = [
    { tag: '#DSA', keyword: 'dsa', postsCount: '24.5K', category: 'Technology' },
    { tag: '#Karnataka', keyword: 'karnataka', postsCount: '18.2K', category: 'Travel & Nature' },
    { tag: '#Java', keyword: 'java', postsCount: '15.7K', category: 'Coding & Backend' },
    { tag: '#Bangalore', keyword: 'bangalore', postsCount: '32.1K', category: 'City Life' },
    { tag: '#Mountains', keyword: 'mountains', postsCount: '12.8K', category: 'Adventure' },
    { tag: '#Hackathon2026', keyword: 'hackathon', postsCount: '8.4K', category: 'Events & Prizes' },
    { tag: '#FullStack', keyword: 'fullstack', postsCount: '14.1K', category: 'Web Dev' },
  ];

  const cleanQuery = query.replace(/^#/, '').toLowerCase().trim();

  // Real-time lookup of registered accounts across the LinkUp network + friends
  const registeredMatches = searchRegisteredUsers(cleanQuery).filter(
    (u) => !authUser || u.id !== authUser.id
  );

  const combinedPeople = [
    ...registeredMatches.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      linkupId: u.linkupId || 'LK-NEW',
      avatar: u.avatar,
      isRegisteredUser: true,
      isFollowing: false,
    })),
    ...friends.filter(
      (f) =>
        (!cleanQuery ||
          f.name.toLowerCase().includes(cleanQuery) ||
          f.username.toLowerCase().includes(cleanQuery) ||
          (f.linkupId && f.linkupId.toLowerCase().includes(cleanQuery))) &&
        !registeredMatches.some((r) => r.username?.toLowerCase() === f.username?.toLowerCase())
    ),
  ];

  const filteredPosts = posts.filter((p) => {
    if (selectedTag) {
      const tagKw = selectedTag.keyword || selectedTag.tag.replace(/^#/, '').toLowerCase();
      return (
        p.content.toLowerCase().includes(tagKw) ||
        (p.location && p.location.toLowerCase().includes(tagKw))
      );
    }
    if (!cleanQuery) return true;
    return (
      p.content.toLowerCase().includes(cleanQuery) ||
      p.author.name.toLowerCase().includes(cleanQuery) ||
      (p.location && p.location.toLowerCase().includes(cleanQuery))
    );
  });

  const filteredReels = reels.filter((r) => {
    if (selectedTag) {
      const tagKw = selectedTag.keyword || selectedTag.tag.replace(/^#/, '').toLowerCase();
      return r.caption.toLowerCase().includes(tagKw);
    }
    if (!cleanQuery) return true;
    return (
      r.caption.toLowerCase().includes(cleanQuery) ||
      r.creator.name.toLowerCase().includes(cleanQuery) ||
      r.creator.username.toLowerCase().includes(cleanQuery)
    );
  });

  const filteredTags = TRENDING_TAGS.filter(
    (t) =>
      !cleanQuery ||
      t.tag.toLowerCase().includes(cleanQuery) ||
      t.category.toLowerCase().includes(cleanQuery)
  );

  const handleTagClick = (tagItem) => {
    setSelectedTag(tagItem);
    setQuery(tagItem.tag);
  };

  const handleClearTagFilter = () => {
    setSelectedTag(null);
    setQuery('');
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-20 select-none text-slate-100 animate-in fade-in duration-200">
      {/* Dedicated "Connect & Follow by LinkUp ID" Card */}
      <div className="mx-2 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/40 shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-black text-xs">
              ID
            </div>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Enter LinkUp ID to Follow</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-400">
                Type or paste a friend's ID (e.g. <span className="text-purple-300 font-mono">LK-58492</span>) to follow & chat
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
            Real-time
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedTag && !e.target.value) setSelectedTag(null);
              }}
              placeholder="Paste or type LinkUp ID (e.g. LK-12345)..."
              className="w-full pl-8 pr-8 py-2 bg-slate-900/90 border border-purple-500/40 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearTagFilter}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* General Search Input Bar */}
      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedTag && !e.target.value) setSelectedTag(null);
            }}
            placeholder="Search all: LinkUp ID, username, posts, or tags (#DSA)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearTagFilter}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Tag Filter Pill (if selected) */}
      {selectedTag && (
        <div className="mx-2 p-2.5 rounded-2xl bg-gradient-to-r from-pink-950/50 via-purple-950/40 to-slate-900 border border-pink-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white mr-1.5">{selectedTag.tag}</span>
              <span className="text-[10px] text-pink-300 font-semibold">• {selectedTag.postsCount} posts</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearTagFilter}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
          >
            <span>Clear filter</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSearchCategory(cat);
              if (cat !== 'Tags' && cat !== 'Posts') setSelectedTag(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              searchCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TRENDING TAGS SECTION */}
      {(searchCategory === 'All' || searchCategory === 'Tags') && (
        <div className="flex flex-col gap-2.5 px-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span>Trending Tags</span>
            </h3>
            {searchCategory === 'All' && (
              <button
                type="button"
                onClick={() => setSearchCategory('Tags')}
                className="text-xs font-bold text-pink-400 hover:text-pink-300"
              >
                See all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredTags.map((item) => (
              <div
                key={item.tag}
                onClick={() => handleTagClick(item)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all group ${
                  selectedTag?.tag === item.tag
                    ? 'bg-pink-950/40 border-pink-500 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-pink-500/50 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                      {item.tag}
                    </h4>
                    <p className="text-[10px] text-slate-400">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <span>{item.postsCount}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POSTS SECTION */}
      {(searchCategory === 'All' || searchCategory === 'Posts' || searchCategory === 'Tags') && (
        <div className="flex flex-col gap-3 px-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-emerald-400" />
              <span>
                {selectedTag ? `Posts tagged with ${selectedTag.tag}` : 'Posts'}
              </span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">{filteredPosts.length} results</span>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800/60">
              No posts found for "{query || selectedTag?.tag}".
            </div>
          )}
        </div>
      )}

      {/* REELS SECTION */}
      {(searchCategory === 'All' || searchCategory === 'Reels') && (
        <div className="flex flex-col gap-2.5 px-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-purple-400" />
              <span>Explore Reels</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('reels')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              Watch Reels
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredReels.map((reel) => (
              <div
                key={reel.id}
                onClick={() => setActiveTab('reels')}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black cursor-pointer group border border-slate-800 hover:border-purple-500 transition-all shadow-lg"
              >
                <video
                  src={reel.videoUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Play badge */}
                <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>

                {/* Bottom stats & creator */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={reel.creator.avatar}
                      alt={reel.creator.name}
                      className="w-5 h-5 rounded-full object-cover border border-white/60"
                    />
                    <span className="text-[10px] font-bold truncate drop-shadow">{reel.creator.username}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-300 drop-shadow">
                    <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    <span>{(reel.likesCount / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PEOPLE SECTION */}
      {(searchCategory === 'All' || searchCategory === 'People') && (
        <div className="flex flex-col gap-2.5 px-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span>People</span>
            </h3>
            {searchCategory === 'All' && (
              <button
                type="button"
                onClick={() => setSearchCategory('People')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                See all
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {combinedPeople.slice(0, searchCategory === 'All' ? 5 : 30).map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-colors gap-2"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={person.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'}
                    alt={person.name}
                    className="w-11 h-11 rounded-full object-cover border border-purple-500/40 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate">{person.name}</h4>
                      {person.linkupId && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300">
                          {person.linkupId}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">@{person.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openChatWithUser(person)}
                    className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                    title="Send Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleFollowFriend(person.id);
                      setFollowedIds((prev) => ({ ...prev, [person.id]: !prev[person.id] }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      person.isFollowing || followedIds[person.id]
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
                    }`}
                  >
                    {person.isFollowing || followedIds[person.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreView;
