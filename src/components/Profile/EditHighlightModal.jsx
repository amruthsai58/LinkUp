import React, { useState, useRef } from 'react';
import { X, Trash2, Camera, Plus, Check, Sparkles, Image as ImageIcon, Video } from 'lucide-react';

export const EditHighlightModal = ({ highlight, isOpen, onClose, onUpdateHighlight, onDeleteHighlight }) => {
  const fileInputRef = useRef(null);

  const [name, setName] = useState(highlight?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(highlight?.icon || '🌟');
  const [selectedColor, setSelectedColor] = useState(highlight?.color || 'border-purple-500/80');
  const [stories, setStories] = useState(highlight?.stories || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !highlight) return null;

  const ICONS = ['🌴', '🏔️', '</>', '👥', '🌟', '🎵', '☕', '🚗', '🎨', '🔥', '🏆', '💎'];
  const COLORS = [
    { label: 'Purple', class: 'border-purple-500/80', bg: 'from-purple-600 to-indigo-600' },
    { label: 'Emerald', class: 'border-emerald-500/80', bg: 'from-emerald-500 to-teal-500' },
    { label: 'Blue', class: 'border-blue-500/80', bg: 'from-blue-500 to-cyan-500' },
    { label: 'Pink', class: 'border-pink-500/80', bg: 'from-pink-500 to-rose-500' },
    { label: 'Orange', class: 'border-orange-500/80', bg: 'from-orange-500 to-amber-500' },
  ];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const objectUrl = URL.createObjectURL(file);
      setStories((prev) => [
        ...prev,
        {
          id: `story-${Date.now()}-${Math.random()}`,
          url: objectUrl,
          type: isVideo ? 'video' : 'image',
          caption: `Added to ${name || highlight.name}`,
          time: 'Just now',
        },
      ]);
    });
    e.target.value = '';
  };

  const removeStorySlide = (index) => {
    setStories((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateHighlight({
      ...highlight,
      name: name.trim() || highlight.name,
      icon: selectedIcon,
      color: selectedColor,
      stories: stories.length > 0 ? stories : highlight.stories,
    });
    onClose();
  };

  const handleDelete = () => {
    onDeleteHighlight(highlight.id);
    setShowDeleteConfirm(false);
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

      <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-md bg-[#0A0D18] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h3 className="text-sm font-extrabold text-white">Edit Story Highlight</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4 pt-3 overflow-y-auto no-scrollbar pr-1">
            {/* Live Highlight Preview */}
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className={`w-16 h-16 rounded-full bg-slate-900 border-2 ${selectedColor} flex items-center justify-center text-2xl shadow-xl transition-transform hover:scale-105`}
              >
                <span>{selectedIcon}</span>
              </div>
              <span className="text-xs font-bold text-white">{name || highlight.name}</span>
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
                placeholder="Highlight name"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cover Icon</label>
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

            {/* Photos & Videos in this Highlight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Photos & Videos ({stories.length})
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Media</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {stories.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 group"
                  >
                    {s.type === 'video' ? (
                      <video src={s.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={s.url} alt="slide" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeStorySlide(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors"
                      title="Remove slide"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {/* Upload tile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-900 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0 gap-1"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[9px] font-bold">Add</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:opacity-95"
              >
                Save Changes
              </button>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Highlight</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-red-950/40 border border-red-500/30">
                  <span className="text-[11px] text-red-300 font-semibold flex-1">Permanently delete?</span>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold shadow-md"
                  >
                    Confirm Delete
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditHighlightModal;
