import fs from 'fs';
import https from 'https';

const code = fs.readFileSync('src/data/musicCatalog.js', 'utf8');
const tracks = JSON.parse(code.replace(/[\s\S]*export const MUSIC_TRACKS = /, '').replace(/;\s*$/, ''));

console.log('Verifying all', tracks.length, 'tracks in musicCatalog.js...');

let okCount = 0;
let failCount = 0;

tracks.forEach((t) => {
  https.get(t.audioUrl, (res) => {
    if (res.statusCode === 200) {
      okCount++;
    } else {
      failCount++;
      console.log('Failed link:', t.id, t.title, 'Status:', res.statusCode);
    }
    if (okCount + failCount === tracks.length) {
      console.log(`SUMMARY: ${okCount}/${tracks.length} tracks returned HTTP 200 OK! Failed: ${failCount}`);
    }
  }).on('error', (e) => {
    failCount++;
    console.log('Error link:', t.id, t.title, e.message);
  });
});
