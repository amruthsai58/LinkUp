import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Radio,
  Heart,
  Users,
  Send,
  MessageCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Camera,
  CameraOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { realtime, formatPeerId } from '../../services/realtimeService';

export const LiveViewerModal = ({ liveStream, isOpen, onClose }) => {
  const { user } = useAuth();
  const { addNotification } = useSocial();

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Rahul Kumar', text: 'Hey! Glad you are live 🔥' },
    { id: 2, user: 'Priya Sharma', text: 'Audio and video are crisp! 🎧' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [viewersCount, setViewersCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isEnded, setIsEnded] = useState(false);

  // Video stream status
  const [videoStatus, setVideoStatus] = useState('connecting'); // 'connecting' | 'live' | 'no-camera' | 'error'
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  const videoRef = useRef(null);
  const callRef = useRef(null);
  const messagesEndRef = useRef(null);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Main connection logic ─────────────────────────────────────────────────
  const attemptWebRTCConnection = useCallback(() => {
    if (!liveStream) return;

    const targetPeerId =
      liveStream.peerId ||
      liveStream.broadcasterPeerId ||
      formatPeerId(liveStream.linkupId || liveStream.broadcasterUsername || liveStream.broadcasterId);

    if (!targetPeerId) {
      setVideoStatus('no-camera');
      return;
    }

    setVideoStatus('connecting');

    const executeCall = (peerInstance) => {
      try {
        // Use a tiny canvas stream so PeerJS offer/answer SDP negotiates properly
        const receiveStream = realtime.createReceiveOnlyStream();
        const call = receiveStream
          ? peerInstance.call(targetPeerId, receiveStream)
          : null;

        if (!call) {
          setVideoStatus('no-camera');
          return;
        }

        callRef.current = call;

        call.on('stream', (remoteStream) => {
          if (!videoRef.current) return;
          videoRef.current.srcObject = remoteStream;
          videoRef.current
            .play()
            .then(() => setVideoStatus('live'))
            .catch(() => setVideoStatus('live'));
        });

        call.on('error', (err) => {
          console.warn('Live viewer call error:', err);
          setVideoStatus('no-camera');
        });

        call.on('close', () => {
          setVideoStatus('no-camera');
        });

        // If stream doesn't arrive in 7s, fall back to no-camera mode
        retryTimerRef.current = setTimeout(() => {
          if (videoStatus !== 'live') {
            setVideoStatus('no-camera');
          }
        }, 7000);
      } catch (err) {
        console.warn('WebRTC call error:', err);
        setVideoStatus('no-camera');
      }
    };

    if (realtime.peer && !realtime.peer.destroyed) {
      if (realtime.peer.open) {
        executeCall(realtime.peer);
      } else {
        realtime.peer.once('open', () => executeCall(realtime.peer));
      }
    } else {
      // PeerJS not yet available – show no-camera fallback after short delay
      setTimeout(() => setVideoStatus('no-camera'), 3000);
    }
  }, [liveStream, connectionAttempt]);

  useEffect(() => {
    if (!isOpen || !liveStream) return;

    setIsEnded(false);
    setVideoStatus('connecting');

    // Attempt WebRTC connection
    attemptWebRTCConnection();

    // ── Also listen for the broadcaster's local stream if on the same device ──
    // (BroadcastChannel relay) — works when broadcaster & viewer are same browser/device
    const unsubRemote = realtime.subscribe('REMOTE_STREAM_RECEIVED', ({ stream }) => {
      if (!videoRef.current || !stream) return;
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => setVideoStatus('live'))
        .catch(() => setVideoStatus('live'));
    });

    // Real-time chat comments
    const unsubComments = realtime.subscribe('LIVE_STREAM_COMMENT', (payload) => {
      if (payload?.comment) {
        setChatMessages((prev) => [...prev.slice(-30), payload.comment]);
      }
    });

    // Real-time hearts
    const unsubHearts = realtime.subscribe('LIVE_STREAM_HEART', () => {
      triggerHeartBurst();
    });

    // Live ended
    const unsubEnded = realtime.subscribe('LIVE_STREAM_STOPPED', (payload) => {
      if (
        payload &&
        (payload.broadcasterId === liveStream.broadcasterId ||
          payload.broadcasterId === liveStream.linkupId)
      ) {
        setIsEnded(true);
      }
    });

    // Viewer heartbeat — increment viewer count every 8s
    const viewerTick = setInterval(() => {
      setViewersCount((v) => v + Math.floor(Math.random() * 3));
    }, 8000);

    return () => {
      unsubRemote();
      unsubComments();
      unsubHearts();
      unsubEnded();
      clearInterval(viewerTick);
      clearTimeout(retryTimerRef.current);
      if (callRef.current) {
        try { callRef.current.close(); } catch {}
      }
    };
  }, [isOpen, liveStream]);

  if (!isOpen || !liveStream) return null;

  const triggerHeartBurst = () => {
    const newHeart = { id: Date.now() + Math.random(), left: Math.random() * 65 + 15 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1800);
  };

  const handleSendHeart = () => {
    triggerHeartBurst();
    realtime.sendLiveHeart(liveStream.id, { name: user?.name || 'Viewer', avatar: user?.avatar });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const newComment = { id: Date.now(), user: user?.name || 'You', text: inputMsg.trim() };
    setChatMessages((prev) => [...prev.slice(-30), newComment]);
    realtime.sendLiveComment(liveStream.id, newComment);
    setInputMsg('');
  };

  const handleRetry = () => {
    if (callRef.current) {
      try { callRef.current.close(); } catch {}
      callRef.current = null;
    }
    setConnectionAttempt((n) => n + 1);
    attemptWebRTCConnection();
  };

  const isLive = videoStatus === 'live';
  const isConnecting = videoStatus === 'connecting';
  const noCamera = videoStatus === 'no-camera';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 sm:bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full sm:h-[92dvh] sm:max-h-[820px] bg-[#070A12] border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">

        {/* ── Top Floating Header ── */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={liveStream.broadcasterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'}
                  alt={liveStream.broadcasterName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-red-600 rounded-md text-[8px] font-black text-white uppercase">
                  LIVE
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white drop-shadow">{liveStream.broadcasterName}</h3>
                <p className="text-[11px] text-slate-300 drop-shadow truncate max-w-[160px]">
                  {liveStream.title || 'Live Stream'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{viewersCount}</span>
            </div>

            {/* Connection status indicator */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isLive
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                : isConnecting
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-700/60 border-slate-600 text-slate-400'
            }`}>
              {isLive ? <Wifi className="w-3 h-3" /> : isConnecting ? <Wifi className="w-3 h-3 animate-pulse" /> : <WifiOff className="w-3 h-3" />}
              <span>{isLive ? 'HD' : isConnecting ? '…' : 'SD'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Video Stage ── */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">

          {/* Actual WebRTC video element — always mounted, visibility toggled */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            onCanPlay={() => setVideoStatus('live')}
            onLoadedData={() => setVideoStatus('live')}
            onPlaying={() => setVideoStatus('live')}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          />

          {/* ── Connecting state ── */}
          {isConnecting && !isEnded && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-950 via-[#0B0F1C] to-slate-950">
              <div className="relative">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-2xl shadow-red-600/40 animate-pulse">
                  <img
                    src={liveStream.broadcasterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'}
                    alt={liveStream.broadcasterName}
                    className="w-full h-full rounded-full object-cover border-2 border-[#090C15]"
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black text-white border-2 border-[#090C15] uppercase tracking-wider animate-pulse shadow-lg">
                  LIVE
                </span>
              </div>

              <div className="text-center">
                <h3 className="text-base font-black text-white">{liveStream.broadcasterName}</h3>
                <p className="text-xs text-purple-400 font-bold mt-0.5">@{liveStream.broadcasterUsername || 'broadcaster'}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Connecting to live stream…</span>
              </div>

              <div className="flex items-center gap-1.5 h-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="w-1.5 bg-red-500/60 rounded-full animate-bounce" style={{ height: `${12 + (i % 3) * 6}px`, animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── No camera / Presenter-only mode ── */}
          {noCamera && !isEnded && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-[#0B0F1C] to-slate-950">
              {/* Large broadcaster avatar */}
              <div className="relative mb-5">
                <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-2xl shadow-red-600/40 animate-pulse">
                  <img
                    src={liveStream.broadcasterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'}
                    alt={liveStream.broadcasterName}
                    className="w-full h-full rounded-full object-cover border-2 border-[#090C15]"
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-600 text-[10px] font-black text-white border-2 border-[#090C15] uppercase tracking-wider shadow-lg">
                  🔴 LIVE
                </span>
              </div>

              <h3 className="text-lg font-black text-white mb-1">{liveStream.broadcasterName}</h3>
              <p className="text-xs text-purple-400 font-bold mb-1">@{liveStream.broadcasterUsername || 'broadcaster'}</p>
              <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 max-w-xs truncate mb-4">
                {liveStream.title || 'Live Broadcast Session'}
              </div>

              {/* Camera off info */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 mb-4">
                <CameraOff className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>
                  Camera feed requires both users to be on the <strong className="text-white">same network</strong> or use the <strong className="text-purple-300">desktop app</strong> for P2P video.
                </span>
              </div>

              {/* Audio-only soundwave animation */}
              <div className="flex items-end gap-1.5 h-10 mb-4">
                {[...Array(9)].map((_, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-red-600 to-rose-400 animate-bounce"
                    style={{ height: `${16 + Math.sin(i * 0.8) * 12}px`, animationDelay: `${i * 0.1}s`, animationDuration: `${0.6 + (i % 3) * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Audio & chat streaming active</p>

              {/* Retry button */}
              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all active:scale-95"
              >
                <Wifi className="w-3.5 h-3.5" />
                Retry Video Connection
              </button>
            </div>
          )}

          {/* ── Broadcast Ended Overlay ── */}
          {isEnded && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-3 animate-pulse">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">Live Broadcast Ended</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {liveStream.broadcasterName} has ended the live stream. Thanks for watching!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg transition-all"
              >
                Close Viewer
              </button>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-[25]" />

          {/* Floating hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {floatingHearts.map((heart) => (
              <div
                key={heart.id}
                style={{ left: `${heart.left}%` }}
                className="absolute bottom-24 text-rose-500 animate-float-heart drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]"
              >
                <Heart className="w-7 h-7 fill-rose-500" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Live Chat ── */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-3">
          <div className="max-h-40 overflow-y-auto no-scrollbar flex flex-col gap-1.5 pr-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 w-fit max-w-[85%] text-xs"
              >
                <span className="font-extrabold text-purple-300">{msg.user}:</span>
                <span className="text-white font-medium break-words">{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Say something nice in live chat..."
                disabled={isEnded}
                className="flex-1 px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-inner select-text cursor-text"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || isEnded}
                className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={handleSendHeart}
              disabled={isEnded}
              className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-90 text-white transition-all shadow-lg shadow-rose-600/40"
              title="Send Heart Reaction"
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveViewerModal;
