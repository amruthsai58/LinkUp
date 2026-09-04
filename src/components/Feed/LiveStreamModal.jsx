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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';
import { realtime } from '../../services/realtimeService';

export const LiveStreamModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const activeUser = user || CURRENT_USER;

  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('Chill Live Stream & Coding Session 💻⚡');
  const [viewersCount, setViewersCount] = useState(1284);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Rahul Kumar', text: 'Hey bro! Nice live stream 🔥' },
    { id: 2, user: 'Priya Sharma', text: 'Audio is super clear! 🎧' },
    { id: 3, user: 'Kiran Gowda', text: 'Which project are we coding today?' },
    { id: 4, user: 'Ananya Reddy', text: 'Greetings from Chennai! 🚀' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Request actual camera or simulated stream
  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.log('Using simulated camera broadcast feed', err);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Start / Stop broadcast and listen to real-time viewer interactions
  useEffect(() => {
    if (!isLive) return;

    const streamInfo = {
      id: `stream-${Date.now()}`,
      broadcasterId: activeUser.id,
      broadcasterName: activeUser.name,
      broadcasterUsername: activeUser.username,
      broadcasterAvatar: activeUser.avatar,
      title: streamTitle,
      linkupId: activeUser.linkupId,
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
          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 24px sans-serif';
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

    // Heartbeat interval every 15s to keep stream active and broadcast to any freshly joined friends
    const heartbeatInterval = setInterval(() => {
      realtime.broadcast('LIVE_STREAM_STARTED', {
        ...streamInfo,
        peerId: realtime.peerId,
        broadcasterPeerId: realtime.peerId,
        isLive: true,
      });
    }, 15000);

    // Subscribe to incoming comments from real viewers
    const unsubComment = realtime.subscribe('LIVE_STREAM_COMMENT', (payload) => {
      if (payload && payload.comment) {
        setChatMessages((prev) => [...prev.slice(-25), payload.comment]);
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
      id: Date.now(),
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
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), user: activeUser.name, text: inputMsg },
    ]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[820px] bg-[#070A12] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
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
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-slate-800 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Stage Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Simulated HD Live Broadcast Video or Real User WebCam */}
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
              poster="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-slate-500">
                <VideoOff className="w-10 h-10" />
              </div>
              <span className="text-xs font-bold">Camera is Off</span>
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
                <h4 className="text-xs font-bold leading-snug">{streamTitle}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Host: {activeUser.name} (@{activeUser.username})</p>
              </div>
            ) : (
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Give your live stream a title..."
                className="w-full px-3.5 py-2.5 bg-black/70 backdrop-blur-md border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
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
                onClick={() => setIsCameraOn(!isCameraOn)}
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
                onClick={() => setIsMicOn(!isMicOn)}
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
                <Radio className="w-4 h-4" />
                <span>Go Live Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLive(false);
                  onClose();
                }}
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
