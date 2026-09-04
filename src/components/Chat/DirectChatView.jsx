import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Camera,
  Mic,
  Smile,
  Send,
  Sparkles,
  Check,
  CheckCheck,
  Trash2,
  RotateCcw,
  MoreVertical,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const DirectChatView = () => {
  const { user } = useAuth();
  const {
    activeConversation,
    sendDirectMessage,
    unsendMessage,
    markConversationAsSeen,
    setActiveTab,
  } = useSocial();
  const [inputText, setInputText] = useState('');
  const [unsendConfirmId, setUnsendConfirmId] = useState(null);
  const messagesEndRef = useRef(null);

  const conv = activeConversation;

  // Strictly deduplicate messages to ensure no duplicate message bubbles appear
  const deduplicatedMessages = useMemo(() => {
    if (!conv?.messages) return [];
    return conv.messages.reduce((acc, m) => {
      if (!m) return acc;
      const isDuplicate = acc.some(
        (existing) =>
          (m.id && existing.id === m.id) ||
          (existing.senderId === m.senderId &&
           existing.text === m.text &&
           Math.abs((existing.timestamp || 0) - (m.timestamp || 0)) < 4000)
      );
      if (!isDuplicate) {
        acc.push(m);
      }
      return acc;
    }, []);
  }, [conv?.messages]);

  // Mark all unread incoming messages as seen as soon as user opens or views this chat
  useEffect(() => {
    if (conv?.id) {
      markConversationAsSeen(conv.id);
    }
  }, [conv?.id, conv?.messages?.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conv) return;
    sendDirectMessage(conv.id, inputText);
    setInputText('');
  };

  const handleUnsend = (messageId) => {
    if (!conv || !messageId) return;
    unsendMessage(conv.id, messageId);
    setUnsendConfirmId(null);
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

        {deduplicatedMessages.map((m, idx) => {
          const isMe = user ? m.senderId === user.id : (m.senderId === CURRENT_USER.id || m.senderId === 'user-01');
          const isLastMessage = idx === deduplicatedMessages.length - 1;

          return (
            <div
              key={m.id || idx}
              className={`relative group flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={conv.friend.avatar}
                  alt={conv.friend.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                />
              )}

              {/* Unsend button for sent messages (visible on hover or tap) */}
              {isMe && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center mb-1">
                  <button
                    type="button"
                    onClick={() => setUnsendConfirmId(unsendConfirmId === m.id ? null : m.id)}
                    className="p-1.5 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Unsend message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Unsend Confirmation Popup */}
              {unsendConfirmId === m.id && (
                <div className="absolute -top-12 right-2 bg-[#0E1322] border border-red-500/40 rounded-2xl p-2 px-3 shadow-2xl z-30 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[11px] text-slate-200 font-semibold">Unsend for everyone?</span>
                  <button
                    type="button"
                    onClick={() => handleUnsend(m.id)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold shadow transition-all"
                  >
                    Unsend
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnsendConfirmId(null)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex flex-col items-end max-w-[78%]">
                <div
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white rounded-br-sm'
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-sm border border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <div
                    className={`flex items-center gap-1.5 text-[9px] mt-1 ${
                      isMe ? 'text-purple-200 justify-end' : 'text-slate-400 justify-start'
                    }`}
                  >
                    <span>{m.time}</span>
                    {/* Seen Status Indicator for sender */}
                    {isMe && (
                      <span className="inline-flex items-center gap-0.5">
                        {m.seen ? (
                          <span className="inline-flex items-center gap-0.5 text-sky-300 font-bold" title={`Seen ${m.seenTime ? `at ${m.seenTime}` : ''}`}>
                            <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                            <span className="text-[8px] uppercase tracking-wider">Seen</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-purple-200/70" title="Sent">
                            <Check className="w-3.5 h-3.5 text-purple-200/70 stroke-[2]" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Prominent Seen Tag for latest message */}
                {isMe && isLastMessage && m.seen && (
                  <div className="text-[10px] text-sky-400 font-bold flex items-center gap-1 mt-1 mr-1 animate-in fade-in">
                    <CheckCheck className="w-3 h-3 text-sky-400" />
                    <span>Seen {m.seenTime ? `• ${m.seenTime}` : ''}</span>
                  </div>
                )}
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
