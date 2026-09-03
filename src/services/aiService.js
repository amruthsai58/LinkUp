// LinkUp AI Social Post & Caption Generator Service
const OPENROUTER_API_KEY = typeof process !== 'undefined' && process.env?.VITE_OPENROUTER_API_KEY ? process.env.VITE_OPENROUTER_API_KEY : '';

export const AI_TONES = [
  { id: 'vibe', label: '🎧 Music & Vibe', emoji: '🎶', desc: 'Chill, rhythmic & melody-inspired' },
  { id: 'hype', label: '🔥 Mass & Hype', emoji: '💥', desc: 'Energetic, blockbuster movie mass feel' },
  { id: 'aesthetic', label: '✨ Aesthetic & Poetic', emoji: '🌅', desc: 'Thoughtful, nostalgic, poetic lines' },
  { id: 'casual', label: '💬 Casual & Friendly', emoji: '☕', desc: 'Everyday conversations with friends' },
  { id: 'funny', label: '😂 Humorous & Relatable', emoji: '🤣', desc: 'Witty, punchy, meme-style humor' },
  { id: 'tech', label: '🚀 Tech & Creative', emoji: '⚡', desc: 'Building, coding, and creative updates' },
];

export const AI_LANGUAGES = [
  { id: 'english', label: 'English', flag: '🌐' },
  { id: 'kannada_mix', label: 'Kannada Blend (ಕನ್ನಡ)', flag: '🟡🔴' },
  { id: 'telugu_mix', label: 'Telugu Blend (తెలుగు)', flag: '🟠🟢' },
  { id: 'tamil_mix', label: 'Tamil Blend (தமிழ்)', flag: '🔴⚪' },
];

/**
 * Generate creative post/caption variations
 * @param {Object} params
 * @param {string} params.prompt - Topic, mood, or idea
 * @param {string} params.tone - One of AI_TONES
 * @param {string} params.language - Selected language blend
 * @param {string} [params.attachedSong] - Optional song name to theme around
 * @returns {Promise<Array<{caption: string, feeling: string, hashtags: string[], suggestedSong?: string}>>}
 */
export async function generateSocialPost({ prompt, tone = 'vibe', language = 'english', attachedSong = '' }) {
  if (OPENROUTER_API_KEY) {
    const systemPrompt = `You are "LinkUp AI", the intelligent social media assistant for "LinkUp" — a social networking platform that connects people with modern social feeds, stories, reels, and regional South Indian music (Kannada, Telugu, Tamil).

Your job is to generate 3 diverse, viral, engaging social media post options based on the user's input.
Rules:
- Keep the posts authentic, natural, and social-media-ready.
- Include natural emojis, a recommended feeling/activity, and 3-5 relevant hashtags (including #LinkUp).
- If a language blend like Kannada/Telugu/Tamil is requested, include popular conversational cultural phrases or lyrics vibes in English or native script naturally.
- Output MUST be valid strictly JSON with no markdown backticks or commentary.

Return format:
{
  "options": [
    {
      "caption": "Post text here with emojis...",
      "feeling": "vibing with coffee",
      "hashtags": ["#LinkUp", "#WeekendVibes", "#KantaraBeats"],
      "suggestedMusic": "Singara Siriye"
    },
    {
      "caption": "Second variation...",
      "feeling": "energized",
      "hashtags": ["#LinkUp", "#MassBeats"],
      "suggestedMusic": "Hukum"
    },
    {
      "caption": "Third shorter/punchier variation...",
      "feeling": "nostalgic",
      "hashtags": ["#LinkUp", "#MelodyHits"],
      "suggestedMusic": "Samajavaragamana"
    }
  ]
}`;

    const userContent = `Topic/Idea: "${prompt || 'Sharing good vibes and weekend moments'}"
Tone: ${tone}
Language Style: ${language}
${attachedSong ? `Current Song: "${attachedSong}"` : ''}

Generate 3 unique post options.`;

    const models = ['openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct', 'deepseek/deepseek-chat'];

    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'LinkUp Social Network',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent },
            ],
            temperature: 0.8,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.options && Array.isArray(parsed.options)) {
            return parsed.options;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} failed, trying next...`, err);
      }
    }
  }

  // Standard creative templates
  return [
    {
      caption: `Weekend vibes hit different when the playlist is pure fire! 🎶✨ Sharing special moments on LinkUp with good music and good people. 🚀`,
      feeling: 'chilling and vibing',
      hashtags: ['#LinkUp', '#WeekendVibes', '#SouthIndianHits'],
      suggestedMusic: 'Singara Siriye',
    },
    {
      caption: `Late night thoughts, filter coffee, and acoustic beats ☕🌙 Taking a moment to appreciate the journey! #ConnectShareGrow`,
      feeling: 'feeling thoughtful',
      hashtags: ['#LinkUp', '#CozyMoments', '#GoodVibes'],
      suggestedMusic: 'Anisuthide',
    },
    {
      caption: `Mass energy level 1000! 💥 Unmatched energy today. Let's make things happen! 🔥`,
      feeling: 'feeling pumped',
      hashtags: ['#LinkUp', '#BlockbusterEnergy', '#LetsGo'],
      suggestedMusic: 'Hukum',
    },
  ];
}
