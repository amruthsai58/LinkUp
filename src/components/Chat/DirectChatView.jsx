import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Camera,
  Mic,
  Smile,
  Send,
  Sparkles,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const DirectChatView = () => {
  const { user } = useAuth();
  const { activeConversation, sendDirectMessage, setActiveTab } = useSocial();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const conv = activeConversation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conv) return;
    sendDirectMessage(conv.id, inputText);
    setInputText('');
  };

  if (!conv) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active conversation selected.</p>
        <button
          onClick={() => setActiveTab('messages')}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-xl text-white text-xs font-bold"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[82vh] max-h-[800px] bg-[#090C15] rounded-3xl border border-slate-800 overflow-hidden select-none text-slate-100 shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <img
            src={conv.friend.avatar}
            alt={conv.friend.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">{conv.friend.name}</h3>
              {conv.friend.linkupId && (
                <span className="px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300">
                  {conv.friend.linkupId}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active now
            </p>
          </div>
        </div>

        {/* Call & Video Call Icons */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            type="button"
            onClick={() => alert(`Starting Voice Call with ${conv.friend.name}...`)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Audio Call"
          >
            <Phone className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => alert(`Starting Video Call with ${conv.friend.name}...`)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message History Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
        {/* Date Pill */}
        <div className="flex justify-center my-1">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-semibold text-slate-400">
            Today
          </span>
        </div>

        {conv.messages.map((m) => {
          const isMe = user ? m.senderId === user.id : (m.senderId === CURRENT_USER.id || m.senderId === 'user-01');

          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={conv.friend.avatar}
                  alt={conv.friend.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                />
              )}

              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white rounded-br-sm'
                    : 'bg-slate-800/90 text-slate-100 rounded-bl-sm border border-slate-700/60'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <span
                  className={`block text-[9px] mt-1 ${
                    isMe ? 'text-purple-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar Matching Screenshot */}
      <form
        onSubmit={handleSend}
        className="p-2.5 px-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2"
      >
        {/* Blue Camera Button */}
        <button
          type="button"
          onClick={() => alert('Camera Photo Attachment')}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Input field */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-4 py-2 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />

        {/* Mic, Sticker, Send buttons */}
        <button
          type="button"
          onClick={() => alert('Audio message recorded')}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setInputText((prev) => prev + ' 🚀')}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <Smile className="w-4 h-4" />
        </button>

        {inputText.trim() && (
          <button
            type="submit"
            className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all scale-105"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
};

export default DirectChatView;
