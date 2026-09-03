import https from 'https';
import fs from 'fs';

const songsToFetch = [
  { id: 'kan-01', query: 'Singara Siriye Kantara' },
  { id: 'kan-02', query: 'Sulthan KGF Chapter 2' },
  { id: 'kan-03', query: 'Belakina Kavithe Banaras' },
  { id: 'kan-04', query: 'Ra Ra Rakkamma Vikrant Rona' },
  { id: 'kan-05', query: 'Anisuthide Mungaru Male' },
  { id: 'tel-01', query: 'Naatu Naatu RRR' },
  { id: 'tel-02', query: 'Samajavaragamana Ala Vaikunthapurramuloo' },
  { id: 'tel-03', query: 'Oo Antava Mava Pushpa' },
  { id: 'tel-04', query: 'Inkem Inkem Inkem Kaavaale Geetha Govindam' },
  { id: 'tel-05', query: 'Fear Song Devara' },
  { id: 'tam-01', query: 'Hukum Jailer' },
  { id: 'tam-02', query: 'Arabic Kuthu Beast' },
  { id: 'tam-03', query: 'Rowdy Baby Maari 2' },
  { id: 'tam-04', query: 'Vaseegara Minnale' },
  { id: 'tam-05', query: 'Katchi Sera' },
];

function fetchSong(item) {
  return new Promise((resolve) => {
    const url = 'https://www.jiosaavn.com/api.php?__call=autocomplete.get&_marker=0&query=' + encodeURIComponent(item.query) + '&ctx=web6dot0&_format=json';
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const song = json.songs && json.songs.data && json.songs.data[0];
          if (song) {
            resolve({
              id: item.id,
              query: item.query,
              title: song.title.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'),
              image: song.image ? song.image.replace('50x50', '500x500') : '',
              audioUrl: song.more_info ? song.more_info.vlink : null,
              album: song.album ? song.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'") : ''
            });
          } else {
            resolve({ id: item.id, query: item.query, error: 'not found' });
          }
        } catch (e) {
          resolve({ id: item.id, query: item.query, error: e.message });
        }
      });
    }).on('error', err => resolve({ id: item.id, query: item.query, error: err.message }));
  });
}

(async () => {
  const results = [];
  for (const item of songsToFetch) {
    const res = await fetchSong(item);
    console.log(item.id, res.title, res.audioUrl ? 'FOUND MP3: ' + res.audioUrl : 'MISSING');
    results.push(res);
  }
  fs.writeFileSync('fetched_songs.json', JSON.stringify(results, null, 2));
})();
