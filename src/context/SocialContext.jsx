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
  const [activeTab, setActiveTab] = useState(() => (user ? 'home' : 'auth_welcome'));
  const [viewMode, setViewMode] = useState('app'); // 'app' (Mobile Phone UI matching screenshot) | 'desktop' (Expanded Web Layout)
  const [activeScreenIndex, setActiveScreenIndex] = useState(2); // 1 to 10 for direct screen jumping

  useEffect(() => {
    if (!user) {
      setActiveTab('auth_welcome');
    }
  }, [user]);

  const [feedMode, setFeedMode] = useState('algorithmic'); // 'algorithmic' | 'chronological'
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

  // Modals state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null); // When viewing stories
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null); // null = current user
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All'); // 'All' | 'People' | 'Posts' | 'Groups' | 'Reels' | 'Tags'

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
      media,
      musicTrackId,
      feeling,
      location,
      privacy,
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0,
      },
      userReaction: null,
      sharesCount: 0,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setCreatePostOpen(false);
    setActiveTab('home');

    // Push notification to activity stream
    addNotification({
      user: {
        name: 'LinkUp Network',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80',
      },
      action: 'Your post was published to the feed.',
      time: 'Just now',
      read: false,
      section: 'New',
      type: 'like',
    });
  };

  // Delete a post
  const deletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // React to a post (Like, Love, Haha, Wow, Sad, Angry)
  const reactToPost = (postId, reactionType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const currentReaction = post.userReaction;
        const newReactions = { ...post.reactions };

        if (currentReaction === reactionType) {
          // Toggle off
          newReactions[reactionType] = Math.max(0, newReactions[reactionType] - 1);
          return { ...post, reactions: newReactions, userReaction: null };
        } else {
          // Remove old reaction if existed
          if (currentReaction && newReactions[currentReaction]) {
            newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
          }
          // Add new reaction
          newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
          return { ...post, reactions: newReactions, userReaction: reactionType };
        }
      })
    );
  };

  // Add a comment or nested reply to a post
  const addComment = (postId, text, parentCommentId = null) => {
    if (!text.trim()) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        if (parentCommentId) {
          const updatedComments = post.comments.map((comment) => {
            if (comment.id !== parentCommentId) return comment;
            return {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: `cr-${Date.now()}`,
                  author: {
                    id: user?.id || CURRENT_USER.id,
                    name: user?.name || CURRENT_USER.name,
                    avatar: user?.avatar || CURRENT_USER.avatar,
                  },
                  text,
                  timestamp: 'Just now',
                  likes: 0,
                },
              ],
            };
          });
          return { ...post, comments: updatedComments };
        } else {
          const newComment = {
            id: `c-${Date.now()}`,
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
          return { ...post, comments: [...post.comments, newComment] };
        }
      })
    );
  };

  // Share post
  const sharePost = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, sharesCount: post.sharesCount + 1 } : post
      )
    );
  };

  // Add 24-hour Story
  const addStory = ({ mediaUrl, caption = '', musicTrackId = null }) => {
    const newStory = {
      id: `story-${Date.now()}`,
      user: {
        id: user?.id || CURRENT_USER.id,
        name: 'Your Story',
        avatar: user?.avatar || CURRENT_USER.avatar,
      },
      mediaUrl,
      caption,
      musicTrackId,
      timestamp: 'Just now',
      viewersCount: 1,
    };

    setStories((prev) => [newStory, ...prev]);
    setCreateStoryOpen(false);
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

  // Direct Message Sending
  const sendDirectMessage = (conversationId, text) => {
    if (!text.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      senderId: user?.id || CURRENT_USER.id,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

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

  // Toggle group membership
  const toggleGroupJoin = (groupId) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              isJoined: !g.isJoined,
              membersCount: g.isJoined ? g.membersCount - 1 : g.membersCount + 1,
            }
          : g
      )
    );
  };

  // Quick switch to any of the 10 screens from user's image
  const navigateToScreen = (screenNumber) => {
    setActiveScreenIndex(screenNumber);
    switch (screenNumber) {
      case 1:
        setActiveTab('auth_welcome');
        break;
      case 2:
        setActiveTab('home');
        break;
      case 3:
        setCreatePostOpen(true);
        break;
      case 4:
        setActiveTab('reels');
        break;
      case 5:
        setActiveTab('profile');
        break;
      case 6:
        setActiveTab('messages');
        break;
      case 7:
        setActiveTab('chat_direct');
        break;
      case 8:
        setActiveTab('search');
        break;
      case 9:
        setActiveTab('notifications');
        break;
      case 10:
        setActiveTab('menu');
        break;
      default:
        setActiveTab('home');
    }
  };

  return (
    <SocialContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        activeScreenIndex,
        setActiveScreenIndex,
        navigateToScreen,
        feedMode,
        setFeedMode,
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
