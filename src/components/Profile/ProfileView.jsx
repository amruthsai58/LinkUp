import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  Menu,
  UserPlus,
  Grid,
  Film,
  Tag,
  Share2,
  Bookmark,
  Plus,
  Edit2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Check,
  Radio,
  MessageCircle,
  Users,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER, INITIAL_FRIENDS } from '../../data/mockSocialData';
import { realtime } from '../../services/realtimeService';
import { EditProfileModal } from './EditProfileModal';
import { HighlightViewerModal } from './HighlightViewerModal';
import { CreateHighlightModal } from './CreateHighlightModal';
import { EditHighlightModal } from './EditHighlightModal';
import { FollowersModal } from './FollowersModal';

export const ProfileView = () => {
  const {
    setActiveTab,
    viewingUser,
    setViewingUser,
    viewUserProfile,
    toggleFollowFriend,
    friends,
    setFriends,
    posts,
    openChatWithUser,
    activeLiveStreams,
    watchLive,
  } = useSocial();
  const { user: authUser, updateUserProfile } = useAuth();
  const [activeTabSub, setActiveTabSub] = useState('grid'); // 'grid' | 'reels' | 'tagged'

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [isCreateHighlightOpen, setIsCreateHighlightOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [contextMenuHlId, setContextMenuHlId] = useState(null);
  const [idCopied, setIdCopied] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState('followers'); // 'followers' | 'following'

  // Check if viewing own profile or friend's profile
  const isMyProfile = !viewingUser || (authUser && (
    (viewingUser.username && authUser.username && viewingUser.username.toLowerCase() === authUser.username.toLowerCase()) ||
    (viewingUser.linkupId && authUser.linkupId && viewingUser.linkupId.toLowerCase() === authUser.linkupId.toLowerCase()) ||
    viewingUser.id === authUser.id
  ));

  const user = isMyProfile ? (authUser || CURRENT_USER) : viewingUser;
  const highlights = user.highlights || CURRENT_USER.highlights || [];

  // Persistent following state
  const [followedUsers, setFollowedUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkup_following_usernames') || '{}');
    } catch {
      return {};
    }
  });

  const isFriendFollowed = Boolean(
    followedUsers[user.username?.toLowerCase()] ||
    followedUsers[user.linkupId?.toLowerCase()] ||
    followedUsers[user.id] ||
    user.isFollowing ||
    friends.some(
      (f) =>
        ((f.username && user.username && f.username.toLowerCase() === user.username.toLowerCase()) ||
         (f.linkupId && user.linkupId && f.linkupId.toLowerCase() === user.linkupId.toLowerCase()) ||
         f.id === user.id) &&
        (f.isFollowing || f.isFriend)
    )
  );

  const handleToggleFollow = () => {
    toggleFollowFriend(user);
    const nextState = !isFriendFollowed;
    const updated = {
      ...followedUsers,
      [user.username?.toLowerCase()]: nextState,
      [user.linkupId?.toLowerCase()]: nextState,
      [user.id]: nextState,
    };
    setFollowedUsers(updated);
    try {
      localStorage.setItem('linkup_following_usernames', JSON.stringify(updated));
    } catch {}
  };

  // 1. Dynamic Posts Calculation
  const myPosts = posts.filter(
    (p) =>
      p.author?.id === user.id ||
      (p.author?.username && user.username && p.author.username.toLowerCase() === user.username.toLowerCase()) ||
      (authUser && p.author?.username && p.author.username.toLowerCase() === authUser.username?.toLowerCase())
  );
  const friendPosts = posts.filter(
    (p) => p.author?.username && user.username && p.author.username.toLowerCase() === user.username.toLowerCase()
  );
  const displayedPostsCount = isMyProfile
    ? myPosts.length
    : (friendPosts.length > 0 ? friendPosts.length : (user.postsCount ?? 0));

  // 2. Dynamic Followers & Following Lists for Modal
  const followersList = useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (u) => {
      if (!u) return;
      const uKey = u.username ? u.username.toLowerCase() : null;
      const lKey = u.linkupId ? u.linkupId.toLowerCase() : null;
      const idKey = u.id ? String(u.id).toLowerCase() : null;

      if ((uKey && seen.has(uKey)) || (lKey && seen.has(lKey)) || (idKey && seen.has(idKey))) {
        return;
      }
      if (uKey) seen.add(uKey);
      if (lKey) seen.add(lKey);
      if (idKey) seen.add(idKey);
      list.push(u);
    };

    if (isMyProfile) {
      // Confirmed friends and incoming requests
      friends
        .filter((f) => f.isFriend || f.hasPendingRequest)
        .forEach((f) => {
          add({
            id: f.id,
            name: f.name,
            username: f.username,
            linkupId: f.linkupId,
            avatar: f.avatar,
            role: f.role || f.hometown ? `From ${f.hometown}` : 'LinkUp Friend',
            status: f.status || 'online',
            isFriend: f.isFriend,
            isFollowing: Boolean(followedUsers[f.username?.toLowerCase()] || f.isFollowing),
          });
        });

      // Cloud friend requests
      try {
        const cloudReqs = JSON.parse(localStorage.getItem('linkup_cloud_friend_requests') || '[]');
        cloudReqs.forEach((r) => {
          add({
            id: r.senderId || `user-${r.senderUsername}`,
            name: r.senderName || r.senderUsername,
            username: r.senderUsername,
            linkupId: r.senderLinkUpId || 'LK-CLOUD',
            avatar: r.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            role: 'Cloud Connected',
            status: 'online',
            isFriend: true,
            isFollowing: Boolean(followedUsers[r.senderUsername?.toLowerCase()]),
          });
        });
      } catch {}

      // Registered cloud network users
      try {
        const regUsers = realtime.getRegisteredUsers();
        regUsers.forEach((ru) => {
          if (
            ru.username &&
            ru.username.toLowerCase() !== authUser?.username?.toLowerCase() &&
            ru.username.toLowerCase() !== CURRENT_USER.username.toLowerCase()
          ) {
            add({
              id: ru.id || `reg-${ru.username}`,
              name: ru.name || ru.username,
              username: ru.username,
              linkupId: ru.linkupId || 'LK-NET',
              avatar: ru.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              role: ru.role || ru.bio || 'LinkUp Member',
              status: 'online',
              isFriend: false,
              isFollowing: Boolean(followedUsers[ru.username?.toLowerCase()]),
            });
          }
        });
      } catch {}

      // Initial friends fallback
      INITIAL_FRIENDS.forEach((f) => {
        if (f.isFriend) {
          add({
            id: f.id,
            name: f.name,
            username: f.username,
            linkupId: f.linkupId,
            avatar: f.avatar,
            role: f.hometown ? `From ${f.hometown}` : 'LinkUp Member',
            status: f.status || 'online',
            isFriend: true,
            isFollowing: Boolean(followedUsers[f.username?.toLowerCase()] || f.isFollowing),
          });
        }
      });

      return list;
    } else {
      // Friend's profile followers list
      if (isFriendFollowed) {
        add({
          id: authUser?.id || 'me',
          name: authUser?.name || CURRENT_USER.name,
          username: authUser?.username || CURRENT_USER.username,
          linkupId: authUser?.linkupId || CURRENT_USER.linkupId,
          avatar: authUser?.avatar || CURRENT_USER.avatar,
          role: 'You',
          status: 'online',
          isMe: true,
        });
      }

      INITIAL_FRIENDS.filter(
        (f) => f.username?.toLowerCase() !== user.username?.toLowerCase()
      ).forEach((f) => {
        add({
          id: f.id,
          name: f.name,
          username: f.username,
          linkupId: f.linkupId,
          avatar: f.avatar,
          role: f.hometown ? `From ${f.hometown}` : 'Mutual Connection',
          status: f.status || 'online',
          isFollowing: Boolean(followedUsers[f.username?.toLowerCase()]),
        });
      });

      return list;
    }
  }, [isMyProfile, friends, authUser, followedUsers, user, isFriendFollowed]);

  const followingList = useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (u) => {
      if (!u) return;
      const uKey = u.username ? u.username.toLowerCase() : null;
      const lKey = u.linkupId ? u.linkupId.toLowerCase() : null;
      const idKey = u.id ? String(u.id).toLowerCase() : null;

      if ((uKey && seen.has(uKey)) || (lKey && seen.has(lKey)) || (idKey && seen.has(idKey))) {
        return;
      }
      if (uKey) seen.add(uKey);
      if (lKey) seen.add(lKey);
      if (idKey) seen.add(idKey);
      list.push(u);
    };

    if (isMyProfile) {
      // Friends marked isFollowing
      friends
        .filter((f) => f.isFollowing)
        .forEach((f) => {
          add({
            id: f.id,
            name: f.name,
            username: f.username,
            linkupId: f.linkupId,
            avatar: f.avatar,
            role: f.role || f.hometown || 'Following',
            status: f.status || 'online',
            isFollowing: true,
          });
        });

      // All keys from followedUsers
      Object.keys(followedUsers).forEach((key) => {
        if (!followedUsers[key]) return;
        const lowKey = key.toLowerCase();
        if (
          lowKey === authUser?.username?.toLowerCase() ||
          lowKey === authUser?.linkupId?.toLowerCase()
        ) {
          return;
        }

        const matchedFriend =
          friends.find(
            (f) =>
              f.username?.toLowerCase() === lowKey ||
              f.linkupId?.toLowerCase() === lowKey ||
              f.id === key
          ) ||
          INITIAL_FRIENDS.find(
            (f) =>
              f.username?.toLowerCase() === lowKey ||
              f.linkupId?.toLowerCase() === lowKey ||
              f.id === key
          );

        if (matchedFriend) {
          add({
            id: matchedFriend.id,
            name: matchedFriend.name,
            username: matchedFriend.username,
            linkupId: matchedFriend.linkupId,
            avatar: matchedFriend.avatar,
            role: matchedFriend.role || matchedFriend.hometown || 'Following',
            status: matchedFriend.status || 'online',
            isFollowing: true,
          });
        } else {
          let regUser = null;
          try {
            regUser = realtime
              .getRegisteredUsers()
              .find(
                (ru) =>
                  ru.username?.toLowerCase() === lowKey ||
                  ru.linkupId?.toLowerCase() === lowKey
              );
          } catch {}

          if (regUser) {
            add({
              id: regUser.id || `reg-${regUser.username}`,
              name: regUser.name || regUser.username,
              username: regUser.username,
              linkupId: regUser.linkupId || 'LK-NET',
              avatar:
                regUser.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              role: regUser.role || 'Following',
              status: 'online',
              isFollowing: true,
            });
          } else {
            const cleanName = key
              .replace(/[-_.]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            add({
              id: `following-${key}`,
              name: cleanName,
              username: key,
              linkupId: key.startsWith('lk-') ? key.toUpperCase() : 'LK-FOLLOWED',
              avatar:
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              role: 'Following',
              status: 'online',
              isFollowing: true,
            });
          }
        }
      });

      return list;
    } else {
      // Friend's profile following list
      INITIAL_FRIENDS.filter(
        (f) => f.username?.toLowerCase() !== user.username?.toLowerCase()
      )
        .slice(0, 3)
        .forEach((f) => {
          add({
            id: f.id,
            name: f.name,
            username: f.username,
            linkupId: f.linkupId,
            avatar: f.avatar,
            role: f.hometown ? `From ${f.hometown}` : 'Creator',
            status: f.status || 'online',
            isFollowing: Boolean(followedUsers[f.username?.toLowerCase()]),
          });
        });
      return list;
    }
  }, [isMyProfile, friends, authUser, followedUsers, user]);

  // 3. Dynamic Following Calculation
  const activeFollowedKeys = Object.keys(followedUsers).filter((k) => followedUsers[k]);
  const followedFriends = friends.filter((f) => f.isFollowing);
  const combinedFollowingSet = new Set([
    ...activeFollowedKeys,
    ...followedFriends.map((f) => f.username?.toLowerCase() || f.id),
  ]);
  const dynamicFollowingCount = isMyProfile
    ? Math.max(combinedFollowingSet.size, followingList.length)
    : Math.max(user.followingCount ?? (user.isFollowing ? 1 : 0), followingList.length);

  // 4. Dynamic Followers Calculation (unified so both owner and viewers see the exact same count)
  const confirmedFriendsCount = friends.filter((f) => f.isFriend).length;
  const pendingRequestsCount = friends.filter((f) => f.hasPendingRequest).length;
  const myFollowersCount = Math.max(
    (user.followersCount ?? 0) + confirmedFriendsCount + pendingRequestsCount,
    followersList.length
  );
  const friendFollowersCount = Math.max(
    (user.followersCount ?? 0) + (isFriendFollowed ? 1 : 0),
    followersList.length
  );
  const displayedFollowersCount = isMyProfile
    ? myFollowersCount
    : friendFollowersCount;

  // 5. Dynamic Gallery Images
  const postImages = (isMyProfile ? myPosts : friendPosts)
    .map((p) => p.image)
    .filter(Boolean);
  const displayedGalleryImages = postImages.length > 0
    ? [...postImages, ...(user.gallery || CURRENT_USER.gallery || [])]
    : (user.gallery || CURRENT_USER.gallery || []);

  // Check if user is currently streaming live
  const liveStreamObj = activeLiveStreams?.find(
    (s) =>
      s.broadcasterId === user.id ||
      (s.broadcasterUsername && user.username && s.broadcasterUsername.toLowerCase() === user.username.toLowerCase()) ||
      s.broadcasterId === user.linkupId
  );
  const isUserLive = Boolean(liveStreamObj);

  const handleCopyId = () => {
    if (user.linkupId) {
      navigator.clipboard?.writeText(user.linkupId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  };

  const handleAddHighlight = (newHl) => {
    const updatedHighlights = [...highlights, newHl];
    updateUserProfile({ highlights: updatedHighlights });
  };

  const handleUpdateHighlight = (updatedHl) => {
    const updatedHighlights = highlights.map((hl) => (hl.id === updatedHl.id ? updatedHl : hl));
    updateUserProfile({ highlights: updatedHighlights });
    if (activeHighlight && activeHighlight.id === updatedHl.id) {
      setActiveHighlight(updatedHl);
    }
  };

  const handleDeleteHighlight = (highlightId) => {
    const updatedHighlights = highlights.filter((hl) => hl.id !== highlightId);
    updateUserProfile({ highlights: updatedHighlights });
    if (activeHighlight && activeHighlight.id === highlightId) {
      setActiveHighlight(null);
    }
    setContextMenuHlId(null);
  };

  const handleUpdateHighlightStories = (highlightId, newStories) => {
    const updatedHighlights = highlights.map((hl) => {
      if (hl.id === highlightId) {
        return { ...hl, stories: newStories };
      }
      return hl;
    });
    updateUserProfile({ highlights: updatedHighlights });
    if (activeHighlight && activeHighlight.id === highlightId) {
      setActiveHighlight((prev) => (prev ? { ...prev, stories: newStories } : null));
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 pb-20 select-none text-slate-100 animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {!isMyProfile && (
              <button
                type="button"
                onClick={() => {
                  setViewingUser(null);
                  setActiveTab('search');
                }}
                className="p-1.5 -ml-1 rounded-full hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-5 h-5 text-purple-400" />
                <span>Back</span>
              </button>
            )}
            <h2 className="text-base font-extrabold tracking-tight text-white">{user.username}</h2>
            {isMyProfile && <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {isMyProfile ? (
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
              title="Menu & Settings"
            >
              <Menu className="w-6 h-6" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openChatWithUser(user)}
              className="p-2 rounded-full hover:bg-slate-800 text-purple-400 transition-colors"
              title="Send Message"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Profile Header Row: Avatar + Stats */}
        <div className="flex items-center justify-between px-2 gap-4">
          {/* Large Avatar with Gradient Ring */}
          <div
            onClick={() => {
              if (isMyProfile) {
                setIsEditModalOpen(true);
              } else if (isUserLive && liveStreamObj) {
                watchLive(liveStreamObj);
              }
            }}
            className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 ${
              isUserLive
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-2xl shadow-red-600/50 cursor-pointer hover:scale-105 animate-pulse'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 shadow-xl'
            } flex-shrink-0 transition-transform ${
              isMyProfile || isUserLive ? 'cursor-pointer hover:scale-105' : ''
            }`}
            title={
              isMyProfile
                ? 'Click to edit profile picture'
                : isUserLive
                ? `Watch ${user.name} Live Broadcast`
                : user.name
            }
          >
            <img
              src={user.avatar || CURRENT_USER.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#090C15]"
            />
            {isMyProfile && (
              <div className="absolute bottom-0 right-0 p-1 rounded-full bg-purple-600 text-white border-2 border-[#090C15] shadow-md">
                <Edit2 className="w-2.5 h-2.5" />
              </div>
            )}
            {isUserLive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-black text-white border border-[#090C15] uppercase tracking-wider animate-pulse shadow-lg">
                LIVE
              </span>
            )}
          </div>

          {/* 3 Stats Columns: Dynamic Posts, Followers & Following */}
          <div className="flex-1 flex items-center justify-around text-center">
            <div
              onClick={() => {
                setActiveTabSub('grid');
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity p-1.5 rounded-xl hover:bg-slate-800/40"
              title="Click to view posts"
            >
              <span className="block text-base sm:text-lg font-black text-white">{displayedPostsCount}</span>
              <span className="text-[11px] text-slate-400 font-medium">Posts</span>
            </div>

            <div
              onClick={() => {
                setFollowersModalTab('followers');
                setIsFollowersModalOpen(true);
              }}
              className="cursor-pointer hover:opacity-80 transition-all hover:scale-105 active:scale-95 p-1.5 rounded-xl hover:bg-purple-950/30 group"
              title="Click to view followers list"
            >
              <span className="block text-base sm:text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                {displayedFollowersCount}
              </span>
              <span className="text-[11px] text-purple-400 font-bold group-hover:underline">Followers</span>
            </div>

            <div
              onClick={() => {
                setFollowersModalTab('following');
                setIsFollowersModalOpen(true);
              }}
              className="cursor-pointer hover:opacity-80 transition-all hover:scale-105 active:scale-95 p-1.5 rounded-xl hover:bg-indigo-950/30 group"
              title="Click to view following list"
            >
              <span className="block text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                {dynamicFollowingCount}
              </span>
              <span className="text-[11px] text-indigo-400 font-bold group-hover:underline">Following</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-2 flex flex-col gap-0.5">
          <h3 className="text-sm font-black text-white">{user.name}</h3>
          <p className="text-xs text-slate-300 font-medium">{user.role || user.work || 'LinkUp Member'}</p>
          <p className="text-xs text-slate-400">{user.subtitle || user.bio || 'Connecting and sharing on LinkUp 🚀'}</p>
          <a
            href={`https://${user.website || 'linkup.dev/' + user.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline w-fit mt-0.5"
          >
            {user.website || `linkup.dev/${user.username}`}
          </a>
        </div>

        {/* LinkUp Official ID Badge */}
        <div className="mx-2 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              ID
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-purple-400">Official LinkUp ID</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs font-mono font-black text-white tracking-wider">{user.linkupId || 'LK-84920'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyId}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-purple-300 flex items-center gap-1.5 transition-all active:scale-95 shadow"
            >
              {idCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>

            {isMyProfile && (
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-purple-600/30"
                title="Enter friend's ID to follow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow by ID</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Own Profile vs Friend's Profile */}
        {isMyProfile ? (
          <div className="grid grid-cols-2 gap-2.5 px-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all hover:scale-[1.01]"
            >
              Edit Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className="py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
            >
              <span>Add Friends</span>
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2">
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isFriendFollowed
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-600/30 hover:opacity-90'
              }`}
            >
              {isFriendFollowed ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-300">Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => openChatWithUser(user)}
              className="py-2 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Message</span>
            </button>

            {isUserLive && (
              <button
                type="button"
                onClick={() => watchLive(liveStreamObj)}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all animate-pulse col-span-2 sm:col-span-1 shadow-lg shadow-red-600/30"
              >
                <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Watch Live</span>
              </button>
            )}
          </div>
        )}

        {/* Story Highlights Row with Quick Context Actions */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar px-2 py-1 relative">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className="relative flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div
                onClick={() => setActiveHighlight(hl)}
                className={`w-14 h-14 rounded-full bg-slate-900 border-2 ${hl.color} flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform`}
              >
                <span>{hl.icon}</span>
              </div>

              <span
                onClick={() => setActiveHighlight(hl)}
                className="text-[11px] font-bold text-slate-300 group-hover:text-purple-300 transition-colors"
              >
                {hl.name}
              </span>

              {/* 3-dots Quick Edit Indicator */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuHlId(contextMenuHlId === hl.id ? null : hl.id);
                }}
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-700 shadow-md transition-colors"
                title="Highlight Options"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {/* Popup Context Menu */}
              {contextMenuHlId === hl.id && (
                <div className="absolute top-12 left-0 z-40 w-36 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl text-xs flex flex-col gap-1 animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      setContextMenuHlId(null);
                      setEditingHighlight(hl);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold text-left"
                  >
                    <Edit className="w-3.5 h-3.5 text-purple-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteHighlight(hl.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-red-400 font-semibold text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Highlight Button */}
          <div
            onClick={() => setIsCreateHighlightOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-purple-500 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400">New</span>
          </div>
        </div>

        {/* Gallery Tabs Bar */}
        <div className="flex items-center justify-around border-t border-slate-800/80 pt-1">
          <button
            type="button"
            onClick={() => setActiveTabSub('grid')}
            className={`flex-1 py-2.5 flex items-center justify-center transition-all ${
              activeTabSub === 'grid' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('reels')}
            className={`flex-1 py-2.5 flex items-center justify-center transition-all ${
              activeTabSub === 'reels' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Film className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('tagged')}
            className={`flex-1 py-2.5 flex items-center justify-center transition-all ${
              activeTabSub === 'tagged' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Tag className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Photo Grid */}
        <div className="grid grid-cols-3 gap-1 px-0.5">
          {displayedGalleryImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-square bg-slate-800 overflow-hidden cursor-pointer group"
            >
              <img
                src={imgUrl}
                alt="post grid"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Story Highlight Viewer Modal */}
      {activeHighlight && (
        <HighlightViewerModal
          highlight={activeHighlight}
          isOpen={Boolean(activeHighlight)}
          onClose={() => setActiveHighlight(null)}
          onOpenEditModal={(hl) => {
            setActiveHighlight(null);
            setEditingHighlight(hl);
          }}
          onDeleteHighlight={handleDeleteHighlight}
          onUpdateHighlightStories={handleUpdateHighlightStories}
        />
      )}

      {/* Create New Highlight Modal */}
      <CreateHighlightModal
        isOpen={isCreateHighlightOpen}
        onClose={() => setIsCreateHighlightOpen(false)}
        onAddHighlight={handleAddHighlight}
      />

      {/* Edit / Remove Highlight Modal */}
      {editingHighlight && (
        <EditHighlightModal
          highlight={editingHighlight}
          isOpen={Boolean(editingHighlight)}
          onClose={() => setEditingHighlight(null)}
          onUpdateHighlight={handleUpdateHighlight}
          onDeleteHighlight={handleDeleteHighlight}
        />
      )}

      {/* Interactive Followers & Following Modal */}
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        initialTab={followersModalTab}
        profileUser={user}
        isMyProfile={isMyProfile}
        followersList={followersList}
        followingList={followingList}
        onUserClick={(targetUser) => {
          setIsFollowersModalOpen(false);
          if (viewUserProfile) {
            viewUserProfile(targetUser);
          }
        }}
        onToggleFollow={(targetUser) => {
          toggleFollowFriend(targetUser);
          const uKey = targetUser.username?.toLowerCase() || targetUser.id;
          const isCurrentlyFollowed = Boolean(
            followedUsers[uKey] ||
            followedUsers[targetUser.linkupId?.toLowerCase()] ||
            targetUser.isFollowing
          );
          const nextState = !isCurrentlyFollowed;
          const updated = {
            ...followedUsers,
            [uKey]: nextState,
            [targetUser.linkupId?.toLowerCase()]: nextState,
            [targetUser.id]: nextState,
          };
          setFollowedUsers(updated);
          try {
            localStorage.setItem('linkup_following_usernames', JSON.stringify(updated));
          } catch {}
        }}
        onOpenChat={(targetUser) => {
          setIsFollowersModalOpen(false);
          if (openChatWithUser) {
            openChatWithUser(targetUser);
          }
        }}
        followedUsers={followedUsers}
        onRemoveFollower={(targetUser) => {
          if (setFriends) {
            setFriends((prev) =>
              prev.filter(
                (f) =>
                  f.username?.toLowerCase() !== targetUser.username?.toLowerCase() &&
                  f.linkupId?.toLowerCase() !== targetUser.linkupId?.toLowerCase() &&
                  f.id !== targetUser.id
              )
            );
          }
        }}
      />
    </>
  );
};

export default ProfileView;
