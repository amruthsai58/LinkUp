import Peer from 'peerjs';

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

    // Cross-tab / Cross-window broadcast channel for instant multi-user simulation
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
  }

  handleIncomingPayload(type, payload) {
    // Automatically save discovered users into registered directory
    if (type === 'USER_ONLINE' && payload && payload.username) {
      try {
        const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
        if (!savedDb.some((u) => u.username?.toLowerCase() === payload.username.toLowerCase())) {
          savedDb.unshift(payload);
          localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
        }
      } catch {}
    }

    this.emit(type, payload);
  }

  /**
   * Initialize PeerJS WebRTC with the user's LinkUp ID or username
   */
  init(user) {
    if (!user || typeof window === 'undefined') return;

    this.currentUser = user;
    const cleanId = formatPeerId(user.linkupId || user.username || user.id);

    // If already connected with same ID, reuse
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
        // Announce presence across network
        this.broadcast('USER_ONLINE', {
          id: user.id,
          username: user.username,
          linkupId: user.linkupId,
          peerId: id,
          avatar: user.avatar,
          name: user.name,
        });
      });

      // Handle incoming data connections (direct messages, live reactions)
      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      // Handle incoming media calls (watching a live video stream)
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
            type: 'USER_ONLINE',
            payload: {
              id: this.currentUser.id,
              name: this.currentUser.name,
              username: this.currentUser.username,
              linkupId: this.currentUser.linkupId,
              avatar: this.currentUser.avatar,
            },
          });
        }
        this.handleIncomingPayload(data.type, data.payload);
      }
    });

    conn.on('close', () => {
      this.activeConnections.delete(conn.peer);
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
    });
  }

  /**
   * Subscribe to real-time events
   */
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

  /**
   * Broadcast an event to all tabs/devices
   */
  broadcast(type, payload) {
    this.emit(type, payload);

    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (err) {
        console.warn('Channel postMessage error:', err);
      }
    }

    this.activeConnections.forEach((conn) => {
      if (conn.open) {
        conn.send({ type, payload });
      }
    });
  }

  /**
   * Send a direct message to a specific user
   */
  sendDirectMessage(recipient, message) {
    const payload = {
      ...message,
      recipientId: recipient.id,
      recipientUsername: recipient.username,
      recipientLinkUpId: recipient.linkupId,
      timestamp: Date.now(),
    };

    this.broadcast('NEW_DIRECT_MESSAGE', payload);

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
   * Join and watch another user's live stream
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
    this.listeners.clear();
  }
}

export const realtime = new RealtimeService();
export default realtime;
