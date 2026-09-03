import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_FRIENDS,
  INITIAL_STORIES,
  INITIAL_REELS,
  INITIAL_GROUPS,
  INITIAL_PAGES,
  INITIAL_MARKETPLACE_ITEMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES_CONVERSATIONS,
} from '../data/mockSocialData';
import { useAuth } from './AuthContext';
import { realtime } from '../services/realtimeService';

const SocialContext = createContext();

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export const SocialProvider = ({ children }) => {
  const { user } = useAuth();

  // Active Screen View: 'home' | 'search' | 'reels' | 'messages' | 'chat_direct' | 'notifications' | 'profile' | 'menu' | 'auth_welcome'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem('linkup_active_tab');
      if (user && savedTab && savedTab !== 'auth_welcome') {
        return savedTab;
      }
    } catch {}
    return user ? 'home' : 'auth_welcome';
  });
  const [viewMode, setViewMode] = useState('app');
  const [activeScreenIndex, setActiveScreenIndex] = useState(2);

  // Ensure activeTab stays in sync and preserves current view (e.g. profile) across reloads
  useEffect(() => {
    if (!user) {
      setActiveTab('auth_welcome');
    } else {
      if (activeTab === 'auth_welcome') {
        try {
          const savedTab = localStorage.getItem('linkup_active_tab');
          setActiveTab(savedTab && savedTab !== 'auth_welcome' ? savedTab : 'home');
        } catch {
          setActiveTab('home');
        }
      } else {
        try {
          localStorage.setItem('linkup_active_tab', activeTab);
        } catch {}
      }
    }
  }, [user, activeTab]);

  const [feedMode, setFeedMode] = useState('algorithmic');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [reels, setReels] = useState(INITIAL_REELS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [marketplaceItems, setMarketplaceItems] = useState(INITIAL_MARKETPLACE_ITEMS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [conversations, setConversations] = useState(INITIAL_MESSAGES_CONVERSATIONS);

  // Active direct chat conversation
  const [activeConversation, setActiveConversation] = useState(INITIAL_MESSAGES_CONVERSATIONS[0]);

  // Real-Time Active Live Streams tracking
  const [activeLiveStreams, setActiveLiveStreams] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
    } catch {
      return [];
    }
  });
  const [activeLiveStreamToWatch, setActiveLiveStreamToWatch] = useState(null);
  const [isLiveViewerOpen, setIsLiveViewerOpen] = useState(false);

  // Modals state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');

  // Real-time Event Subscriptions (Live Streams & Direct Messages)
  useEffect(() => {
    // 1. Subscribe to Live Stream starts
    const unsubLiveStart = realtime.subscribe('LIVE_STREAM_STARTED', (streamPayload) => {
      if (streamPayload && streamPayload.broadcasterId) {
        setActiveLiveStreams((prev) => {
          const filtered = prev.filter((s) => s.broadcasterId !== streamPayload.broadcasterId);
          return [streamPayload, ...filtered];
        });
      }
    });

    // 2. Subscribe to Live Stream stops
    const unsubLiveStop = realtime.subscribe('LIVE_STREAM_STOPPED', ({ broadcasterId }) => {
      setActiveLiveStreams((prev) => prev.filter((s) => s.broadcasterId !== broadcasterId));
      if (activeLiveStreamToWatch && activeLiveStreamToWatch.broadcasterId === broadcasterId) {
        // Broadcaster stopped live
      }
    });

    // 3. Subscribe to incoming Real-Time Direct Messages
    const unsubMessages = realtime.subscribe('NEW_DIRECT_MESSAGE', (payload) => {
      if (!payload || !user) return;

      const isForMe =
        payload.recipientId === user.id ||
        (payload.recipientUsername && payload.recipientUsername.toLowerCase() === user.username.toLowerCase()) ||
        payload.recipientId === user.linkupId;

      if (isForMe) {
        const incomingMsg = {
          id: payload.id || `m-${Date.now()}`,
          senderId: payload.senderId,
          text: payload.text,
          time: payload.time || 'Just now',
        };

        setConversations((prev) => {
          let matched = false;
          const updated = prev.map((c) => {
            if (
              c.friend?.id === payload.senderId ||
              (c.friend?.username && payload.senderUsername && c.friend.username.toLowerCase() === payload.senderUsername.toLowerCase())
            ) {
              matched = true;
              return {
                ...c,
                lastMessage: payload.text,
                time: 'Just now',
                unread: true,
                messages: [...c.messages, incomingMsg],
              };
            }
            return c;
          });

          if (!matched) {
            const newConv = {
              id: `conv-${Date.now()}`,
              friend: {
                id: payload.senderId,
                name: payload.senderName || 'LinkUp Member',
                username: payload.senderUsername || 'user',
                avatar: payload.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
                linkupId: payload.senderLinkUpId,
              },
              lastMessage: payload.text,
              time: 'Just now',
              unread: true,
              messages: [incomingMsg],
            };
            return [newConv, ...updated];
          }
          return updated;
        });

        setActiveConversation((prev) => {
          if (
            prev &&
            (prev.friend?.id === payload.senderId ||
             (prev.friend?.username && payload.senderUsername && prev.friend.username.toLowerCase() === payload.senderUsername.toLowerCase()))
          ) {
            return {
              ...prev,
              lastMessage: payload.text,
              time: 'Just now',
              messages: [...prev.messages, incomingMsg],
            };
          }
          return prev;
        });

        // Add to notifications
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            type: 'message',
            user: {
              name: payload.senderName || 'New Message',
              avatar: payload.senderAvatar,
            },
            text: payload.text,
            time: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      }
    });

    return () => {
      unsubLiveStart();
      unsubLiveStop();
      unsubMessages();
    };
  }, [user, activeLiveStreamToWatch]);

  // Open Chat with any discovered user or friend
  const openChatWithUser = (targetUser) => {
    if (!targetUser) return;
    let targetConv = conversations.find(
      (c) =>
        c.friend.id === targetUser.id ||
        (c.friend.username && targetUser.username && c.friend.username.toLowerCase() === targetUser.username.toLowerCase())
    );

    if (!targetConv) {
      targetConv = {
        id: `conv-${Date.now()}`,
        friend: {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username,
          linkupId: targetUser.linkupId,
          avatar: targetUser.avatar,
        },
        lastMessage: 'Tap to say hello 👋',
        time: 'New',
        unread: false,
        messages: [],
      };
      setConversations((prev) => [targetConv, ...prev]);
    }

    setActiveConversation(targetConv);
    setActiveTab('chat_direct');
  };

  // Watch another user's live stream
  const watchLive = (streamInfo) => {
    if (!streamInfo) return;
    setActiveLiveStreamToWatch(streamInfo);
    setIsLiveViewerOpen(true);
  };

  // Add a new post
  const addPost = ({ content, media = [], musicTrackId = null, feeling = null, location = null, privacy = 'Public' }) => {
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        id: user?.id || CURRENT_USER.id,
        name: user?.name || CURRENT_USER.name,
        username: user?.username || CURRENT_USER.username,
        avatar: user?.avatar || CURRENT_USER.avatar,
      },
      timestamp: 'Just now',
      createdAt: Date.now(),
      content,
      feeling,
      location,
      privacy,
      media,
      musicTrackId,
      reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      userReaction: null,
      sharesCount: 0,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setCreatePostOpen(false);
  };

  // Delete a post
  const deletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // React to a post
  const reactToPost = (postId, reactionType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const prevReaction = post.userReaction;
          const reactions = { ...post.reactions };

          if (prevReaction === reactionType) {
            reactions[reactionType] = Math.max(0, reactions[reactionType] - 1);
            return { ...post, userReaction: null, reactions };
          }

          if (prevReaction) {
            reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          }

          reactions[reactionType] = (reactions[reactionType] || 0) + 1;
          return { ...post, userReaction: reactionType, reactions };
        }
        return post;
      })
    );
  };

  // Add comment to post
  const addComment = (postId, text) => {
    if (!text.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: {
        id: user?.id || CURRENT_USER.id,
        name: user?.name || CURRENT_USER.name,
        avatar: user?.avatar || CURRENT_USER.avatar,
      },
      text,
      timestamp: 'Just now',
      likes: 0,
      replies: [],
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
  };

  // Share post
  const sharePost = (postId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            sharesCount: post.sharesCount + 1,
          };
        }
        return post;
      })
    );
  };

  // Add 24-hour Story
  const addStory = ({ mediaUrl, caption = '', musicTrackId = null, privacy = 'Public', hiddenFromUserIds = [] }) => {
    const newStory = {
      id: `story-${Date.now()}`,
      user: {
        id: user?.id || 'current-user',
        name: user?.name ? `${user.name} (You)` : 'Your Story',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80',
        isOwner: true,
      },
      mediaUrl,
      caption,
      musicTrackId,
      privacy,
      hiddenFromUserIds,
      timestamp: 'Just now',
      viewersCount: 1,
    };

    setStories((prev) => [newStory, ...prev]);
    setCreateStoryOpen(false);
  };

  // Delete Story
  const deleteStory = (storyId) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  // Update Story Privacy & Hide from users
  const updateStoryPrivacy = (storyId, { privacy, hiddenFromUserIds = [] }) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, privacy, hiddenFromUserIds } : s))
    );
  };

  // Toggle friend follow
  const toggleFollowFriend = (friendId) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f))
    );
  };

  // Confirm / Delete friend request
  const handleFriendRequest = (friendId, action) => {
    if (action === 'confirm') {
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, isFriend: true, hasPendingRequest: false } : f))
      );
    } else {
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, hasPendingRequest: false } : f))
      );
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.type === 'friend_request' ? { ...n, hasActions: false, action: action === 'confirm' ? 'is now your friend.' : 'request removed.' } : n
      )
    );
  };

  // Direct Message Sending with Real-Time Dispatch
  const sendDirectMessage = (conversationId, text) => {
    if (!text.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: user?.id || CURRENT_USER.id,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const conv = conversations.find((c) => c.id === conversationId);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              time: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    if (activeConversation?.id === conversationId) {
      setActiveConversation((prev) => ({
        ...prev,
        lastMessage: text,
        time: 'Just now',
        messages: [...prev.messages, newMsg],
      }));
    }

    // Real-time dispatch across tabs & P2P network
    if (conv && conv.friend) {
      realtime.sendDirectMessage(conv.friend, {
        id: newMsg.id,
        senderId: user?.id || CURRENT_USER.id,
        senderName: user?.name || CURRENT_USER.name,
        senderUsername: user?.username || CURRENT_USER.username,
        senderAvatar: user?.avatar || CURRENT_USER.avatar,
        senderLinkUpId: user?.linkupId,
        text: newMsg.text,
        time: newMsg.time,
      });
    }
  };

  // Notification helper
  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: `notif-${Date.now()}`, ...notif },
      ...prev,
    ]);
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const toggleGroupJoin = (groupId) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isJoined: !g.isJoined } : g))
    );
  };

  return (
    <SocialContext.Provider
      value={{
        feedMode,
        setFeedMode,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        activeScreenIndex,
        setActiveScreenIndex,
        posts,
        friends,
        stories,
        reels,
        groups,
        pages,
        marketplaceItems,
        notifications,
        conversations,
        activeConversation,
        setActiveConversation,
        activeLiveStreams,
        activeLiveStreamToWatch,
        setActiveLiveStreamToWatch,
        isLiveViewerOpen,
        setIsLiveViewerOpen,
        watchLive,
        openChatWithUser,
        createPostOpen,
        setCreatePostOpen,
        createStoryOpen,
        setCreateStoryOpen,
        activeStoryIndex,
        setActiveStoryIndex,
        isReelsOpen,
        setIsReelsOpen,
        isGroupsOpen,
        setIsGroupsOpen,
        isMarketplaceOpen,
        setIsMarketplaceOpen,
        isProfileOpen,
        setIsProfileOpen,
        profileUserId,
        setProfileUserId,
        isSettingsOpen,
        setIsSettingsOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isChatOpen,
        setIsChatOpen,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
        searchQuery,
        setSearchQuery,
        searchCategory,
        setSearchCategory,
        addPost,
        deletePost,
        reactToPost,
        addComment,
        sharePost,
        addStory,
        deleteStory,
        updateStoryPrivacy,
        toggleFollowFriend,
        handleFriendRequest,
        sendDirectMessage,
        addNotification,
        markNotificationRead,
        toggleGroupJoin,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export default SocialProvider;
