import fs from 'fs';

const raw = fs.readFileSync('full_100_songs.json', 'utf8');
const tracks = JSON.parse(raw);

const header = `// Comprehensive Regional Music Catalog (105 Tracks across Kannada, Telugu, and Tamil)
// Verified direct audio streams from JioSaavn CDN and high-resolution album covers

export const REGIONAL_LANGUAGES = [
  { id: 'all', name: 'All Languages', flag: '🌐' },
  { id: 'kannada', name: 'Kannada (ಕನ್ನಡ)', flag: '🟡🔴' },
  { id: 'telugu', name: 'Telugu (తెలుగు)', flag: '🟠🟢' },
  { id: 'tamil', name: 'Tamil (தமிழ்)', flag: '🔴⚪' },
];

export const GENRE_MOODS = [
  { id: 'trending', name: '🔥 Trending Top 20' },
  { id: 'new', name: '✨ New Releases' },
  { id: 'romantic', name: '💖 Romantic Melodies' },
  { id: 'mass', name: '⚡ High Voltage / Mass' },
  { id: 'folk', name: '🪘 Regional Folk & Beats' },
  { id: 'party', name: '🎉 Party & Dance' },
  { id: 'devotional', name: '🪔 Soulful & Classical' },
];

export const MUSIC_TRACKS = `;

fs.writeFileSync('src/data/musicCatalog.js', header + JSON.stringify(tracks, null, 2) + ';\n');
console.log('Successfully updated src/data/musicCatalog.js with', tracks.length, 'tracks!');
