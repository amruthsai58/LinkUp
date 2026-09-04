import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldAlert,
  CheckCircle2,
  FileWarning,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { CURRENT_USER } from '../../data/mockSocialData';

export const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { user, deleteAccount } = useAuth();
  const { setActiveTab } = useSocial();
  const activeUser = user || CURRENT_USER;

  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const expectedKeyword = 'DELETE';
  const isConfirmed =
    confirmInput.trim().toUpperCase() === expectedKeyword ||
    confirmInput.trim().toLowerCase() === (activeUser.username || '').toLowerCase();

  const handleDelete = () => {
    if (!isConfirmed) {
      setErrorMsg(`Please type ${expectedKeyword} to confirm account deletion.`);
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    setTimeout(() => {
      deleteAccount();
      setIsDeleting(false);
      onClose();
      setActiveTab('auth_welcome');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#0A0D18] border border-red-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Delete Account</h3>
              <p className="text-[11px] text-red-400/90 font-medium">Permanent & Irreversible</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <img
            src={
              activeUser.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
            }
            alt={activeUser.name}
            className="w-11 h-11 rounded-full object-cover border border-purple-500/50"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{activeUser.name}</h4>
            <p className="text-[11px] text-slate-400 truncate">@{activeUser.username}</p>
            {activeUser.linkupId && (
              <span className="text-[10px] font-mono font-bold text-purple-400">
                ID: {activeUser.linkupId}
              </span>
            )}
          </div>
        </div>

        {/* Warning Details List */}
        <div className="mt-3.5 space-y-2 text-xs text-slate-300">
          <p className="text-[11px] text-slate-400">
            Deleting your account will permanently wipe all your LinkUp data:
          </p>

          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-2 text-[11px] text-slate-300">
            <div className="flex items-start gap-2">
              <FileWarning className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>All your posts, story highlights, and reels will be permanently erased.</span>
            </div>
            <div className="flex items-start gap-2">
              <FileWarning className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>Your Official LinkUp ID ({activeUser.linkupId || 'LK-ID'}) will be deleted.</span>
            </div>
            <div className="flex items-start gap-2">
              <FileWarning className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>You will be disconnected from all followers, friends, and direct message chats.</span>
            </div>
          </div>
        </div>

        {/* Confirmation Input Step */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            To confirm deletion, type <span className="font-mono text-red-400 font-black tracking-wider">DELETE</span> below:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => {
              setConfirmInput(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Type DELETE"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 uppercase tracking-wider font-mono placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-600"
          />
          {errorMsg && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errorMsg}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-lg ${
              isConfirmed && !isDeleting
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 active:scale-95 cursor-pointer'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete My Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
