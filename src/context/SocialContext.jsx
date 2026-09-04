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
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('linkup_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_POSTS;
  });

  // Persist posts to localStorage so new user posts never disappear after refresh
  useEffect(() => {
    try {
      localStorage.setItem('linkup_posts', JSON.stringify(posts));
    } catch {}
  }, [posts]);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [reels, setReels] = useState(INITIAL_REELS);
  const [stories, setStories] = useState(() => {
    try {
      const isAmeenStory = (s) => {
        if (!s) return false;
        if (s.id === 'story-1788501813453') return true;
        const u = (s.user?.username || '').toLowerCase();
        const n = (s.user?.name || '').toLowerCase();
        const uid = (s.user?.id || '').toLowerCase();
        return u.includes('ameensab') || n.includes('ameensab') || uid === 'google-1788494183669';
      };

      const cleanStoryItem = (s) => {
        if (!s || !s.user) return s;
        const cleanName = s.user.name ? s.user.name.replace(/\s*\(You\)$/i, '') : s.user.name;
        return {
          ...s,
          isMyStory: false,
          user: {
            ...s.user,
            name: cleanName,
            isOwner: false,
          },
        };
      };

      // Own stories persisted locally
      const ownRaw = localStorage.getItem('linkup_stories');
      const ownParsed = ownRaw ? JSON.parse(ownRaw) : [];
      const ownStories = Array.isArray(ownParsed)
        ? ownParsed
            .filter((s) => s && s.id !== 'story-01' && s.user?.name !== 'Your Story' && !isAmeenStory(s))
            .map(cleanStoryItem)
        : [];

      // Cloud stories from friends (posted by others, received via realtime)
      const cloudRaw = localStorage.getItem('linkup_cloud_stories');
      const cloudParsed = cloudRaw ? JSON.parse(cloudRaw) : [];
      const cloudStories = Array.isArray(cloudParsed)
        ? cloudParsed.filter((s) => !isAmeenStory(s)).map(cleanStoryItem)
        : [];

      // Clean up localStorage immediately so Ameensab story is purged
      try {
        localStorage.setItem('linkup_stories', JSON.stringify(ownStories));
        localStorage.setItem('linkup_cloud_stories', JSON.stringify(cloudStories));
      } catch {}

      // Merge: own first, then cloud (deduped by id)
      const seen = new Set();
      const merged = [];
      [...ownStories, ...cloudStories].forEach((s) => {
        if (s && s.id && !seen.has(s.id) && !isAmeenStory(s)) {
          seen.add(s.id);
          merged.push(s);
        }
      });
      if (merged.length > 0) return merged;
    } catch {}
    return INITIAL_STORIES.filter(
      (s) => s && s.id !== 'story-01' && s.user?.name !== 'Your Story'
    );
  });

  // Persist stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('linkup_stories', JSON.stringify(stories));
    } catch {}
  }, [stories]);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [marketplaceItems, setMarketplaceItems] = useState(INITIAL_MARKETPLACE_ITEMS);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('linkup_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly deduplicate existing saved notifications
          // Also purge any stale live-type notifications on startup
          // (they will re-appear if the broadcaster is actually still live via SSE)
          const deduped = [];
          const seen = new Set();
          for (const n of parsed) {
            // Drop saved live notifications — they'll be re-added if still live via SSE
            if (n.type === 'live') continue;

            const username = (n.user?.username || n.user?.id || '').toLowerCase();
            const actionKey = (n.action || n.text || '').toLowerCase().replace(/[^a-z]/g, '');
            const key = n.type === 'friend_request'
              ? `freq_${username}_${actionKey.includes('accept') ? 'accept' : 'req'}`
              : (n.id || `${n.type}_${username}_${actionKey}`);

            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(n);
            }
          }
          return deduped;
        }
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const unsentList = JSON.parse(localStorage.getItem('linkup_unsent_messages') || '[]');
      const unsentSet = new Set(unsentList);
      const saved = localStorage.getItem('linkup_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => ({
            ...c,
            messages: (c.messages || []).filter((m) => !unsentSet.has(m.id)),
          }));
        }
      }
    } catch {}
    return INITIAL_MESSAGES_CONVERSATIONS;
  });

  // Active direct chat conversation
  const [activeConversation, setActiveConversation] = useState(() => {
    try {
      const unsentList = JSON.parse(localStorage.getItem('linkup_unsent_messages') || '[]');
      const unsentSet = new Set(unsentList);
      const saved = localStorage.getItem('linkup_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          return {
            ...first,
            messages: (first.messages || []).filter((m) => !unsentSet.has(m.id)),
          };
        }
      }
    } catch {}
    return INITIAL_MESSAGES_CONVERSATIONS[0];
  });

  // Persist conversations to localStorage so messages never disappear after refresh
  useEffect(() => {
    try {
      localStorage.setItem('linkup_conversations', JSON.stringify(conversations));
    } catch (err) {
      console.warn('Error saving conversations:', err);
    }
  }, [conversations]);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('linkup_notifications', JSON.stringify(notifications));
    } catch (err) {
      console.warn('Error saving notifications:', err);
    }
  }, [notifications]);

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
  const [isLiveBroadcasterOpen, setIsLiveBroadcasterOpen] = useState(false);

  // Modals state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const viewUserProfile = (targetUser) => {
    if (!targetUser) return;
    setViewingUser(targetUser);
    setActiveTab('profile');
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Real-time Event Subscriptions (Live Streams & Direct Messages)
  useEffect(() => {
    // 1. Subscribe to Live Stream starts
    const unsubLiveStart = realtime.subscribe('LIVE_STREAM_STARTED', (streamPayload) => {
      if (!streamPayload || !streamPayload.broadcasterId) return;

      const enriched = {
        ...streamPayload,
        startTime: streamPayload.startTime || Date.now(),
        lastHeartbeat: Date.now(),
      };

      // Update active streams list
      setActiveLiveStreams((prev) => {
        const filtered = prev.filter(
          (s) =>
            s.broadcasterId !== enriched.broadcasterId &&
            (s.broadcasterUsername && enriched.broadcasterUsername
              ? s.broadcasterUsername.toLowerCase() !== enriched.broadcasterUsername.toLowerCase()
              : true)
        );
        return [enriched, ...filtered];
      });

      // Only push a live notification if:
      // 1. The event is from THIS device/session (fromSelf flag = it was user's own broadcast)
      //    OR it came from SSE (real-time, not history replay — marked with isRealtime flag).
      // 2. The broadcaster is not the currently logged-in user.
      // Historical cloud poll events are NEVER used to generate notifications.
      if (!streamPayload._isHistorical) {
        const isSelf =
          user &&
          ((enriched.broadcasterId && enriched.broadcasterId === user.id) ||
            (enriched.broadcasterUsername &&
              user.username &&
              enriched.broadcasterUsername.toLowerCase() === user.username.toLowerCase()) ||
            (enriched.linkupId &&
              user.linkupId &&
              enriched.linkupId.toLowerCase() === user.linkupId.toLowerCase()));

        if (!isSelf) {
          setNotifications((prev) => {
            const notifId = `live-notif-${streamPayload.broadcasterId || streamPayload.broadcasterUsername}`;
            if (prev.some((n) => n.id === notifId)) return prev;

            const newNotif = {
              id: notifId,
              type: 'live',
              action: `started a LIVE video broadcast: "${streamPayload.title || 'Live Stream'}" 🔴`,
              user: {
                id: streamPayload.broadcasterId,
                name: streamPayload.broadcasterName || 'Friend',
                username: streamPayload.broadcasterUsername || 'friend',
                avatar:
                  streamPayload.broadcasterAvatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
                linkupId: streamPayload.linkupId,
              },
              time: 'Just now',
              read: false,
              section: 'New',
              liveStream: streamPayload,
            };
            return [newNotif, ...prev];
          });
        }
      }
    });

    // 2. Subscribe to Live Stream stops
    const unsubLiveStop = realtime.subscribe('LIVE_STREAM_STOPPED', ({ broadcasterId }) => {
      // Remove from active live streams
      setActiveLiveStreams((prev) => prev.filter((s) => s.broadcasterId !== broadcasterId));

      // CRITICAL FIX: Also remove the live notification from the notification centre
      // so the "Watch Live" button disappears as soon as the broadcast ends.
      const notifId = `live-notif-${broadcasterId}`;
      setNotifications((prev) =>
        prev.filter((n) => {
          if (n.id === notifId) return false;
          if (n.type === 'live' && n.liveStream?.broadcasterId === broadcasterId) return false;
          return true;
        })
      );
    });

    // 3. Subscribe to incoming Real-Time Direct Messages with Strict Deduplication
    const unsubMessages = realtime.subscribe('NEW_DIRECT_MESSAGE', (payload) => {
      if (!payload || !user) return;

      const isForMe =
        payload.recipientId === user.id ||
        (payload.recipientUsername && payload.recipientUsername.toLowerCase() === user.username.toLowerCase()) ||
        payload.recipientId === user.linkupId;

      if (isForMe) {
        // Prevent duplicate processing if sender is current user (loopback / broadcast echo)
        const currentUserId = user.id || CURRENT_USER.id;
        const currentUsername = (user.username || CURRENT_USER.username || '').toLowerCase();
        if (
          payload.senderId === currentUserId ||
          (payload.senderUsername && payload.senderUsername.toLowerCase() === currentUsername)
        ) {
          return;
        }

        const msgId = payload.id;
        try {
          const unsentList = JSON.parse(localStorage.getItem('linkup_unsent_messages') || '[]');
          if (msgId && unsentList.includes(msgId)) {
            return; // Message was unsent! Ignore completely.
          }
        } catch {}
        const incomingMsg = {
          id: msgId || `m-${payload.timestamp || Date.now()}`,
          senderId: payload.senderId,
          text: payload.text,
          time: payload.time || 'Just now',
          seen: false,
          timestamp: payload.timestamp || Date.now(),
        };

        setConversations((prev) => {
          let matched = false;
          const updated = prev.map((c) => {
            const isTargetFriend =
              c.friend?.id === payload.senderId ||
              (c.friend?.username && payload.senderUsername && c.friend.username.toLowerCase() === payload.senderUsername.toLowerCase()) ||
              (c.friend?.linkupId && payload.senderLinkUpId && c.friend.linkupId.toLowerCase() === payload.senderLinkUpId.toLowerCase());

            if (isTargetFriend) {
              matched = true;
              // Strict Deduplication: never append if identical message ID or duplicate recent text exists
              const alreadyExists = c.messages.some(
                (m) =>
                  (msgId && m.id === msgId) ||
                  (m.senderId === payload.senderId &&
                   m.text === payload.text &&
                   Math.abs((m.timestamp || 0) - (payload.timestamp || 0)) < 6000)
              );
              if (alreadyExists) return c;

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
          if (!prev) return prev;
          const isTargetFriend =
            prev.friend?.id === payload.senderId ||
            (prev.friend?.username && payload.senderUsername && prev.friend.username.toLowerCase() === payload.senderUsername.toLowerCase()) ||
            (prev.friend?.linkupId && payload.senderLinkUpId && prev.friend.linkupId.toLowerCase() === payload.senderLinkUpId.toLowerCase());

          if (isTargetFriend) {
            const alreadyExists = prev.messages.some(
              (m) =>
                (msgId && m.id === msgId) ||
                (m.senderId === payload.senderId &&
                 m.text === payload.text &&
                 Math.abs((m.timestamp || 0) - (payload.timestamp || 0)) < 6000)
            );
            if (alreadyExists) return prev;

            return {
              ...prev,
              lastMessage: payload.text,
              time: 'Just now',
              messages: [...prev.messages, incomingMsg],
            };
          }
          return prev;
        });

        // Add to notifications with deduplication
        setNotifications((prev) => {
          const notifKey = `notif-msg-${msgId || payload.timestamp}`;
          if (
            prev.some(
              (n) =>
                n.id === notifKey ||
                (n.text === payload.text &&
                 n.user?.username?.toLowerCase() === payload.senderUsername?.toLowerCase() &&
                 Date.now() - (n.createdAt || 0) < 6000)
            )
          ) {
            return prev;
          }
          return [
            {
              id: notifKey,
              createdAt: Date.now(),
              type: 'message',
              user: {
                name: payload.senderName || 'New Message',
                username: payload.senderUsername,
                avatar: payload.senderAvatar,
              },
              text: payload.text,
              time: 'Just now',
              read: false,
            },
            ...prev,
          ];
        });
      }
    });

    // 4. Subscribe to Real-Time New Stories from friends
    const unsubStory = realtime.subscribe('NEW_STORY', (incomingStory) => {
      if (!incomingStory || !incomingStory.id) return;
      const sUser = incomingStory.user || {};
      const u = (sUser.username || '').toLowerCase();
      const n = (sUser.name || '').toLowerCase();
      const uid = (sUser.id || '').toLowerCase();
      if (
        incomingStory.id === 'story-1788501813453' ||
        u.includes('ameensab') ||
        n.includes('ameensab') ||
        uid === 'google-1788494183669'
      ) {
        return;
      }

      const cleanIncoming = {
        ...incomingStory,
        isMyStory: false,
        user: { ...incomingStory.user, isOwner: false },
      };

      setStories((prev) => {
        if (prev.some((s) => s.id === cleanIncoming.id)) return prev;
        return [cleanIncoming, ...prev];
      });
    });

    // 5. Subscribe to Real-Time Friend Requests & Follows
    // 5. Subscribe to Real-Time Friend Requests & Follows
    const unsubFriendReq = realtime.subscribe('NEW_FRIEND_REQUEST', (payload) => {
      if (!payload || !user) return;
      const isForMe =
        (payload.recipientId && user.id && payload.recipientId === user.id) ||
        (payload.recipientUsername && user.username && payload.recipientUsername.toLowerCase() === user.username.toLowerCase()) ||
        (payload.recipientLinkUpId && user.linkupId && payload.recipientLinkUpId.toLowerCase() === user.linkupId.toLowerCase());

      if (isForMe) {
        // Prevent loopback if sender is me
        if (
          payload.senderId === user.id ||
          (payload.senderUsername && user.username && payload.senderUsername.toLowerCase() === user.username.toLowerCase())
        ) {
          return;
        }

        const senderUsername = (payload.senderUsername || '').toLowerCase();
        const reqNotifId = `notif-freq-${senderUsername || payload.senderId}`;

        const newNotif = {
          id: reqNotifId,
          type: 'friend_request',
          section: 'New',
          user: {
            id: payload.senderId,
            name: payload.senderName,
            username: payload.senderUsername,
            avatar: payload.senderAvatar,
            linkupId: payload.senderLinkUpId,
          },
          action: 'sent you a friend request.',
          time: 'Just now',
          read: false,
          hasActions: true,
        };

        setNotifications((prev) => {
          // Remove ANY prior request notification from this sender, ensuring strictly only 1 exists
          const filtered = prev.filter((n) => {
            if (n.id === reqNotifId) return false;
            const nUser = (n.user?.username || n.user?.id || '').toLowerCase();
            if (
              n.type === 'friend_request' &&
              n.action?.includes('sent you a friend request') &&
              (nUser === senderUsername || (payload.senderId && n.user?.id === payload.senderId))
            ) {
              return false;
            }
            return true;
          });
          return [newNotif, ...filtered];
        });

        setFriends((prev) => {
          const exists = prev.some(
            (f) =>
              (f.id && f.id === payload.senderId) ||
              (f.username && payload.senderUsername && f.username.toLowerCase() === payload.senderUsername.toLowerCase())
          );
          if (exists) {
            return prev.map((f) =>
              (f.id && f.id === payload.senderId) ||
              (f.username && payload.senderUsername && f.username.toLowerCase() === payload.senderUsername.toLowerCase())
                ? { ...f, hasPendingRequest: true }
                : f
            );
          }
          return [
            {
              id: payload.senderId,
              linkupId: payload.senderLinkUpId,
              name: payload.senderName,
              username: payload.senderUsername,
              avatar: payload.senderAvatar,
              mutualFriends: 1,
              status: 'online',
              isFriend: false,
              isFollowing: false,
              hasPendingRequest: true,
              hometown: 'LinkUp Network',
            },
            ...prev,
          ];
        });
      }
    });

    // 6. Subscribe to Friend Request Accepted
    const unsubReqAccepted = realtime.subscribe('FRIEND_REQUEST_ACCEPTED', (payload) => {
      if (!payload || !user) return;
      const isForMe =
        (payload.recipientId && user.id && payload.recipientId === user.id) ||
        (payload.recipientUsername && user.username && payload.recipientUsername.toLowerCase() === user.username.toLowerCase()) ||
        (payload.recipientLinkUpId && user.linkupId && payload.recipientLinkUpId.toLowerCase() === user.linkupId.toLowerCase());

      if (isForMe) {
        setFriends((prev) =>
          prev.map((f) =>
            (f.id && f.id === payload.senderId) ||
            (f.username && payload.senderUsername && f.username.toLowerCase() === payload.senderUsername.toLowerCase())
              ? { ...f, isFriend: true, hasPendingRequest: false }
              : f
          )
        );

        const senderUsername = (payload.senderUsername || '').toLowerCase();
        const accNotifId = `notif-facc-${senderUsername || payload.senderId}`;

        const newNotif = {
          id: accNotifId,
          type: 'friend_request',
          section: 'New',
          user: {
            id: payload.senderId,
            name: payload.senderName,
            username: payload.senderUsername,
            avatar: payload.senderAvatar,
            linkupId: payload.senderLinkUpId,
          },
          action: 'accepted your friend request!',
          time: 'Just now',
          read: false,
          hasActions: false,
        };

        setNotifications((prev) => {
          const filtered = prev.filter((n) => {
            if (n.id === accNotifId) return false;
            const nUser = (n.user?.username || n.user?.id || '').toLowerCase();
            if (
              n.type === 'friend_request' &&
              n.action?.includes('accepted') &&
              (nUser === senderUsername || (payload.senderId && n.user?.id === payload.senderId))
            ) {
              return false;
            }
            return true;
          });
          return [newNotif, ...filtered];
        });
      }
    });

    // 7. Subscribe to user account deletions
    const unsubUserDeleted = realtime.subscribe('USER_ACCOUNT_DELETED', (payload) => {
      if (payload && (payload.id || payload.username)) {
        setFriends((prev) =>
          prev.filter(
            (f) =>
              f.id !== payload.id &&
              (f.username && payload.username ? f.username.toLowerCase() !== payload.username.toLowerCase() : true) &&
              (f.linkupId && payload.linkupId ? f.linkupId.toLowerCase() !== payload.linkupId.toLowerCase() : true)
          )
        );
        setActiveLiveStreams((prev) =>
          prev.filter(
            (s) =>
              s.broadcasterId !== payload.id &&
              (s.broadcasterUsername && payload.username
                ? s.broadcasterUsername.toLowerCase() !== payload.username.toLowerCase()
                : true)
          )
        );
      }
    });

    // 8. Subscribe to Real-Time Unsent Direct Messages
    const unsubMessageUnsent = realtime.subscribe('UNSEND_DIRECT_MESSAGE', (payload) => {
      if (!payload || !payload.messageId) return;
      const unsendId = payload.messageId;

      // Maintain persistent unsent list and clean storage caches
      try {
        const unsentList = JSON.parse(localStorage.getItem('linkup_unsent_messages') || '[]');
        if (!unsentList.includes(unsendId)) {
          unsentList.push(unsendId);
          localStorage.setItem('linkup_unsent_messages', JSON.stringify(unsentList.slice(-500)));
        }
        const msgs = JSON.parse(localStorage.getItem('linkup_cloud_messages') || '[]');
        const filteredMsgs = msgs.filter((m) => m.id !== unsendId);
        localStorage.setItem('linkup_cloud_messages', JSON.stringify(filteredMsgs));
      } catch {}

      setConversations((prev) =>
        prev.map((c) => {
          if (!c.messages.some((m) => m.id === unsendId)) return c;
          const filtered = c.messages.filter((m) => m.id !== unsendId);
          const last = filtered[filtered.length - 1];
          return {
            ...c,
            lastMessage: last ? last.text : 'Message unsent',
            time: last ? last.time : 'Just now',
            messages: filtered,
          };
        })
      );

      setActiveConversation((prev) => {
        if (!prev || !prev.messages.some((m) => m.id === unsendId)) return prev;
        const filtered = prev.messages.filter((m) => m.id !== unsendId);
        const last = filtered[filtered.length - 1];
        return {
          ...prev,
          lastMessage: last ? last.text : 'Message unsent',
          time: last ? last.time : 'Just now',
          messages: filtered,
        };
      });

      // Also clean up any notification created for this unsent message
      setNotifications((prev) => prev.filter((n) => !n.id?.includes(unsendId)));
    });

    // 9. Subscribe to Real-Time Messages Seen
    const unsubMessagesSeen = realtime.subscribe('MESSAGES_SEEN', (payload) => {
      if (!payload || !user) return;
      const isReaderMe =
        (payload.readerId && payload.readerId === user.id) ||
        (payload.readerUsername && user.username && payload.readerUsername.toLowerCase() === user.username.toLowerCase());

      if (!isReaderMe) {
        setConversations((prev) =>
          prev.map((c) => {
            const isMatch =
              c.id === payload.conversationId ||
              c.friend?.id === payload.readerId ||
              (c.friend?.username && payload.readerUsername && c.friend.username.toLowerCase() === payload.readerUsername.toLowerCase());

            if (!isMatch) return c;

            const updatedMsgs = c.messages.map((m) => {
              const isSentByMe = m.senderId === user.id || m.senderId === CURRENT_USER.id || m.senderId === 'user-01';
              if (isSentByMe) {
                return {
                  ...m,
                  seen: true,
                  seenTime: payload.seenTime || 'Just now',
                };
              }
              return m;
            });

            return {
              ...c,
              messages: updatedMsgs,
            };
          })
        );

        setActiveConversation((prev) => {
          if (!prev) return prev;
          const isMatch =
            prev.id === payload.conversationId ||
            prev.friend?.id === payload.readerId ||
            (prev.friend?.username && payload.readerUsername && prev.friend.username.toLowerCase() === payload.readerUsername.toLowerCase());

          if (!isMatch) return prev;

          const updatedMsgs = prev.messages.map((m) => {
            const isSentByMe = m.senderId === user.id || m.senderId === CURRENT_USER.id || m.senderId === 'user-01';
            if (isSentByMe) {
              return {
                ...m,
                seen: true,
                seenTime: payload.seenTime || 'Just now',
              };
            }
            return m;
          });

          return {
            ...prev,
            messages: updatedMsgs,
          };
        });
      }
    });

    return () => {
      unsubLiveStart();
      unsubLiveStop();
      unsubMessages();
      unsubStory();
      unsubFriendReq();
      unsubReqAccepted();
      unsubUserDeleted();
      unsubMessageUnsent();
      unsubMessagesSeen();
    };
  }, [user, activeLiveStreamToWatch]);

  // Sync past and incoming friend requests and direct messages from the cloud relay
  useEffect(() => {
    const syncCloudData = () => {
      try {
        // Sync active live streams (only within the last 45s heartbeat)
        const activeLives = JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
        const freshLives = activeLives.filter((l) => {
          if (!l || !l.broadcasterId) return false;
          const t = l.lastHeartbeat || l.startTime || 0;
          return t && Date.now() - t < 45000;
        });

        setActiveLiveStreams(freshLives);

        // Remove stale live notifications if their stream is no longer alive
        const liveBroadcasterIds = new Set(freshLives.map((l) => l.broadcasterId));
        setNotifications((prev) =>
          prev.filter((n) => {
            if (n.type === 'live') {
              const bId = n.liveStream?.broadcasterId || n.user?.id;
              return bId && liveBroadcasterIds.has(bId);
            }
            return true;
          })
        );

        if (freshLives.length > 0) {
          // Generate live notifications for active streams that aren't the current user
          freshLives.forEach((stream) => {
            const isSelf = Boolean(
              user && (
                (stream.broadcasterId && stream.broadcasterId === user.id) ||
                (stream.broadcasterUsername &&
                  user.username &&
                  stream.broadcasterUsername.toLowerCase() === user.username.toLowerCase())
              )
            );

            if (!isSelf && stream.broadcasterId) {
              setNotifications((prev) => {
                const notifId = `live-notif-${stream.broadcasterId}`;
                if (prev.some((n) => n.id === notifId)) return prev;
                return [
                  {
                    id: notifId,
                    type: 'live',
                    action: `is broadcasting LIVE: "${stream.title || 'Live Stream'}" 🔴`,
                    user: {
                      id: stream.broadcasterId,
                      name: stream.broadcasterName || 'Friend',
                      username: stream.broadcasterUsername || 'friend',
                      avatar:
                        stream.broadcasterAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
                      linkupId: stream.linkupId,
                    },
                    time: 'Live now',
                    read: false,
                    section: 'New',
                    liveStream: stream,
                  },
                  ...prev,
                ];
              });
            }
          });
        }
      } catch (e) {}

      // 3. Sync cloud stories from friends (posted while offline or on other devices)
      try {
        const cloudStories = JSON.parse(localStorage.getItem('linkup_cloud_stories') || '[]');
        if (cloudStories.length > 0) {
          setStories((prev) => {
            const newOnes = cloudStories
              .filter((s) => {
                if (!s || !s.id || existingIds.has(s.id)) return false;
                if (s.id === 'story-1788501813453') return false;
                const sUser = s.user || {};
                const u = (sUser.username || '').toLowerCase();
                const n = (sUser.name || '').toLowerCase();
                const uid = (sUser.id || '').toLowerCase();
                return !u.includes('ameensab') && !n.includes('ameensab') && uid !== 'google-1788494183669';
              })
              .map((s) => ({
                ...s,
                isMyStory: false,
                user: { ...s.user, isOwner: false },
              }));
            if (newOnes.length === 0) return prev;
            return [...newOnes, ...prev];
          });
        }
      } catch (e) {}

      if (!user) return;

      // 1. Sync friend requests
      try {
        const reqs = JSON.parse(localStorage.getItem('linkup_cloud_friend_requests') || '[]');
        reqs.forEach((payload) => {
          const isForMe =
            (payload.recipientId && user.id && payload.recipientId === user.id) ||
            (payload.recipientUsername && user.username && payload.recipientUsername.toLowerCase() === user.username.toLowerCase()) ||
            (payload.recipientLinkUpId && user.linkupId && payload.recipientLinkUpId.toLowerCase() === user.linkupId.toLowerCase());

          if (isForMe) {
            const newNotif = {
              id: payload.id || `notif-req-${Date.now()}`,
              type: 'friend_request',
              section: 'New',
              user: {
                id: payload.senderId,
                name: payload.senderName,
                username: payload.senderUsername,
                avatar: payload.senderAvatar,
                linkupId: payload.senderLinkUpId,
              },
              action: 'sent you a friend request.',
              time: payload.timestamp ? new Date(payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              read: false,
              hasActions: true,
            };

            setNotifications((prev) => {
              if (prev.some((n) => n.id === newNotif.id || (n.user?.username && n.user.username.toLowerCase() === payload.senderUsername.toLowerCase()))) {
                return prev;
              }
              return [newNotif, ...prev];
            });

            setFriends((prev) => {
              const exists = prev.some(
                (f) =>
                  (f.id && f.id === payload.senderId) ||
                  (f.username && payload.senderUsername && f.username.toLowerCase() === payload.senderUsername.toLowerCase())
              );
              if (exists) {
                return prev.map((f) =>
                  (f.id && f.id === payload.senderId) ||
                  (f.username && payload.senderUsername && f.username.toLowerCase() === payload.senderUsername.toLowerCase())
                    ? { ...f, hasPendingRequest: true }
                    : f
                );
              }
              return [
                {
                  id: payload.senderId,
                  linkupId: payload.senderLinkUpId,
                  name: payload.senderName,
                  username: payload.senderUsername,
                  avatar: payload.senderAvatar,
                  mutualFriends: 1,
                  status: 'online',
                  isFriend: false,
                  isFollowing: false,
                  hasPendingRequest: true,
                  hometown: 'LinkUp Network',
                },
                ...prev,
              ];
            });
          }
        });
      } catch (e) {}

      // 2. Sync direct messages
      try {
        const unsentList = JSON.parse(localStorage.getItem('linkup_unsent_messages') || '[]');
        const unsentSet = new Set(unsentList);
        const msgs = JSON.parse(localStorage.getItem('linkup_cloud_messages') || '[]');
        msgs.forEach((payload) => {
          if (payload.id && unsentSet.has(payload.id)) return; // Never restore unsent messages!
          const isForMe =
            (payload.recipientId && user.id && payload.recipientId === user.id) ||
            (payload.recipientUsername && user.username && payload.recipientUsername.toLowerCase() === user.username.toLowerCase()) ||
            (payload.recipientLinkUpId && user.linkupId && payload.recipientLinkUpId.toLowerCase() === user.linkupId.toLowerCase());

          if (isForMe) {
            const incomingMsg = {
              id: payload.id || `m-${payload.timestamp || Date.now()}`,
              senderId: payload.senderId,
              text: payload.text,
              time: payload.time || 'Just now',
              seen: false,
              timestamp: payload.timestamp || Date.now(),
            };

            setConversations((prev) => {
              const exists = prev.some(
                (c) =>
                  c.friend?.id === payload.senderId ||
                  (c.friend?.username && payload.senderUsername && c.friend.username.toLowerCase() === payload.senderUsername.toLowerCase())
              );
              if (exists) {
                return prev.map((c) => {
                  if (
                    c.friend?.id === payload.senderId ||
                    (c.friend?.username && payload.senderUsername && c.friend.username.toLowerCase() === payload.senderUsername.toLowerCase())
                  ) {
                    const alreadyPresent = c.messages.some(
                      (m) =>
                        (payload.id && m.id === payload.id) ||
                        (m.senderId === payload.senderId &&
                         m.text === payload.text &&
                         Math.abs((m.timestamp || 0) - (payload.timestamp || 0)) < 6000)
                    );
                    if (alreadyPresent) return c;

                    return {
                      ...c,
                      lastMessage: payload.text,
                      time: 'Just now',
                      messages: [...c.messages, incomingMsg],
                    };
                  }
                  return c;
                });
              } else {
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
                return [newConv, ...prev];
              }
            });
          }
        });
      } catch (e) {}
    };

    syncCloudData();
    const unsubSynced = realtime.subscribe('CLOUD_DATA_SYNCED', syncCloudData);
    return () => unsubSynced();
  }, [user]);

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

  // Auto-join live stream if opened with ?live= or ?watch= in URL
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const liveTarget = params.get('live') || params.get('watch');
      if (liveTarget) {
        const activeLives = JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
        const match = activeLives.find(
          (s) =>
            (s.broadcasterId && s.broadcasterId.toLowerCase() === liveTarget.toLowerCase()) ||
            (s.broadcasterUsername && s.broadcasterUsername.toLowerCase() === liveTarget.toLowerCase()) ||
            (s.linkupId && s.linkupId.toLowerCase() === liveTarget.toLowerCase()) ||
            (s.broadcasterPeerId && s.broadcasterPeerId.toLowerCase() === liveTarget.toLowerCase())
        );

        if (match) {
          watchLive(match);
        } else {
          watchLive({
            id: `stream-${liveTarget}`,
            broadcasterId: liveTarget,
            broadcasterName: 'Friend Live Broadcast',
            broadcasterUsername: liveTarget,
            linkupId: liveTarget.startsWith('lk-') ? liveTarget.toUpperCase() : liveTarget,
            peerId: liveTarget,
            broadcasterPeerId: liveTarget,
            title: 'Live Video Broadcast',
          });
        }
      }
    } catch (e) {
      console.warn('Auto live URL join error:', e);
    }
  }, []);

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
  const addStory = async ({ mediaUrl, caption = '', musicTrackId = null, privacy = 'Public', hiddenFromUserIds = [] }) => {
    const storyId = `story-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let broadcastMediaUrl = mediaUrl;

    // Upload photo to cloud attachment if it's a large base64 data URL
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      try {
        const res = await fetch(mediaUrl);
        const blob = await res.blob();
        const uploadRes = await fetch(`https://ntfy.sh/linkup_network_live_v2?filename=story_${Date.now()}.jpg`, {
          method: 'PUT',
          body: blob,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.attachment && uploadData.attachment.url) {
            broadcastMediaUrl = uploadData.attachment.url;
          }
        }
      } catch (err) {
        console.warn('Cloud attachment upload fallback:', err);
      }
    }

    // Clean story object: no baked-in isMyStory or isOwner flags
    const storyObject = {
      id: storyId,
      user: {
        id: user?.id || CURRENT_USER.id,
        name: user?.name || CURRENT_USER.name,
        username: user?.username || CURRENT_USER.username,
        avatar: user?.avatar || CURRENT_USER.avatar,
      },
      mediaUrl: broadcastMediaUrl || mediaUrl,
      caption,
      musicTrackId,
      privacy,
      hiddenFromUserIds,
      timestamp: 'Just now',
      viewersCount: 0,
      createdAt: Date.now(),
    };

    // Save to stories state immediately
    setStories((prev) => [storyObject, ...prev]);

    // Persist to linkup_cloud_stories so same-browser cross-tab followers pick it up
    try {
      const cloudStories = JSON.parse(localStorage.getItem('linkup_cloud_stories') || '[]');
      if (!cloudStories.some((s) => s.id === storyId)) {
        cloudStories.unshift(storyObject);
        localStorage.setItem('linkup_cloud_stories', JSON.stringify(cloudStories.slice(0, 50)));
      }
    } catch {}

    // Broadcast NEW_STORY to local tabs and global cloud relay
    realtime.broadcast('NEW_STORY', storyObject);

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

  // Toggle friend follow / send real-time friend request
  const toggleFollowFriend = (friendOrId) => {
    const friendId = typeof friendOrId === 'string' ? friendOrId : friendOrId?.id;
    const targetUser = typeof friendOrId === 'object' ? friendOrId : friends.find((f) => f.id === friendId);

    setFriends((prev) => {
      const exists = prev.some((f) => f.id === friendId);
      if (exists) {
        return prev.map((f) => (f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f));
      } else if (targetUser) {
        return [
          {
            id: targetUser.id,
            linkupId: targetUser.linkupId,
            name: targetUser.name,
            username: targetUser.username,
            avatar: targetUser.avatar,
            mutualFriends: 1,
            status: 'online',
            isFriend: false,
            isFollowing: true,
            hometown: 'LinkUp Network',
          },
          ...prev,
        ];
      }
      return prev;
    });

    // Broadcast real-time friend request across global network
    if (targetUser && user) {
      realtime.broadcast('NEW_FRIEND_REQUEST', {
        id: `req-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderUsername: user.username,
        senderAvatar: user.avatar,
        senderLinkUpId: user.linkupId,
        recipientId: targetUser.id,
        recipientUsername: targetUser.username,
        recipientLinkUpId: targetUser.linkupId,
        timestamp: Date.now(),
      });
    }
  };

  // Confirm / Delete friend request
  const handleFriendRequest = (friendId, action) => {
    const targetFriend = friends.find((f) => f.id === friendId || f.linkupId === friendId);

    if (action === 'confirm') {
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId || f.linkupId === friendId ? { ...f, isFriend: true, hasPendingRequest: false } : f))
      );
      if (user && targetFriend) {
        realtime.broadcast('FRIEND_REQUEST_ACCEPTED', {
          senderId: user.id,
          senderName: user.name,
          senderUsername: user.username,
          senderAvatar: user.avatar,
          senderLinkUpId: user.linkupId,
          recipientId: targetFriend.id,
          recipientUsername: targetFriend.username,
          recipientLinkUpId: targetFriend.linkupId,
        });
      }
    } else {
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId || f.linkupId === friendId ? { ...f, hasPendingRequest: false } : f))
      );
    }

    const targetUsername = targetFriend?.username?.toLowerCase();
    setNotifications((prev) =>
      prev.map((n) => {
        const nUsername = (n.user?.username || '').toLowerCase();
        const isMatch =
          n.type === 'friend_request' &&
          (n.user?.id === friendId ||
           n.id === friendId ||
           (targetUsername && nUsername === targetUsername));

        return isMatch
          ? {
              ...n,
              hasActions: false,
              action: action === 'confirm' ? 'is now your friend.' : 'request removed.',
            }
          : n;
      })
    );
  };

  // Direct Message Sending with Real-Time Dispatch
  const sendDirectMessage = (conversationId, text) => {
    if (!text.trim()) return;

    const now = Date.now();
    const newMsg = {
      id: `m-${now}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: user?.id || CURRENT_USER.id,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false,
      timestamp: now,
    };

    const conv = conversations.find((c) => c.id === conversationId);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text.trim(),
              time: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    if (activeConversation?.id === conversationId) {
      setActiveConversation((prev) => ({
        ...prev,
        lastMessage: text.trim(),
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
        seen: false,
        timestamp: newMsg.timestamp,
      });
    }
  };

  // Unsend Direct Message for Everyone
  const unsendMessage = (conversationId, messageId) => {
    if (!messageId) return;

    // 1. Maintain persistent unsent tracking & clean storage caches
    try {
      const unsentList = JSON.parse(localStorage.getItem('linkup_unsent_messages') || '[]');
      if (!unsentList.includes(messageId)) {
        unsentList.push(messageId);
        localStorage.setItem('linkup_unsent_messages', JSON.stringify(unsentList.slice(-500)));
      }
      const msgs = JSON.parse(localStorage.getItem('linkup_cloud_messages') || '[]');
      const filteredMsgs = msgs.filter((m) => m.id !== messageId);
      localStorage.setItem('linkup_cloud_messages', JSON.stringify(filteredMsgs));
    } catch {}

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId && !c.messages.some((m) => m.id === messageId)) return c;
        const filtered = c.messages.filter((m) => m.id !== messageId);
        const last = filtered[filtered.length - 1];
        return {
          ...c,
          lastMessage: last ? last.text : 'Message unsent',
          time: last ? last.time : 'Just now',
          messages: filtered,
        };
      })
    );

    setActiveConversation((prev) => {
      if (!prev) return prev;
      if (prev.id !== conversationId && !prev.messages.some((m) => m.id === messageId)) return prev;
      const filtered = prev.messages.filter((m) => m.id !== messageId);
      const last = filtered[filtered.length - 1];
      return {
        ...prev,
        lastMessage: last ? last.text : 'Message unsent',
        time: last ? last.time : 'Just now',
        messages: filtered,
      };
    });

    // Remove notification if any
    setNotifications((prev) => prev.filter((n) => !n.id?.includes(messageId)));

    // Real-time broadcast so recipient also removes it instantly
    realtime.broadcast('UNSEND_DIRECT_MESSAGE', {
      conversationId,
      messageId,
      senderId: user?.id || CURRENT_USER.id,
      senderUsername: user?.username || CURRENT_USER.username,
    });
  };

  // Mark Conversation Messages As Seen
  const markConversationAsSeen = (conversationId) => {
    if (!conversationId) return;

    let hasUnread = false;
    const currentUserId = user?.id || CURRENT_USER.id;
    const currentUsername = (user?.username || CURRENT_USER.username || '').toLowerCase();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const needsSeen = c.unread || c.messages.some((m) => m.senderId !== currentUserId && !m.seen);
        if (!needsSeen) return c;
        hasUnread = true;
        const updatedMsgs = c.messages.map((m) =>
          m.senderId !== currentUserId ? { ...m, seen: true, seenTime: nowTime } : m
        );
        return {
          ...c,
          unread: false,
          messages: updatedMsgs,
        };
      })
    );

    setActiveConversation((prev) => {
      if (!prev || prev.id !== conversationId) return prev;
      const updatedMsgs = prev.messages.map((m) =>
        m.senderId !== currentUserId ? { ...m, seen: true, seenTime: nowTime } : m
      );
      return {
        ...prev,
        unread: false,
        messages: updatedMsgs,
      };
    });

    if (hasUnread) {
      realtime.broadcast('MESSAGES_SEEN', {
        conversationId,
        readerId: currentUserId,
        readerUsername: currentUsername,
        seenTime: nowTime,
        seenAt: Date.now(),
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
        setFriends,
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
        isLiveBroadcasterOpen,
        setIsLiveBroadcasterOpen,
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
        viewingUser,
        setViewingUser,
        viewUserProfile,
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
        isSearchActive,
        setIsSearchActive,
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
        unsendMessage,
        markConversationAsSeen,
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
