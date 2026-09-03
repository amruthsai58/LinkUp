import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  User,
  AtSign,
  FileText,
  Globe,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_USER } from '../../data/mockSocialData';
import { fileToBase64 } from '../../utils/imageUtils';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const activeUser = user || CURRENT_USER;

  const fileInputRef = useRef(null);

  const [name, setName] = useState(activeUser.name || '');
  const [username, setUsername] = useState(activeUser.username || '');
  const [role, setRole] = useState(activeUser.role || activeUser.work || 'Computer Science Student');
  const [subtitle, setSubtitle] = useState(activeUser.subtitle || 'Java Developer | Problem Solver');
  const [bio, setBio] = useState(activeUser.bio || '');
  const [website, setWebsite] = useState(activeUser.website || `linkup.dev/${activeUser.username}`);
  const [hometown, setHometown] = useState(activeUser.hometown || 'Bengaluru, India');
  const [avatar, setAvatar] = useState(activeUser.avatar || CURRENT_USER.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80',
  ];

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const permanentBase64 = await fileToBase64(file, 400, 400, 0.85);
      setAvatar(permanentBase64);
    } catch (err) {
      console.warn('Error converting avatar:', err);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({
      name,
      username: username.toLowerCase().replace(/\s+/g, '.'),
      role,
      subtitle,
      bio,
      website,
      hometown,
      avatar,
      work: role,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-lg bg-[#0A0D18] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-base font-extrabold text-white">Edit Profile</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4 pt-3.5 overflow-y-auto no-scrollbar pr-1">
            {/* Avatar Selector */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 shadow-xl">
                  <img
                    src={avatar}
                    alt="avatar preview"
                    className="w-full h-full rounded-full object-cover border-2 border-[#090C15]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white border-2 border-[#090C15] shadow-lg transition-transform hover:scale-110"
                  title="Upload from device"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preset avatar avatars */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                {AVATAR_PRESETS.map((pUrl, idx) => (
                  <img
                    key={idx}
                    src={pUrl}
                    alt="preset"
                    onClick={() => setAvatar(pUrl)}
                    className={`w-7 h-7 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform ${
                      avatar === pUrl ? 'ring-2 ring-purple-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Username / Handle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username / Handle</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Role / Profession (e.g. Computer Science Student) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Profession / Major</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Computer Science Student"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Tagline / Subtitle (e.g. Java Developer | Problem Solver) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline / Skills</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Java Developer | Problem Solver"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Website / Portfolio Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Website / Portfolio</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="linkup.dev/yourname"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Location / Hometown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Profile Updated!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
