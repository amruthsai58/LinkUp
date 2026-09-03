import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Calendar,
  Shield,
  Edit3,
  Users,
  Image as ImageIcon,
  Check,
  Music,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { PostCard } from '../Feed/PostCard';

export const ProfileModal = () => {
  const { user, updateUserProfile } = useAuth();
  const { isProfileOpen, setIsProfileOpen, profileUserId, friends, posts } = useSocial();

  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'about' | 'friends' | 'photos'
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || '');

  if (!isProfileOpen) return null;

  // Find target user or current user
  const targetFriend = profileUserId
    ? friends.find((f) => f.id === profileUserId)
    : null;

  const profileData = targetFriend
    ? {
        name: targetFriend.name,
        username: targetFriend.username,
        avatar: targetFriend.avatar,
        coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
        bio: 'Passionate music lover and tech enthusiast! Connecting on LinkUp.',
        work: 'Professional at Bengaluru Tech Hub',
        education: 'Engineering Graduate',
        hometown: targetFriend.hometown || 'Bengaluru, India',
        relationshipStatus: 'Single',
        friendsCount: targetFriend.mutualFriends + 120,
      }
    : user;

  const isMyProfile = !profileUserId || profileUserId === user?.id;

  const handleSaveBio = () => {
    updateUserProfile({ bio: bioInput });
    setIsEditingBio(false);
  };

  // Filter user's posts
  const userPosts = posts.filter(
    (p) =>
      p.author.id === (profileUserId || user?.id) ||
      p.author.username === profileData?.username
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-y-auto no-scrollbar flex flex-col">
        {/* Close Modal Button */}
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-800">
          <img
            src={profileData?.coverPhoto}
            alt="cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30 pointer-events-none" />

          {isMyProfile && (
            <button className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/20">
              <Camera className="w-3.5 h-3.5" />
              <span>Edit Cover Photo</span>
            </button>
          )}
        </div>

        {/* Profile Info Header */}
        <div className="px-4 sm:px-8 pb-4 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl flex-shrink-0">
              <img
                src={profileData?.avatar}
                alt={profileData?.name}
                className="w-full h-full object-cover"
              />
              {isMyProfile && (
                <div className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full cursor-pointer shadow">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {profileData?.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">@{profileData?.username}</p>
              <p className="text-xs text-blue-400 font-semibold mt-1">
                {profileData?.friendsCount || 482} Friends • 1.2K Followers
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {isMyProfile ? (
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95">
                Message
              </button>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-4 sm:px-8 py-3">
          {isEditingBio ? (
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-2">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full bg-slate-900 p-2.5 rounded-xl text-xs text-white border border-slate-700 focus:outline-none focus:border-blue-500"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg"
                >
                  Save Bio
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 italic">
              "{profileData?.bio}"
            </p>
          )}
        </div>

        {/* Profile Tabs Navigation */}
        <div className="px-4 sm:px-8 flex items-center gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Timeline & Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            About & Work
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'friends'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Friends ({friends.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-8 flex-1">
          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-4 max-w-xl mx-auto">
              {userPosts.length > 0 ? (
                userPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No timeline posts published yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Work</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {profileData?.work || 'Full Stack Engineer'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Hometown</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {profileData?.hometown || 'Bengaluru, India'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Education</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {profileData?.education || 'VTU Karnataka'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Relationship</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {profileData?.relationshipStatus || 'Single'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3"
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{friend.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      {friend.mutualFriends} mutual friends
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
