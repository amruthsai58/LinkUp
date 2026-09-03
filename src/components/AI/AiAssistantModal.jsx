import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Wand2,
  Copy,
  Check,
  Music,
  RefreshCw,
  Flame,
  Coffee,
  Sun,
  Code,
  Heart,
  Smile,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { useMusic } from '../../context/MusicContext';
import { generateSocialPost, AI_TONES, AI_LANGUAGES } from '../../services/aiService';

export const AiAssistantModal = ({ isOpen, onClose, onApplyToPost, onApplyToStory, initialPrompt = '' }) => {
  const { tracks } = useMusic();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedTone, setSelectedTone] = useState('vibe');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const quickPresets = [
    { label: '🌧️ Bangalore Rain & Coffee', prompt: 'Rainy afternoon in Bangalore with hot filter coffee and soulful Kannada melodies', tone: 'vibe', lang: 'kannada_mix' },
    { label: '🔥 Devara / Hukum Mass Hype', prompt: 'Full mass blockbuster song energy, pumped up with rockstar beats', tone: 'hype', lang: 'tamil_mix' },
    { label: '🌊 Beach Trip & Sunset', prompt: 'Coastal road trip to Gokarna & Malpe with friends under the golden sunset', tone: 'aesthetic', lang: 'english' },
    { label: '⚡ Late Night Coding', prompt: 'Late night coding session, building cool full-stack social features', tone: 'tech', lang: 'english' },
    { label: '🎉 Friday Weekend Vibes', prompt: 'Excited for the weekend party with friends and energetic Telugu tracks', tone: 'casual', lang: 'telugu_mix' },
  ];

  const handleGenerate = async (customPrompt, customTone, customLang) => {
    const textPrompt = customPrompt || prompt;
    const toneToUse = customTone || selectedTone;
    const langToUse = customLang || selectedLanguage;

    setIsLoading(true);
    try {
      const results = await generateSocialPost({
        prompt: textPrompt,
        tone: toneToUse,
        language: langToUse,
      });
      setGeneratedOptions(results);
    } catch (err) {
      console.error('AI Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = (option) => {
    // Find matching track from 105 songs if recommended
    let matchedTrackId = null;
    if (option.suggestedMusic) {
      const found = tracks.find((t) =>
        t.title.toLowerCase().includes(option.suggestedMusic.toLowerCase()) ||
        t.movie.toLowerCase().includes(option.suggestedMusic.toLowerCase())
      );
      if (found) matchedTrackId = found.id;
    }

    if (onApplyToPost) {
      onApplyToPost({
        content: `${option.caption}\n\n${option.hashtags.join(' ')}`,
        feeling: option.feeling ? { emoji: '✨', text: option.feeling } : null,
        musicTrackId: matchedTrackId,
      });
      onClose();
    } else if (onApplyToStory) {
      onApplyToStory({
        caption: option.caption,
        musicTrackId: matchedTrackId,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 animate-pulse">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>LinkUp AI Post & Caption Assistant</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-extrabold text-purple-300">
                  GPT-4o & LLAMA-3.3
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate high-engagement social posts, captions, and regional song pairings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4 flex flex-col gap-5">
          {/* Quick Idea Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Quick Prompt Presets</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(preset.prompt);
                    setSelectedTone(preset.tone);
                    setSelectedLanguage(preset.lang);
                    handleGenerate(preset.prompt, preset.tone, preset.lang);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-950/60 border border-slate-700 hover:border-purple-500/50 text-slate-200 hover:text-purple-300 text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Prompt Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              What do you want to post or talk about?
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Listening to Kantara tunes on repeat, weekend coding vibes, or sunset beach road trip..."
                className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
              />
            </div>
          </div>

          {/* Tone & Language Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tone Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose Tone / Mood
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {AI_TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedTone === tone.id
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{tone.emoji}</span>
                    <span className="truncate">{tone.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Blend Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Regional Flavor / Script
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {AI_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedLanguage === lang.id
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting AI Variations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Captions & Post</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {generatedOptions.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generated Post Options ({generatedOptions.length})</span>
              </h4>

              <div className="flex flex-col gap-3">
                {generatedOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 shadow-md transition-all flex flex-col gap-3"
                  >
                    <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed">
                      {opt.caption}
                    </p>

                    {/* Metadata & Hashtags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {opt.feeling && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                            ✨ {opt.feeling}
                          </span>
                        )}
                        {opt.suggestedMusic && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                            <Music className="w-3 h-3 text-pink-400" />
                            <span>Pair with: {opt.suggestedMusic}</span>
                          </span>
                        )}
                        {(opt.hashtags || []).map((tag, hIdx) => (
                          <span key={hIdx} className="text-[10px] font-bold text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(`${opt.caption}\n\n${opt.hashtags?.join(' ') || ''}`, idx)}
                          className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Copy to Clipboard"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(opt)}
                          className="px-3.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
                        >
                          <span>Apply</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;
