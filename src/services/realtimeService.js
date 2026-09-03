import Peer from 'peerjs';

const CLOUD_TOPIC = 'linkup_network_live_v2';
const CLOUD_URL = `https://ntfy.sh/${CLOUD_TOPIC}`;

export const formatPeerId = (idStr) => {
  if (!idStr) return 'lk-user';
  const clean = idStr.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^lk/, '');
  return `lk-${clean || 'user'}`;
};

class RealtimeService {
  constructor() {
    this.listeners = new Map();
    this.peer = null;
    this.peerId = null;
    this.currentUser = null;
    this.activeConnections = new Map();
    this.activeCalls = new Map();
    this.localStream = null;
    this.isInitialized = false;
    this.eventSource = null;

    // 1. Cross-tab / Cross-window broadcast channel for local multi-user testing
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('linkup_realtime_network');
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type) {
          this.handleIncomingPayload(type, payload);
        }
      };
    } else {
      this.channel = null;
    }

    // 2. Global Cloud Sync Relay (cross-device, cross-phone, zero-setup)
    if (typeof window !== 'undefined') {
      this.initCloudRelay();
    }
  }

  /**
   * Connect to global cloud relay for 100% real-time multi-device sync
   */
  async initCloudRelay() {
    // A. Fetch recent profile syncs and live broadcasts from the past 24 hours
    try {
      const res = await fetch(`${CLOUD_URL}/json?poll=1&since=24h`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        lines.forEach((line) => {
          try {
            const data = JSON.parse(line);
            if (data && data.message) {
              const parsed = JSON.parse(data.message);
              if (parsed.type && parsed.payload) {
                this.handleIncomingPayload(parsed.type, parsed.payload, false);
              }
            }
          } catch {}
        });
      }
    } catch (e) {
      console.warn('Cloud relay history poll fallback:', e);
    }

    // B. Real-time Server-Sent Events listener for instant live events
    try {
      if (typeof EventSource !== 'undefined') {
        this.eventSource = new EventSource(`${CLOUD_URL}/sse`);
        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.message) {
              const parsed = JSON.parse(data.message);
              if (parsed.type && parsed.payload) {
                this.handleIncomingPayload(parsed.type, parsed.payload, true);
              }
            }
          } catch {}
        };
      }
    } catch (e) {
      console.warn('Cloud SSE subscription error:', e);
    }
  }

  handleIncomingPayload(type, payload, triggerEmit = true) {
    // 1. Sync User Profile across all devices
    if (type === 'USER_PROFILE_SYNC' && payload && payload.username) {
      try {
        const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
        const idx = savedDb.findIndex(
          (u) =>
            (u.linkupId && payload.linkupId && u.linkupId.toLowerCase() === payload.linkupId.toLowerCase()) ||
            u.username?.toLowerCase() === payload.username.toLowerCase()
        );

        if (idx >= 0) {
          savedDb[idx] = { ...savedDb[idx], ...payload };
        } else {
          savedDb.unshift(payload);
        }
        localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
      } catch {}
    }

    // 2. Sync Live Streams across all devices
    if (type === 'LIVE_STREAM_STARTED' && payload && payload.broadcasterId) {
      try {
        const activeLives = JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
        const filtered = activeLives.filter((l) => l.broadcasterId !== payload.broadcasterId);
        filtered.unshift(payload);
        localStorage.setItem('linkup_active_live_streams', JSON.stringify(filtered));
      } catch {}
    }

    if (type === 'LIVE_STREAM_STOPPED' && payload && payload.broadcasterId) {
      try {
        const activeLives = JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
        const filtered = activeLives.filter((l) => l.broadcasterId !== payload.broadcasterId);
        localStorage.setItem('linkup_active_live_streams', JSON.stringify(filtered));
      } catch {}
    }

    if (triggerEmit) {
      this.emit(type, payload);
    }
  }

  /**
   * Publish an event to the global cloud relay so all phones/devices receive it instantly
   */
  async publishToCloud(type, payload) {
    try {
      fetch(CLOUD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      }).catch(() => {});
    } catch {}
  }

  /**
   * Initialize PeerJS WebRTC with the user's LinkUp ID
   */
  init(user) {
    if (!user || typeof window === 'undefined') return;

    this.currentUser = user;
    const cleanId = formatPeerId(user.linkupId || user.username || user.id);

    // Sync user profile to global cloud relay
    this.publishToCloud('USER_PROFILE_SYNC', {
      id: user.id,
      name: user.name,
      username: user.username,
      linkupId: user.linkupId,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      work: user.work,
      hometown: user.hometown,
      highlights: user.highlights,
    });

    if (this.peer && this.peerId === cleanId && !this.peer.destroyed) {
      return;
    }

    if (this.peer && !this.peer.destroyed) {
      this.peer.destroy();
    }

    this.peerId = cleanId;

    try {
      this.peer = new Peer(cleanId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('open', (id) => {
        this.isInitialized = true;
        this.emit('CONNECTED', { peerId: id });
        this.broadcast('USER_ONLINE', {
          id: user.id,
          username: user.username,
          linkupId: user.linkupId,
          peerId: id,
          avatar: user.avatar,
          name: user.name,
        });
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('call', (call) => {
        this.activeCalls.set(call.peer, call);
        if (this.localStream) {
          call.answer(this.localStream);
        } else {
          call.answer();
        }

        call.on('stream', (remoteStream) => {
          this.emit('REMOTE_STREAM_RECEIVED', {
            peerId: call.peer,
            stream: remoteStream,
          });
        });

        call.on('close', () => {
          this.activeCalls.delete(call.peer);
          this.emit('CALL_CLOSED', { peerId: call.peer });
        });
      });

      this.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          const fallbackId = cleanId + '-' + Math.floor(Math.random() * 1000);
          this.peer = new Peer(fallbackId, {
            debug: 1,
            config: {
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            },
          });
        }
      });
    } catch (e) {
      console.warn('PeerJS init fallback:', e);
    }
  }

  setupConnection(conn) {
    this.activeConnections.set(conn.peer, conn);

    conn.on('data', (data) => {
      if (data && data.type) {
        if (data.type === 'WHO_ARE_YOU' && this.currentUser) {
          conn.send({
            type: 'USER_PROFILE_SYNC',
            payload: {
              id: this.currentUser.id,
              name: this.currentUser.name,
              username: this.currentUser.username,
              linkupId: this.currentUser.linkupId,
              avatar: this.currentUser.avatar,
              bio: this.currentUser.bio,
              role: this.currentUser.role,
            },
          });
        }
        this.handleIncomingPayload(data.type, data.payload, true);
      }
    });

    conn.on('close', () => {
      this.activeConnections.delete(conn.peer);
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
    });
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(callback);
      }
    };
  }

  emit(eventType, payload) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in realtime listener for ${eventType}:`, err);
        }
      });
    }
  }

  broadcast(type, payload) {
    this.emit(type, payload);

    // 1. Broadcast locally across tabs
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (err) {}
    }

    // 2. Broadcast to global cloud relay so all other devices receive it
    this.publishToCloud(type, payload);

    // 3. Broadcast across direct WebRTC data connections
    this.activeConnections.forEach((conn) => {
      if (conn.open) {
        conn.send({ type, payload });
      }
    });
  }

  /**
   * Send a direct message to a user across the global cloud & WebRTC
   */
  sendDirectMessage(recipient, message) {
    const payload = {
      ...message,
      recipientId: recipient.id,
      recipientUsername: recipient.username,
      recipientLinkUpId: recipient.linkupId,
      timestamp: Date.now(),
    };

    // Broadcasts across local tabs + global cloud relay
    this.broadcast('NEW_DIRECT_MESSAGE', payload);

    // Direct WebRTC channel
    const targetPeerId = formatPeerId(recipient.linkupId || recipient.username || recipient.id);

    if (this.peer && targetPeerId && targetPeerId !== this.peerId) {
      try {
        let conn = this.activeConnections.get(targetPeerId);
        if (!conn || !conn.open) {
          conn = this.peer.connect(targetPeerId);
          this.setupConnection(conn);
          conn.on('open', () => {
            conn.send({ type: 'NEW_DIRECT_MESSAGE', payload });
          });
        } else {
          conn.send({ type: 'NEW_DIRECT_MESSAGE', payload });
        }
      } catch (err) {
        console.warn('P2P message transmission fallback:', err);
      }
    }
  }

  /**
   * Start a Live Stream broadcast
   */
  startLiveBroadcast(stream, streamInfo) {
    this.localStream = stream;

    const broadcastPayload = {
      ...streamInfo,
      peerId: this.peerId,
      startTime: Date.now(),
      isLive: true,
    };

    try {
      const activeLives = JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
      const filtered = activeLives.filter((l) => l.broadcasterId !== streamInfo.broadcasterId);
      filtered.unshift(broadcastPayload);
      localStorage.setItem('linkup_active_live_streams', JSON.stringify(filtered));
    } catch {}

    this.broadcast('LIVE_STREAM_STARTED', broadcastPayload);
  }

  /**
   * Stop a Live Stream broadcast
   */
  stopLiveBroadcast(broadcasterId) {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    try {
      const activeLives = JSON.parse(localStorage.getItem('linkup_active_live_streams') || '[]');
      const filtered = activeLives.filter((l) => l.broadcasterId !== broadcasterId);
      localStorage.setItem('linkup_active_live_streams', JSON.stringify(filtered));
    } catch {}

    this.broadcast('LIVE_STREAM_STOPPED', { broadcasterId });
  }

  /**
   * Join and watch another user's live stream via WebRTC or cloud
   */
  watchLiveStream(broadcasterPeerId, onStreamCallback) {
    if (!this.peer || !broadcasterPeerId) return null;

    try {
      const call = this.peer.call(broadcasterPeerId, null);
      if (call) {
        call.on('stream', (remoteStream) => {
          if (onStreamCallback) onStreamCallback(remoteStream);
        });
        return call;
      }
    } catch (err) {
      console.warn('Error calling broadcaster:', err);
    }
    return null;
  }

  sendLiveComment(streamId, comment) {
    this.broadcast('LIVE_STREAM_COMMENT', { streamId, comment });
  }

  sendLiveHeart(streamId, user) {
    this.broadcast('LIVE_STREAM_HEART', { streamId, user });
  }

  destroy() {
    if (this.peer && !this.peer.destroyed) {
      this.peer.destroy();
    }
    if (this.channel) {
      this.channel.close();
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.listeners.clear();
  }
}

export const realtime = new RealtimeService();
export default realtime;
