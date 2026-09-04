import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Music,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const PostCard = ({ post }) => {
  const { user: authUser } = useAuth();
  const { reactToPost, addComment, sharePost, deletePost, setActiveTab, setViewingUser, viewUserProfile } = useSocial();
  const { tracks, currentTrack, isPlaying, togglePlay } = useMusic();

  const user = authUser || CURRENT_USER;

  const handleAuthorClick = () => {
    const isSelf = Boolean(
      authUser &&
        ((post.author?.id && post.author.id === authUser.id) ||
          (post.author?.username &&
            authUser.username &&
            post.author.username.toLowerCase() === authUser.username.toLowerCase()) ||
          (post.author?.linkupId &&
            authUser.linkupId &&
            post.author.linkupId.toLowerCase() === authUser.linkupId.toLowerCase()))
    );

    if (isSelf) {
      if (setViewingUser) setViewingUser(null);
      setActiveTab('profile');
    } else {
      if (viewUserProfile) {
        viewUserProfile(post.author);
      } else {
        if (setViewingUser) setViewingUser(post.author);
        setActiveTab('profile');
      }
    }
  };

  const [isLiked, setIsLiked] = useState(post.userReaction === 'like' || post.userReaction === 'love');
  const [likesCount, setLikesCount] = useState(post.reactions?.like || 1200);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const attachedTrack = post.musicTrackId
    ? tracks.find((t) => t.id === post.musicTrackId)
    : null;

  const isCurrentAudioPlaying = isPlaying && currentTrack?.id === attachedTrack?.id;

  const handleLikeToggle = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    reactToPost(post.id, 'like');
  };

  // Instagram Double-Tap on photo to like
  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      reactToPost(post.id, 'like');
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const handleDelete = () => {
    deletePost(post.id);
    setMenuOpen(false);
    setShowDeleteConfirm(false);
  };

  const handleShare = () => {
    sharePost(post.id);
    alert('Link copied & post shared!');
  };

  const authorHandle = post.author.username || post.author.name.toLowerCase().replace(/\s+/g, '.');

  return (
    <article
      data-post-music-id={post.musicTrackId || ''}
      className="bg-[#090C15] border border-slate-850 rounded-3xl overflow-hidden shadow-2xl select-none text-slate-100 transition-all hover:border-slate-800 relative mb-2"
    >
      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
          <div className="p-3 rounded-full bg-red-500/20 text-red-400 mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Delete this post?</h4>
          <p className="text-xs text-slate-300 mb-4 max-w-xs">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:red-500 text-white text-xs font-bold shadow-lg"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Instagram Header Row: Avatar + Username/Handle + 3-dots */}
      <div className="p-3 px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            onClick={handleAuthorClick}
            className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-purple-500 to-pink-500 cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full rounded-full object-cover border border-[#090C15]"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3
                onClick={handleAuthorClick}
                className="text-xs sm:text-sm font-bold text-white hover:text-purple-400 cursor-pointer transition-colors"
              >
                {authorHandle}
              </h3>
              <span className="text-[11px] text-slate-500">• {post.timestamp}</span>
            </div>

            {/* Attached Song / Location Subtitle in Instagram Style */}
            {attachedTrack ? (
              <button
                type="button"
                onClick={() => togglePlay(attachedTrack)}
                className="text-[10px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors text-left"
              >
                <Music className={`w-3 h-3 text-pink-400 ${isCurrentAudioPlaying ? 'animate-pulse' : ''}`} />
                <span className="truncate max-w-[180px]">
                  {attachedTrack.title} • {attachedTrack.movie}
                </span>
                {isCurrentAudioPlaying && (
                  <span className="text-purple-400 font-bold text-[9px]">(Playing)</span>
                )}
              </button>
            ) : post.location ? (
              <p className="text-[10px] text-slate-400 truncate">{post.location}</p>
            ) : null}
          </div>
        </div>

        {/* 3-dots Options Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 z-20 shadow-2xl text-xs flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsSaved(!isSaved);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-medium"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>{isSaved ? 'Unsave' : 'Save Post'}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setMenuOpen(false);
                  alert('Link copied to clipboard!');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-medium"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Share Link</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instagram Media Display (Full width with Double-Tap Heart Burst) */}
      {post.media && post.media.length > 0 && (
        <div
          onDoubleClick={handleDoubleTap}
          className="relative w-full aspect-square sm:aspect-[4/3] max-h-[460px] bg-black overflow-hidden flex items-center justify-center cursor-pointer select-none"
        >
          {post.media[0].type === 'video' ? (
            <>
              <video
                src={post.media[0].url}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoMuted(!isVideoMuted);
                }}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:scale-110 transition-transform"
              >
                {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </>
          ) : (
            <img
              src={post.media[0].url}
              alt="post media"
              className="w-full h-full object-cover"
            />
          )}

          {/* Instagram Double-Tap Pop Heart Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-300">
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl opacity-90 animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Instagram Action Icons Bar (Heart, Comment, Share, Bookmark) */}
      <div className="p-3 px-3.5 flex items-center justify-between text-slate-100">
        <div className="flex items-center gap-4">
          {/* Heart / Like */}
          <button
            type="button"
            onClick={handleLikeToggle}
            className="hover:scale-115 active:scale-90 transition-transform text-slate-100"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-100'
              }`}
            />
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="hover:scale-115 active:scale-90 transition-transform text-slate-100"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Share (Paper Plane style) */}
          <button
            type="button"
            onClick={handleShare}
            className="hover:scale-115 active:scale-90 transition-transform text-slate-100 -rotate-12"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {/* Bookmark / Save */}
        <button
          type="button"
          onClick={() => setIsSaved(!isSaved)}
          className="hover:scale-115 active:scale-90 transition-transform text-slate-100"
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'text-purple-400 fill-purple-400' : 'text-slate-100'}`} />
        </button>
      </div>

      {/* Instagram Likes Counter Line */}
      <div className="px-3.5 pb-1">
        <p className="text-xs font-bold text-white cursor-pointer hover:underline">
          {likesCount.toLocaleString()} likes
        </p>
      </div>

      {/* Instagram Caption Line (Author username in bold + caption text) */}
      {post.content && (
        <div className="px-3.5 pb-2 text-xs sm:text-sm leading-snug">
          <span
            onClick={handleAuthorClick}
            className="font-bold text-white mr-1.5 cursor-pointer hover:underline"
          >
            {authorHandle}
          </span>
          <span className="text-slate-200 whitespace-pre-line font-normal">
            {post.content}
          </span>
        </div>
      )}

      {/* Instagram Comments Link & Preview */}
      <div className="px-3.5 pb-3 flex flex-col gap-1 text-xs">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="text-slate-500 text-[11px] text-left hover:text-slate-400 w-fit"
        >
          View all {post.comments?.length || 84} comments
        </button>

        {/* Top Preview Comment */}
        {post.comments && post.comments.length > 0 && (
          <div className="flex items-start gap-1.5 text-[11px]">
            <span className="font-bold text-white">
              {post.comments[0].author.username || post.comments[0].author.name.toLowerCase().replace(/\s+/g, '.')}
            </span>
            <span className="text-slate-300 truncate">{post.comments[0].text}</span>
          </div>
        )}
      </div>

      {/* Expanded Comments Drawer with Quick Emoji Reactions */}
      {showComments && (
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-col gap-3">
          {/* Quick emoji pills */}
          <div className="flex items-center gap-2 text-lg">
            {['❤️', '🙌', '🔥', '👏', '😍', '🚀'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setCommentText((prev) => prev + emoji)}
                className="hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <img
              src={user.avatar || CURRENT_USER.avatar}
              alt={user.name || CURRENT_USER.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/60 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 disabled:opacity-40"
            >
              Post
            </button>
          </form>

          {/* Comment list */}
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {post.comments?.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-xs">
                <img
                  src={c.author.avatar}
                  alt={c.author.name}
                  className="w-6 h-6 rounded-full object-cover mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white mr-1.5">{c.author.name}</span>
                  <span className="text-slate-300">{c.text}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{c.timestamp || 'Just now'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
