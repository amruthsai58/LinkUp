import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Radio,
  Heart,
  Users,
  Send,
  MessageCircle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { realtime } from '../../services/realtimeService';

export const LiveViewerModal = ({ liveStream, isOpen, onClose }) => {
  const { user } = useAuth();
  const { addNotification } = useSocial();

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Rahul Kumar', text: 'Hey! Glad you are live 🔥' },
    { id: 2, user: 'Priya Sharma', text: 'Audio and video are crisp! 🎧' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [viewersCount, setViewersCount] = useState(148);
  const [isMuted, setIsMuted] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isEnded, setIsEnded] = useState(false);

  const videoRef = useRef(null);
  const callRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [hasLiveVideo, setHasLiveVideo] = useState(false);

  useEffect(() => {
    if (!isOpen || !liveStream) return;

    setIsEnded(false);
    setHasLiveVideo(false);

    // Resolve broadcaster's exact WebRTC peer ID
    const targetPeerId =
      liveStream.peerId ||
      liveStream.broadcasterPeerId ||
      formatPeerId(liveStream.linkupId || liveStream.broadcasterUsername || liveStream.broadcasterId);

    // Connect to broadcaster via WebRTC Call
    if (targetPeerId) {
      const call = realtime.watchLiveStream(targetPeerId, (remoteStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
          videoRef.current
            .play()
            .then(() => setHasLiveVideo(true))
            .catch(() => setHasLiveVideo(true));
        }
      });
      callRef.current = call;
    }

    // Subscribe to real-time comments from this live stream
    const unsubscribeComments = realtime.subscribe('LIVE_STREAM_COMMENT', (payload) => {
      if (payload && payload.comment) {
        setChatMessages((prev) => [...prev.slice(-25), payload.comment]);
      }
    });

    // Subscribe to real-time hearts from viewers
    const unsubscribeHearts = realtime.subscribe('LIVE_STREAM_HEART', () => {
      triggerHeartBurst();
    });

    // Subscribe to live ended announcement
    const unsubscribeEnded = realtime.subscribe('LIVE_STREAM_STOPPED', (payload) => {
      if (
        payload &&
        (payload.broadcasterId === liveStream.broadcasterId ||
          payload.broadcasterId === liveStream.linkupId)
      ) {
        setIsEnded(true);
      }
    });

    return () => {
      unsubscribeComments();
      unsubscribeHearts();
      unsubscribeEnded();
      if (callRef.current) {
        try {
          callRef.current.close();
        } catch (e) {}
      }
      if (videoRef.current?.srcObject) {
        try {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        } catch (e) {}
      }
    };
  }, [isOpen, liveStream]);

  if (!isOpen || !liveStream) return null;

  const triggerHeartBurst = () => {
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 65 + 15,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1800);
  };

  const handleSendHeart = () => {
    triggerHeartBurst();
    realtime.sendLiveHeart(liveStream.id, {
      name: user?.name || 'Viewer',
      avatar: user?.avatar,
    });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newComment = {
      id: Date.now(),
      user: user?.name || 'You',
      text: inputMsg.trim(),
    };

    setChatMessages((prev) => [...prev.slice(-25), newComment]);
    realtime.sendLiveComment(liveStream.id, newComment);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 sm:bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg h-full sm:h-[92dvh] sm:max-h-[820px] bg-[#070A12] border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top Floating Header */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Broadcaster Avatar & Name */}
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
                <h3 className="text-sm font-extrabold text-white drop-shadow">
                  {liveStream.broadcasterName}
                </h3>
                <p className="text-[11px] text-slate-300 drop-shadow truncate max-w-[180px]">
                  {liveStream.title || 'Live Stream'}
                </p>
              </div>
            </div>

            {/* LIVE badge & Viewers */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{viewersCount}</span>
            </div>
          </div>

          {/* Right controls: Mute & Close */}
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

        {/* Video Canvas Stage */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Ambient Video Player */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            onLoadedData={() => setHasLiveVideo(true)}
            onPlaying={() => setHasLiveVideo(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              hasLiveVideo ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />

          {/* High-quality Broadcaster Live Stage Visualizer */}
          {!hasLiveVideo && !isEnded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-[#0B0F1C] to-slate-950">
              {/* Pulsing Avatar with Glowing Ring */}
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-2xl shadow-red-600/40 animate-pulse">
                  <img
                    src={
                      liveStream.broadcasterAvatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
                    }
                    alt={liveStream.broadcasterName}
                    className="w-full h-full rounded-full object-cover border-2 border-[#090C15]"
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black text-white border-2 border-[#090C15] uppercase tracking-wider animate-pulse shadow-lg">
                  LIVE
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white mb-1">
                {liveStream.broadcasterName}
              </h3>
              <p className="text-xs text-purple-400 font-bold mb-2">
                @{liveStream.broadcasterUsername || 'broadcaster'}
              </p>
              <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 max-w-xs truncate mb-4">
                {liveStream.title || 'Live Broadcast Session'}
              </div>

              {/* Animated Soundwave Equalizer Bars */}
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s] h-4" />
                <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s] h-6" />
                <span className="w-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.45s] h-3" />
                <span className="w-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.2s] h-5" />
                <span className="w-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.35s] h-4" />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-medium">
                Live audio & video streaming active
              </span>
            </div>
          )}

          {/* Fallback ambient visualizer if camera stream loading */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Broadcast Ended Overlay */}
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

          {/* Floating Live Heart Animations */}
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

        {/* Live Chat Overlay & Reply Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-3">
          {/* Scrolling Live Comments */}
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

          {/* Chat input + Heart Button */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Say something nice in live chat..."
                disabled={isEnded}
                className="flex-1 px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-inner"
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
