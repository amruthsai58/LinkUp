import React, { useState } from 'react';
import {
  X,
  Radio,
  Users,
  Play,
  Pause,
  SkipForward,
  Music,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';

export const ListenTogetherRoom = () => {
  const {
    listenTogetherRoom,
    showListenTogetherModal,
    leaveListenTogetherRoom,
    currentTrack,
    isPlaying,
    togglePlay,
    handleNext,
    currentTime,
    duration,
    formatTime,
  } = useMusic();

  const { user } = useAuth();

  const [roomChat, setRoomChat] = useState([
    { sender: 'Pooja Hegde', text: 'This bassline in Hukum is unreal! 🔥' },
    { sender: 'Vikram Raghavan', text: 'Listen to that drop at 1:20 💥' },
  ]);
  const [chatInput, setChatInput] = useState('');

  if (!showListenTogetherModal || !listenTogetherRoom) return null;

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setRoomChat((prev) => [
      ...prev,
      { sender: user?.name || 'Amruth Sai', text: chatInput },
    ]);
    setChatInput('');
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col gap-6">
        {/* Ambient room background glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {listenTogetherRoom.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hosted by <span className="text-purple-300 font-semibold">{listenTogetherRoom.host}</span>
              </p>
            </div>
          </div>

          <button
            onClick={leaveListenTogetherRoom}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Stage: Synced Song Artwork & Sound Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-800/40 border border-purple-500/20">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border-2 border-purple-500/40">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-1 h-8">
                  <div className="w-1.5 bg-pink-400 animate-equalizer" />
                  <div className="w-1.5 bg-pink-400 animate-equalizer delay-100" />
                  <div className="w-1.5 bg-pink-400 animate-equalizer delay-200" />
                  <div className="w-1.5 bg-pink-400 animate-equalizer delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold uppercase">
              {currentTrack.language} Track
            </span>
            <h4 className="text-lg font-bold text-white truncate mt-1">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-slate-300 truncate">
              {currentTrack.movie} • {currentTrack.singers}
            </p>

            {/* Scrubber Bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Synced Controls */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <button
                onClick={() => togglePlay()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause for all' : 'Play for all'}</span>
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                title="Next synchronized track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listeners Circles */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Listening in this Room ({listenTogetherRoom.listeners.length})</span>
          </h4>
          <div className="flex items-center gap-3">
            {listenTogetherRoom.listeners.map((listener) => (
              <div key={listener.id} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <img
                    src={listener.avatar}
                    alt={listener.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-400 shadow"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <span className="text-[10px] text-slate-300 max-w-[60px] truncate text-center">
                  {listener.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Room Chat Box */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
            {roomChat.map((msg, idx) => (
              <p key={idx} className="text-xs text-slate-300">
                <span className="font-bold text-purple-300">{msg.sender}:</span>{' '}
                <span>{msg.text}</span>
              </p>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Chat with friends in this listening room..."
              className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListenTogetherRoom;
