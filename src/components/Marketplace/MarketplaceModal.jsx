import React, { useState } from 'react';
import {
  X,
  Store,
  Tag,
  MapPin,
  MessageSquare,
  Search,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const MarketplaceModal = () => {
  const {
    marketplaceItems,
    isMarketplaceOpen,
    setIsMarketplaceOpen,
    setIsChatOpen,
    friends,
    setActiveChatFriend,
  } = useSocial();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isMarketplaceOpen) return null;

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleContactSeller = (sellerName) => {
    const friend = friends.find((f) => f.name.includes(sellerName)) || friends[0];
    setActiveChatFriend(friend);
    setIsMarketplaceOpen(false);
    setIsChatOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">LinkUp Marketplace</h3>
                <p className="text-xs text-slate-400">
                  Buy & sell audio gear, instruments, electronics, and accessories
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMarketplaceOpen(false)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search marketplace items, guitars, headphones..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 no-scrollbar">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-800/50 border border-slate-700/60 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-all shadow-lg"
            >
              <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-black">
                  {item.price}
                </span>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{item.location}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Seller: {item.seller}</span>
                  <button
                    onClick={() => handleContactSeller(item.seller)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Seller</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceModal;
