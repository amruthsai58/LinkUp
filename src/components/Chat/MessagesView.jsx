import React, { useState } from 'react';
import {
  Search,
  Edit,
  Plus,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const MessagesView = () => {
  const { conversations, setActiveConversation, setActiveTab, friends } = useSocial();
  const { user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const user = authUser || CURRENT_USER;

  const filteredConversations = conversations.filter((c) =>
    c.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChat = (conv) => {
    setActiveConversation(conv);
    setActiveTab('chat_direct');
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-20 select-none text-slate-100 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Messages</h2>
        <button
          type="button"
          onClick={() => alert('Start New Chat Conversation')}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="New Message"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-850 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Active Notes / Stories Row */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-2 py-1">
        {/* Your Note */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <div className="relative">
            <img
              src={user.avatar || CURRENT_USER.avatar}
              alt="your note"
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50"
            />
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-purple-600 text-white shadow-md">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Your note</span>
        </div>

        {/* Friend Active Notes */}
        {friends.slice(0, 4).map((f) => (
          <div
            key={f.id}
            onClick={() => {
              const conv = conversations.find((c) => c.friend.name.includes(f.name.split(' ')[0]));
              if (conv) handleOpenChat(conv);
            }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={f.avatar}
                alt={f.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-500 transition-colors"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090C15]" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[60px]">
              {f.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Conversations List */}
      <div className="flex flex-col gap-1 px-1">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleOpenChat(conv)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900/90 cursor-pointer transition-all border border-transparent hover:border-slate-800"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={conv.friend.avatar}
                  alt={conv.friend.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                {conv.friend.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090C15]" />
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{conv.friend.name}</h4>
                <p
                  className={`text-xs truncate mt-0.5 ${
                    conv.unread ? 'text-slate-100 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {conv.lastMessage} <span className="text-slate-500">• {conv.time}</span>
                </p>
              </div>
            </div>

            {/* Unread indicators */}
            {conv.unread && (
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesView;
