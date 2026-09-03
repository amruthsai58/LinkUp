import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  Pause,
  Play,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const HighlightViewerModal = ({
  highlight,
  isOpen,
  onClose,
  onOpenEditModal,
  onDeleteHighlight,
  onUpdateHighlightStories,
}) => {
  const { user } = useAuth();
  const activeUser = user || CURRENT_USER;
  const fileInputRef = useRef(null);

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Sample default memories
  const DEFAULT_HIGHLIGHT_STORIES = {
    'hl-1': [
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        caption: 'Sunset by the lakeside 🌅✨',
        time: '3d ago',
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        caption: 'Coffee and good books ☕📖',
        time: '5d ago',
      },
    ],
    'hl-2': [
      {
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
        caption: 'Kudremukha mountain peak trek 🏔️🌿',
        time: '1w ago',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        caption: 'Goa beach serenity 🌊🌴',
        time: '2w ago',
      },
    ],
    'hl-3': [
      {
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        caption: 'Late night coding & system design 💻⚡',
        time: '4d ago',
      },
      {
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        caption: 'Building microservices with Java & Redis 🚀',
        time: '6d ago',
      },
    ],
    'hl-4': [
      {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        caption: 'Hackathon team reunion! 🎉👥',
        time: '2w ago',
      },
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        caption: 'Weekend campus hangout ☕💖',
        time: '3w ago',
      },
    ],
  };

  const stories = highlight?.stories && highlight.stories.length > 0
    ? highlight.stories
    : (highlight && DEFAULT_HIGHLIGHT_STORIES[highlight.id]) || [
        {
          url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
          caption: `${highlight?.name} memories ✨`,
          time: 'Recently',
        },
      ];

  const currentStory = stories[activeStoryIndex] || stories[0];

  useEffect(() => {
    if (!isOpen) {
      setActiveStoryIndex(0);
      setProgress(0);
      setMenuOpen(false);
      return;
    }

    if (isPaused || menuOpen) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2.5; // 4 second duration per slide
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, menuOpen, activeStoryIndex, stories.length, onClose]);

  if (!isOpen || !highlight) return null;

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newSlides = files.map((file) => {
      const isVideo = file.type.startsWith('video');
      const objectUrl = URL.createObjectURL(file);
      return {
        id: `story-${Date.now()}-${Math.random()}`,
        url: objectUrl,
        type: isVideo ? 'video' : 'image',
        caption: `Added to ${highlight.name}`,
        time: 'Just now',
      };
    });

    const updatedStories = [...stories, ...newSlides];
    onUpdateHighlightStories(highlight.id, updatedStories);
    setActiveStoryIndex(stories.length);
    setProgress(0);
    e.target.value = '';
  };

  const handleDeleteCurrentSlide = () => {
    if (stories.length <= 1) {
      onDeleteHighlight(highlight.id);
      onClose();
      return;
    }
    const updated = stories.filter((_, idx) => idx !== activeStoryIndex);
    onUpdateHighlightStories(highlight.id, updated);
    setActiveStoryIndex(Math.max(0, activeStoryIndex - 1));
    setProgress(0);
    setMenuOpen(false);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    alert(`Reply sent: "${replyText}"`);
    setReplyText('');
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-sm h-[86vh] max-h-[760px] bg-[#070A12] border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Top Progress Bars */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{
                    width:
                      idx < activeStoryIndex
                        ? '100%'
                        : idx === activeStoryIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header Row */}
          <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white drop-shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-400 flex items-center justify-center text-sm shadow-md">
                <span>{highlight.icon}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{highlight.name}</span>
                  <span className="text-slate-400 text-[10px] font-normal">• {currentStory?.time || 'Recent'}</span>
                </h4>
                <p className="text-[10px] text-slate-300">@{activeUser.username}</p>
              </div>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-1.5">
              {/* Add Photo / Video Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                title="Add Photos / Videos to Highlight"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Pause / Play */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>

              {/* 3-dots Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 z-40 shadow-2xl text-xs flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenEditModal(highlight);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold text-left"
                    >
                      <Edit className="w-3.5 h-3.5 text-purple-400" />
                      <span>Edit Highlight</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold text-left"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Add Photos/Videos</span>
                    </button>

                    <button
                      onClick={handleDeleteCurrentSlide}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Delete Slide</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteHighlight(highlight.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 font-semibold text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Highlight</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Media Stage */}
          <div
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
          >
            {currentStory.type === 'video' ? (
              <video
                src={currentStory.url}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentStory.url}
                alt="highlight story"
                className="w-full h-full object-cover"
              />
            )}

            {/* Navigation click hotspots */}
            <div
              onClick={handlePrev}
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-20"
            />
            <div
              onClick={handleNext}
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-20"
            />

            {/* Caption Overlay */}
            {currentStory.caption && (
              <div className="absolute bottom-20 inset-x-4 z-20 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium text-center">
                {currentStory.caption}
              </div>
            )}
          </div>

          {/* Bottom Reply Bar */}
          <div className="p-3 bg-[#0A0D18] border-t border-slate-800/80 z-30 flex items-center gap-2">
            <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Send message..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HighlightViewerModal;
