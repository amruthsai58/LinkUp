import React, { useState, useRef } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon, Video, Check } from 'lucide-react';
import { fileToBase64 } from '../../utils/imageUtils';

export const CreateHighlightModal = ({ isOpen, onClose, onAddHighlight, onCreateHighlight }) => {
  const fileInputRef = useRef(null);
  const handleAdd = onAddHighlight || onCreateHighlight;

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌟');
  const [selectedColor, setSelectedColor] = useState('border-purple-500/80');
  const [mediaItems, setMediaItems] = useState([]);

  if (!isOpen) return null;

  const ICONS = ['🌟', '🌴', '🏔️', '🎵', '</>', '☕', '🚗', '🎨', '🔥', '🏆', '💎', '👥'];
  const COLORS = [
    { label: 'Purple', class: 'border-purple-500/80', bg: 'from-purple-600 to-indigo-600' },
    { label: 'Emerald', class: 'border-emerald-500/80', bg: 'from-emerald-500 to-teal-500' },
    { label: 'Blue', class: 'border-blue-500/80', bg: 'from-blue-500 to-cyan-500' },
    { label: 'Pink', class: 'border-pink-500/80', bg: 'from-pink-500 to-rose-500' },
    { label: 'Orange', class: 'border-orange-500/80', bg: 'from-orange-500 to-amber-500' },
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith('video');
      let finalUrl;
      if (isVideo) {
        finalUrl = URL.createObjectURL(file);
      } else {
        finalUrl = await fileToBase64(file, 800, 1000, 0.85);
      }
      setMediaItems((prev) => [
        ...prev,
        {
          id: `story-${Date.now()}-${Math.random()}`,
          url: finalUrl,
          type: isVideo ? 'video' : 'image',
          caption: `Memory in ${name || 'Highlight'}`,
          time: 'Just now',
        },
      ]);
    }
    e.target.value = '';
  };

  const removeMedia = (idx) => {
    setMediaItems((prev) => prev.filter((_, index) => index !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (handleAdd) {
      handleAdd({
      id: `hl-${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      stories: mediaItems.length > 0 ? mediaItems : [
        {
          url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
          caption: `${name} memories ✨`,
          time: 'Just now',
        },
      ],
      });
    }

    setName('');
    setMediaItems([]);
    onClose();
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

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-sm bg-[#0A0D18] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>New Story Highlight</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto no-scrollbar pt-2 pr-1">
            {/* Highlight Preview */}
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className={`w-16 h-16 rounded-full bg-slate-900 border-2 ${selectedColor} flex items-center justify-center text-2xl shadow-xl transition-transform hover:scale-105`}
              >
                <span>{selectedIcon}</span>
              </div>
              <span className="text-xs font-bold text-slate-200">{name || 'Highlight Title'}</span>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Highlight Name</label>
              <input
                type="text"
                required
                maxLength={15}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Memories, Trips, Vibe"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Choose Icon</label>
              <div className="grid grid-cols-6 gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 rounded-xl text-base flex items-center justify-center transition-all ${
                      selectedIcon === icon ? 'bg-purple-600 scale-110 shadow-md' : 'hover:bg-slate-800'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Ring Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ring Accent Color</label>
              <div className="flex items-center justify-between gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setSelectedColor(c.class)}
                    className={`flex-1 h-7 rounded-xl bg-gradient-to-r ${c.bg} flex items-center justify-center transition-all ${
                      selectedColor === c.class ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === c.class && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Photos & Videos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Add Photos & Videos ({mediaItems.length})
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {mediaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-14 h-18 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 group"
                  >
                    <img src={item.url} alt="media" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 hover:bg-red-600 text-white"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-18 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-900 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0 gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[8px] font-bold">Upload</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 mt-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-40"
            >
              Create Highlight
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateHighlightModal;
