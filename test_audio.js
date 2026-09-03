import fs from 'fs';
import https from 'https';

const code = fs.readFileSync('src/data/musicCatalog.js', 'utf8');
const tracks = JSON.parse(code.replace(/[\s\S]*export const MUSIC_TRACKS = /, '').replace(/;\s*$/, ''));

console.log('Parsed tracks count:', tracks.length);

const sampleTracks = tracks.slice(0, 10);

for (const t of sampleTracks) {
  console.log(`ID: ${t.id} | Title: ${t.title} | AudioUrl: ${t.audioUrl}`);
  https.get(t.audioUrl, res => {
    console.log(`-> ${t.title.slice(0, 20)} Status: ${res.statusCode} Content-Type: ${res.headers['content-type']} Content-Length: ${res.headers['content-length']}`);
  }).on('error', err => {
    console.log(`-> ${t.title.slice(0, 20)} Error: ${err.message}`);
  });
}
