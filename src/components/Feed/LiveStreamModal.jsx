import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Heart,
  MessageCircle,
  Users,
  Send,
  Sparkles,
  Share2,
  Check,
  Minimize2,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';
import { realtime } from '../../services/realtimeService';

export const LiveStreamModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const activeUser = user || CURRENT_USER;

  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('Chill Live Stream & Coding Session 💻⚡');
  const [viewersCount, setViewersCount] = useState(1);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [notifiedFollowers, setNotifiedFollowers] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to your live room! Friends can join anytime 🔴' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [cameraError, setCameraError] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // ─── Request camera + mic on open ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
      setShowExitConfirm(false);
      setCameraReady(false);
      setCameraError(false);
      setIsLive(false);
      // Stop all tracks to release camera hardware
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (typeof window !== 'undefined') {
        window.__linkup_live_stream__ = null;
      }
      return;
    }

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          streamRef.current = stream;
          setCameraReady(true);
          setCameraError(false);
          // Attach to video element (may already be mounted)
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setCameraError(true);
        }
      } catch (err) {
        console.warn('Camera/mic permission denied or unavailable:', err);
        setCameraError(true);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (typeof window !== 'undefined') {
        window.__linkup_live_stream__ = null;
      }
    };
  }, [isOpen]);

  // ─── Re-attach stream whenever videoRef is available or minimized/expanded ─
  useEffect(() => {
    if (isOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, isMinimized, cameraReady]);

  // ─── Camera track toggle ──────────────────────────────────────────────────
  const handleToggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsCameraOn((prev) => !prev);
  };

  // ─── Mic track toggle ─────────────────────────────────────────────────────
  const handleToggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsMicOn((prev) => !prev);
  };

  // Start / Stop broadcast and listen to real-time viewer interactions
  useEffect(() => {
    if (!isLive) return;

    startTimeRef.current = Date.now();

    const streamInfo = {
      id: `stream-${Date.now()}`,
      broadcasterId: activeUser.id,
      broadcasterName: activeUser.name,
      broadcasterUsername: activeUser.username,
      broadcasterAvatar: activeUser.avatar,
      title: streamTitle,
      linkupId: activeUser.linkupId,
      startTime: startTimeRef.current,
      lastHeartbeat: Date.now(),
    };

    let liveStreamMedia = streamRef.current;
    if (!liveStreamMedia) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a0d18';
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔴 LIVE ON LINKUP', 320, 200);
          ctx.fillStyle = '#ffffff';
          ctx.font = '18px sans-serif';
          ctx.fillText(activeUser.name || 'Broadcaster', 320, 240);
        }
        if (canvas.captureStream) {
          liveStreamMedia = canvas.captureStream(15);
        }
      } catch (e) {}
    }

    realtime.startLiveBroadcast(liveStreamMedia, streamInfo);

    // Heartbeat interval every 10s to keep stream active and broadcast to any freshly joined friends
    const heartbeatInterval = setInterval(() => {
      realtime.broadcast('LIVE_STREAM_STARTED', {
        ...streamInfo,
        startTime: startTimeRef.current,
        lastHeartbeat: Date.now(),
        peerId: realtime.peerId,
        broadcasterPeerId: realtime.peerId,
        isLive: true,
      });
    }, 10000);

    // Subscribe to incoming comments from real viewers
    const unsubComment = realtime.subscribe('LIVE_STREAM_COMMENT', (payload) => {
      if (payload && payload.comment) {
        setChatMessages((prev) => [...prev.slice(-25), payload.comment]);
        setViewersCount((v) => Math.max(v, (payload.viewersCount || v) + 1));
      }
    });

    // Subscribe to incoming hearts from real viewers
    const unsubHeart = realtime.subscribe('LIVE_STREAM_HEART', () => {
      triggerHeartBurst();
    });

    return () => {
      clearInterval(heartbeatInterval);
      unsubComment();
      unsubHeart();
      realtime.stopLiveBroadcast(activeUser.id);
    };
  }, [isLive, streamTitle, activeUser]);

  if (!isOpen) return null;

  const triggerHeartBurst = () => {
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 70 + 15,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1800);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const myComment = { id: Date.now(), user: activeUser.name, text: inputMsg };
    setChatMessages((prev) => [...prev, myComment]);
    realtime.broadcast('LIVE_STREAM_COMMENT', {
      streamId: activeUser.id,
      comment: myComment,
    });
    setInputMsg('');
  };

  const handleCopyLink = () => {
    const liveParam = activeUser.linkupId || activeUser.username || activeUser.id;
    const url = `${window.location.origin}${window.location.pathname}?live=${encodeURIComponent(liveParam)}`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      console.warn('Copy live link error:', e);
    }
  };

  const handleNotifyFollowers = () => {
    const liveParam = activeUser.linkupId || activeUser.username || activeUser.id;
    const url = `${window.location.origin}${window.location.pathname}?live=${encodeURIComponent(liveParam)}`;
    // Broadcast a shareable notification via BroadcastChannel so all open tabs/windows see it
    try {
      const shareData = {
        title: `📢 ${activeUser.name} is LIVE on LinkUp!`,
        text: `${activeUser.name} (@${activeUser.username}) just started a live: "${streamTitle}" — join now!`,
        url,
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url).catch(() => {});
      }
    } catch {}
    setNotifiedFollowers(true);
    setTimeout(() => setNotifiedFollowers(false), 4000);
  };

  const handleCloseAttempt = () => {
    if (isLive) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmEndStream = () => {
    setIsLive(false);
    setShowExitConfirm(false);
    setIsMinimized(false);
    onClose();
  };

  // Minimized PiP Floating Bar
  if (isMinimized) {
    return (
      <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 animate-in slide-in-from-bottom duration-200">
        <div className="p-3 bg-[#0A0D18]/95 backdrop-blur-xl border border-red-500/50 rounded-2xl shadow-2xl shadow-red-600/30 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-amber-500 animate-pulse">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-full h-full rounded-full object-cover border border-[#090C15]"
              />
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-red-600 rounded text-[7px] font-black text-white uppercase">
              LIVE
            </span>
          </div>

          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white truncate max-w-[140px]">
                {streamTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-bold">
                {viewersCount} watching
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Broadcasting in background</p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              title="Expand Live Stream"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Expand</span>
            </button>
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
              title="End Stream"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 sm:bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full sm:h-[92dvh] sm:max-h-[820px] bg-[#070A12] border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top Floating Header */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-red-600/50 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>LIVE</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
                Setup Live
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{viewersCount.toLocaleString()}</span>
            </div>

            {/* Share / Copy Live Stream Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-purple-900/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 transition-colors"
              title="Copy Direct Link to invite friends"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[11px]">Share Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isLive && (
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-full bg-black/60 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                title="Minimize (keep live in background)"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCloseAttempt}
              className="p-2 rounded-full bg-black/60 hover:bg-slate-800 text-white backdrop-blur-md transition-colors"
              title="Close Stream"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Stage Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Always keep video mounted so srcObject is never lost */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isCameraOn && cameraReady ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          />

          {/* Camera off placeholder */}
          {!isCameraOn && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-slate-500">
                <VideoOff className="w-10 h-10" />
              </div>
              <span className="text-xs font-bold">Camera is Off</span>
            </div>
          )}

          {/* Camera permission denied */}
          {cameraError && isCameraOn && (
            <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-red-900/30 border-2 border-red-700/40 flex items-center justify-center text-red-400">
                <VideoOff className="w-9 h-9" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Camera Access Denied</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Allow camera &amp; microphone access in your browser settings, then refresh to enable video.</p>
              </div>
            </div>
          )}

          {/* Waiting for camera */}
          {!cameraError && !cameraReady && isCameraOn && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center animate-pulse">
                <Video className="w-7 h-7 text-purple-400" />
              </div>
              <span className="text-xs font-bold text-slate-300">Starting camera…</span>
            </div>
          )}


          {/* Floating animated hearts */}
          {floatingHearts.map((h) => (
            <div
              key={h.id}
              style={{ left: `${h.left}%` }}
              className="absolute bottom-20 pointer-events-none animate-float-heart z-20"
            >
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500 drop-shadow-lg" />
            </div>
          ))}

          {/* Broadcast Title Badge Overlay */}
          <div className="absolute top-16 inset-x-4 z-20">
            {isLive ? (
              <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold leading-snug">{streamTitle}</h4>
                  <button
                    type="button"
                    onClick={handleNotifyFollowers}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                      notifiedFollowers
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-white/10 border-white/20 text-white hover:bg-purple-600/40 hover:border-purple-400'
                    }`}
                    title="Share live link with followers"
                  >
                    {notifiedFollowers ? (
                      <><Check className="w-3 h-3" /><span>Notified!</span></>
                    ) : (
                      <><Share2 className="w-3 h-3 text-purple-400" /><span>Notify Followers</span></>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Host: {activeUser.name} (@{activeUser.username}) • {activeUser.linkupId}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Give your live stream a title..."
                  className="w-full px-3.5 py-2.5 bg-black/70 backdrop-blur-md border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-xl"
                />
                <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-300">
                  💡 Tap <strong>"Go Live Now"</strong> below to begin broadcasting to all your friends!
                </div>
              </div>
            )}
          </div>

          {/* Live Chat Overlay Stream */}
          <div className="absolute bottom-20 inset-x-4 max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-1.5 z-20 pointer-events-auto">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className="w-fit max-w-[85%] px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white animate-in slide-in-from-bottom-2 duration-150"
              >
                <span className="font-bold text-purple-300 mr-1.5">{msg.user}:</span>
                <span className="text-slate-100">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Exit Confirmation Dialog */}
          {showExitConfirm && (
            <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
              <div className="w-full max-w-sm p-5 bg-[#0C101B] border border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Broadcast in Progress</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Do you want to minimize and stay live while browsing, or end the stream completely?
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false);
                      setIsMinimized(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>Minimize & Stay Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEndStream}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-colors"
                  >
                    End Live Broadcast
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Broadcast Bar */}
        <div className="p-3 bg-[#0A0D18] border-t border-slate-800 flex flex-col gap-2.5 z-30">
          {/* Quick Chat Input and Heart Reaction */}
          {isLive ? (
            <div className="flex items-center gap-2">
              <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Say something in live chat..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-850 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex-shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <button
                type="button"
                onClick={triggerHeartBurst}
                className="p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 active:scale-125 transition-transform"
                title="Send Heart"
              >
                <Heart className="w-5 h-5 fill-rose-500" />
              </button>
            </div>
          ) : null}

          {/* Broadcast Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Camera Toggle */}
              <button
                type="button"
                onClick={handleToggleCamera}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isCameraOn
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-red-500/20 border-red-500/40 text-red-400'
                }`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              {/* Mic Toggle */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isMicOn
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-red-500/20 border-red-500/40 text-red-400'
                }`}
                title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Go Live / End Stream Main Button */}
            {!isLive ? (
              <button
                type="button"
                onClick={() => setIsLive(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 flex items-center justify-center gap-1.5 transition-transform active:scale-98"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Go Live Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs border border-slate-700 transition-colors"
              >
                End Live Stream
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamModal;
