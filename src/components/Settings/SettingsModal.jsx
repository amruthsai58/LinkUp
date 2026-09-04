import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Lock,
  Moon,
  Sun,
  Download,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { useAuth, calculatePasswordStrength } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { DeleteAccountModal } from './DeleteAccountModal';

export const SettingsModal = () => {
  const { user, updateUserProfile, toggle2FA, changePassword } = useAuth();
  const { isSettingsOpen, setIsSettingsOpen } = useSocial();

  const [activeSettingsTab, setActiveSettingsTab] = useState('account');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [work, setWork] = useState(user?.work || '');
  const [hometown, setHometown] = useState(user?.hometown || '');
  const [postsDefault, setPostsDefault] = useState(user?.privacy?.postsDefault || 'Public');

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const passwordMetrics = calculatePasswordStrength(newPassword);

  if (!isSettingsOpen) return null;

  const handleSaveAccount = (e) => {
    e.preventDefault();
    updateUserProfile({
      name,
      work,
      hometown,
      privacy: {
        ...(user?.privacy || {}),
        postsDefault,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (user?.password && !currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsChangingPassword(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDownloadData = () => {
    const dataBlob = new Blob([JSON.stringify(user, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LinkUp-Data-${user?.username || 'user'}.json`;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 text-blue-400 border border-slate-700">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Settings & Privacy</h3>
              <p className="text-xs text-slate-400">Manage security, profile details, and account data</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 flex items-center gap-4 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveSettingsTab('account')}
            className={`py-3 border-b-2 transition-all ${
              activeSettingsTab === 'account'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            General Account
          </button>
          <button
            onClick={() => setActiveSettingsTab('security')}
            className={`py-3 border-b-2 transition-all ${
              activeSettingsTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Security & 2FA
          </button>
          <button
            onClick={() => setActiveSettingsTab('data')}
            className={`py-3 border-b-2 transition-all ${
              activeSettingsTab === 'data'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Download Your Data
          </button>
          <button
            onClick={() => setActiveSettingsTab('danger')}
            className={`py-3 border-b-2 transition-all ${
              activeSettingsTab === 'danger'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-red-400'
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {activeSettingsTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="flex flex-col gap-4">
              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Profile and privacy settings successfully saved!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workplace / Occupation
                </label>
                <input
                  type="text"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hometown
                </label>
                <input
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Post Privacy
                </label>
                <select
                  value={postsDefault}
                  onChange={(e) => setPostsDefault(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Public">Public (Anyone on LinkUp)</option>
                  <option value="Friends">Friends Only</option>
                  <option value="Only Me">Only Me</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
              >
                Save Changes
              </button>
            </form>
          )}

          {activeSettingsTab === 'security' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-400">
                      Require OTP verification whenever logging into LinkUp
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggle2FA}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    user?.twoFactorEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Change Password Card & Form */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-6 h-6 text-purple-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Password & Security</h4>
                      <p className="text-[11px] text-slate-400">
                        {user?.password ? 'Account protected with password' : 'No custom password set'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setPasswordError('');
                      setPasswordSuccess(false);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all hover:scale-105"
                  >
                    {isChangingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {/* Inline Change Password Form */}
                {isChangingPassword && (
                  <form onSubmit={handleChangePasswordSubmit} className="mt-2 pt-3 border-t border-slate-700/60 flex flex-col gap-3">
                    {passwordError && (
                      <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                        <span>Password changed successfully!</span>
                      </div>
                    )}

                    {/* Current Password (if user has one set) */}
                    {user?.password && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {newPassword && (
                        <div className="mt-1.5">
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${passwordMetrics.color} transition-all duration-300`}
                              style={{ width: `${passwordMetrics.percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
                            Strength: {passwordMetrics.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordError('');
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmNewPassword('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeSettingsTab === 'data' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Your LinkUp Profile & Activity Archive</span>
                </h4>
                <p className="text-xs text-slate-300">
                  You can download a complete JSON archive of your profile information, activity log, friend connections, and favorite regional music playlists at any time.
                </p>

                {downloadSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    Archive JSON downloaded successfully!
                  </div>
                )}

                <button
                  onClick={handleDownloadData}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Download Complete Data (.json)
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === 'danger' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Your LinkUp Account</span>
                </div>
                <p className="text-xs text-slate-300">
                  Permanently remove your profile (@{user?.username}), official LinkUp ID ({user?.linkupId}), all created posts, reels, stories, and friends list. This action cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default SettingsModal;
