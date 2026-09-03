import React, { useState } from 'react';
import {
  X,
  Send,
  Mic,
  Image,
  Music,
  Radio,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';

export const ChatDrawer = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    friends,
    activeChatFriend,
    setActiveChatFriend,
    chatMessages,
    sendChatMessage,
  } = useSocial();

  const { user } = useAuth();
  const { currentTrack, togglePlay, createListenTogetherRoom } = useMusic();

  const [inputMessage, setInputMessage] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  if (!isChatOpen) return null;

  const currentFriend = activeChatFriend || friends[0];
  const messages = chatMessages[currentFriend?.id] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendChatMessage(currentFriend.id, { text: inputMessage });
    setInputMessage('');

    // Simulate smart auto-reply
    setTimeout(() => {
      sendChatMessage(currentFriend.id, {
        senderId: currentFriend.id,
        text: 'That sounds fantastic! Listening to LinkUp regional music tracks right now 🎶',
      });
    }, 1200);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      sendChatMessage(currentFriend.id, {
        isVoiceNote: true,
        voiceDuration: '0:14',
      });
    }, 1500);
  };

  const handleShareCurrentTrackInChat = () => {
    if (!currentTrack) return;
    sendChatMessage(currentFriend.id, {
      musicTrack: currentTrack,
    });
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 h-[520px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 select-none">
      {/* Chat Header */}
      <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={currentFriend?.avatar}
              alt={currentFriend?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-600"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{currentFriend?.name}</h4>
            <p className="text-[10px] text-emerald-400">Online • Active Now</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() =>
              createListenTogetherRoom(`Listening with ${currentFriend?.name}`)
            }
            className="p-1.5 rounded-lg hover:bg-pink-500/20 hover:text-pink-400 text-slate-400 transition-colors"
            title="Start Listen Together Sync"
          >
            <Radio className="w-4 h-4 animate-pulse text-pink-400" />
          </button>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar bg-slate-950/40">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id || msg.senderId === 'user-01';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                  isMine
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                }`}
              >
                {msg.text && <p>{msg.text}</p>}

                {/* Voice Note Pill */}
                {msg.isVoiceNote && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="p-1.5 rounded-full bg-white/20">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-end gap-0.5 h-4">
                      <div className="w-1 bg-white h-2" />
                      <div className="w-1 bg-white h-4" />
                      <div className="w-1 bg-white h-3" />
                      <div className="w-1 bg-white h-4" />
                      <div className="w-1 bg-white h-1" />
                    </div>
                    <span className="text-[10px] font-mono">{msg.voiceDuration}</span>
                  </div>
                )}

                {/* Embedded Shared Regional Song Card */}
                {msg.musicTrack && (
                  <div
                    onClick={() => togglePlay(msg.musicTrack)}
                    className="mt-1 p-2 rounded-xl bg-black/40 border border-purple-400/40 cursor-pointer flex items-center gap-2"
                  >
                    <img
                      src={msg.musicTrack.coverUrl}
                      alt="album"
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-bold text-white truncate">
                        {msg.musicTrack.title}
                      </h5>
                      <p className="text-[9px] text-purple-300">
                        {msg.musicTrack.movie} ({msg.musicTrack.language.toUpperCase()})
                      </p>
                    </div>
                    <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  </div>
                )}
              </div>

              <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                {msg.time || 'Just now'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Chat Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={handleShareCurrentTrackInChat}
          className="p-1.5 rounded-lg hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
          title="Share Currently Playing Song"
        >
          <Music className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSendVoiceNote}
          className={`p-1.5 rounded-lg transition-colors ${
            isRecordingVoice
              ? 'bg-rose-500 text-white animate-pulse'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Send Voice Note"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-white focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default ChatDrawer;
