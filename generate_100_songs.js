import https from 'https';
import fs from 'fs';

const songList = [
  // KANNADA (35)
  { id: 'kan-01', query: 'Singara Siriye Kantara', lang: 'kannada', genre: 'romantic', movie: 'Kantara' },
  { id: 'kan-02', query: 'Varaha Roopam Kantara', lang: 'kannada', genre: 'devotional', movie: 'Kantara' },
  { id: 'kan-03', query: 'Sulthan KGF Chapter 2', lang: 'kannada', genre: 'mass', movie: 'KGF Chapter 2' },
  { id: 'kan-04', query: 'Mehabooba KGF Chapter 2', lang: 'kannada', genre: 'romantic', movie: 'KGF Chapter 2' },
  { id: 'kan-05', query: 'Salaam Rocky Bhai KGF', lang: 'kannada', genre: 'mass', movie: 'KGF Chapter 1' },
  { id: 'kan-06', query: 'Toofan KGF Chapter 2', lang: 'kannada', genre: 'mass', movie: 'KGF Chapter 2' },
  { id: 'kan-07', query: 'Dheera Dheera KGF', lang: 'kannada', genre: 'mass', movie: 'KGF Chapter 1' },
  { id: 'kan-08', query: 'Belakina Kavithe Banaras', lang: 'kannada', genre: 'romantic', movie: 'Banaras' },
  { id: 'kan-09', query: 'Ra Ra Rakkamma Vikrant Rona', lang: 'kannada', genre: 'party', movie: 'Vikrant Rona' },
  { id: 'kan-10', query: 'Hey Fakira Vikrant Rona', lang: 'kannada', genre: 'folk', movie: 'Vikrant Rona' },
  { id: 'kan-11', query: 'Anisuthide Mungaru Male', lang: 'kannada', genre: 'romantic', movie: 'Mungaru Male' },
  { id: 'kan-12', query: 'Mungaru Maleye Mungaru Male', lang: 'kannada', genre: 'romantic', movie: 'Mungaru Male' },
  { id: 'kan-13', query: 'Onde Ondu Saari Mungaru Male', lang: 'kannada', genre: 'romantic', movie: 'Mungaru Male' },
  { id: 'kan-14', query: 'Belageddu Kirik Party', lang: 'kannada', genre: 'romantic', movie: 'Kirik Party' },
  { id: 'kan-15', query: 'Katheyonda Helide Kirik Party', lang: 'kannada', genre: 'romantic', movie: 'Kirik Party' },
  { id: 'kan-16', query: 'Hey Hey Buddy Kirik Party', lang: 'kannada', genre: 'party', movie: 'Kirik Party' },
  { id: 'kan-17', query: 'Thinbedakammi Lucia', lang: 'kannada', genre: 'folk', movie: 'Lucia' },
  { id: 'kan-18', query: 'Neeve Naanage Lucia', lang: 'kannada', genre: 'romantic', movie: 'Lucia' },
  { id: 'kan-19', query: 'Sahiba 777 Charlie', lang: 'kannada', genre: 'romantic', movie: '777 Charlie' },
  { id: 'kan-20', query: 'Torture Song 777 Charlie', lang: 'kannada', genre: 'party', movie: '777 Charlie' },
  { id: 'kan-21', query: 'The Hymn of Dharma 777 Charlie', lang: 'kannada', genre: 'devotional', movie: '777 Charlie' },
  { id: 'kan-22', query: 'Sapta Sagaradaache Ello Title Track', lang: 'kannada', genre: 'romantic', movie: 'Sapta Sagaradaache Ello' },
  { id: 'kan-23', query: 'Kadalanu Kaanahorati Sapta Sagaradaache Ello', lang: 'kannada', genre: 'romantic', movie: 'Sapta Sagaradaache Ello' },
  { id: 'kan-24', query: 'Olave Olave Sapta Sagaradaache Ello', lang: 'kannada', genre: 'romantic', movie: 'Sapta Sagaradaache Ello' },
  { id: 'kan-25', query: 'Baa Baa Ba Na Ready Roberrt', lang: 'kannada', genre: 'mass', movie: 'Roberrt' },
  { id: 'kan-26', query: 'Baby Dance Floor Roberrt', lang: 'kannada', genre: 'party', movie: 'Roberrt' },
  { id: 'kan-27', query: 'Bisilu Kudure Googly', lang: 'kannada', genre: 'romantic', movie: 'Googly' },
  { id: 'kan-28', query: 'Yeno Yeno Aagide Googly', lang: 'kannada', genre: 'romantic', movie: 'Googly' },
  { id: 'kan-29', query: 'Gatiya Ilidu Ulidavaru Kandanthe', lang: 'kannada', genre: 'folk', movie: 'Ulidavaru Kandanthe' },
  { id: 'kan-30', query: 'Pataki Poriyo Kotigobba 3', lang: 'kannada', genre: 'party', movie: 'Kotigobba 3' },
  { id: 'kan-31', query: 'Tagaru Banthu Tagaru', lang: 'kannada', genre: 'mass', movie: 'Tagaru' },
  { id: 'kan-32', query: 'Soul of Dia', lang: 'kannada', genre: 'romantic', movie: 'Dia' },
  { id: 'kan-33', query: 'Karabuu Pogaru', lang: 'kannada', genre: 'mass', movie: 'Pogaru' },
  { id: 'kan-34', query: 'Minchagi Neenu Baralu Gaalipata', lang: 'kannada', genre: 'romantic', movie: 'Gaalipata' },
  { id: 'kan-35', query: 'Paravashanadenu Paramathma', lang: 'kannada', genre: 'romantic', movie: 'Paramathma' },

  // TELUGU (35)
  { id: 'tel-01', query: 'Naatu Naatu RRR', lang: 'telugu', genre: 'mass', movie: 'RRR' },
  { id: 'tel-02', query: 'Dosti RRR Telugu', lang: 'telugu', genre: 'folk', movie: 'RRR' },
  { id: 'tel-03', query: 'Komuram Bheemudo RRR', lang: 'telugu', genre: 'devotional', movie: 'RRR' },
  { id: 'tel-04', query: 'Raamam Raaghavam RRR', lang: 'telugu', genre: 'devotional', movie: 'RRR' },
  { id: 'tel-05', query: 'Samajavaragamana Ala Vaikunthapurramuloo', lang: 'telugu', genre: 'romantic', movie: 'Ala Vaikunthapurramuloo' },
  { id: 'tel-06', query: 'Butta Bomma Ala Vaikunthapurramuloo', lang: 'telugu', genre: 'romantic', movie: 'Ala Vaikunthapurramuloo' },
  { id: 'tel-07', query: 'Ramuloo Ramulaa Ala Vaikunthapurramuloo', lang: 'telugu', genre: 'party', movie: 'Ala Vaikunthapurramuloo' },
  { id: 'tel-08', query: 'Oo Antava Oo Oo Antava Pushpa', lang: 'telugu', genre: 'party', movie: 'Pushpa: The Rise' },
  { id: 'tel-09', query: 'Srivalli Pushpa Telugu', lang: 'telugu', genre: 'romantic', movie: 'Pushpa: The Rise' },
  { id: 'tel-10', query: 'Saami Saami Pushpa Telugu', lang: 'telugu', genre: 'folk', movie: 'Pushpa: The Rise' },
  { id: 'tel-11', query: 'Pushpa Pushpa Telugu Pushpa 2', lang: 'telugu', genre: 'mass', movie: 'Pushpa 2 The Rule' },
  { id: 'tel-12', query: 'Sooseki Pushpa 2 Telugu', lang: 'telugu', genre: 'romantic', movie: 'Pushpa 2 The Rule' },
  { id: 'tel-13', query: 'Angaaron Pushpa 2 The Couple Song', lang: 'telugu', genre: 'romantic', movie: 'Pushpa 2 The Rule' },
  { id: 'tel-14', query: 'Fear Song Devara', lang: 'telugu', genre: 'mass', movie: 'Devara: Part 1' },
  { id: 'tel-15', query: 'Chuttamalle Devara', lang: 'telugu', genre: 'romantic', movie: 'Devara: Part 1' },
  { id: 'tel-16', query: 'Daavudi Devara', lang: 'telugu', genre: 'party', movie: 'Devara: Part 1' },
  { id: 'tel-17', query: 'Inkem Inkem Inkem Kaavaale Geetha Govindam', lang: 'telugu', genre: 'romantic', movie: 'Geetha Govindam' },
  { id: 'tel-18', query: 'Vachindamma Geetha Govindam', lang: 'telugu', genre: 'romantic', movie: 'Geetha Govindam' },
  { id: 'tel-19', query: 'What The Life Geetha Govindam', lang: 'telugu', genre: 'party', movie: 'Geetha Govindam' },
  { id: 'tel-20', query: 'Ta Takkara Kalki 2898 AD', lang: 'telugu', genre: 'romantic', movie: 'Kalki 2898 AD' },
  { id: 'tel-21', query: 'Theme of Kalki', lang: 'telugu', genre: 'devotional', movie: 'Kalki 2898 AD' },
  { id: 'tel-22', query: 'Bhairava Anthem Kalki', lang: 'telugu', genre: 'mass', movie: 'Kalki 2898 AD' },
  { id: 'tel-23', query: 'Kurchi Madathapetti Guntur Kaaram', lang: 'telugu', genre: 'party', movie: 'Guntur Kaaram' },
  { id: 'tel-24', query: 'Dum Masala Guntur Kaaram', lang: 'telugu', genre: 'mass', movie: 'Guntur Kaaram' },
  { id: 'tel-25', query: 'Inthandham Sita Ramam', lang: 'telugu', genre: 'romantic', movie: 'Sita Ramam' },
  { id: 'tel-26', query: 'Kaanunna Kalyanam Sita Ramam', lang: 'telugu', genre: 'romantic', movie: 'Sita Ramam' },
  { id: 'tel-27', query: 'Oh Sita Hey Rama Sita Ramam', lang: 'telugu', genre: 'romantic', movie: 'Sita Ramam' },
  { id: 'tel-28', query: 'Mind Block Sarileru Neekevvaru', lang: 'telugu', genre: 'party', movie: 'Sarileru Neekevvaru' },
  { id: 'tel-29', query: 'Hes So Cute Sarileru Neekevvaru', lang: 'telugu', genre: 'romantic', movie: 'Sarileru Neekevvaru' },
  { id: 'tel-30', query: 'Rangamma Mangamma Rangasthalam', lang: 'telugu', genre: 'folk', movie: 'Rangasthalam' },
  { id: 'tel-31', query: 'Jigelu Rani Rangasthalam', lang: 'telugu', genre: 'party', movie: 'Rangasthalam' },
  { id: 'tel-32', query: 'Nee Kannu Neeli Samudram Uppena', lang: 'telugu', genre: 'romantic', movie: 'Uppena' },
  { id: 'tel-33', query: 'Jala Jala Jalapaatham Uppena', lang: 'telugu', genre: 'romantic', movie: 'Uppena' },
  { id: 'tel-34', query: 'Saahore Baahubali', lang: 'telugu', genre: 'mass', movie: 'Baahubali 2' },
  { id: 'tel-35', query: 'Dheevara Baahubali', lang: 'telugu', genre: 'romantic', movie: 'Baahubali The Beginning' },

  // TAMIL (35)
  { id: 'tam-01', query: 'Hukum Jailer', lang: 'tamil', genre: 'mass', movie: 'Jailer' },
  { id: 'tam-02', query: 'Kaavaalaa Jailer', lang: 'tamil', genre: 'party', movie: 'Jailer' },
  { id: 'tam-03', query: 'Rathamaarey Jailer', lang: 'tamil', genre: 'romantic', movie: 'Jailer' },
  { id: 'tam-04', query: 'Jujubee Jailer', lang: 'tamil', genre: 'mass', movie: 'Jailer' },
  { id: 'tam-05', query: 'Arabic Kuthu Beast', lang: 'tamil', genre: 'party', movie: 'Beast' },
  { id: 'tam-06', query: 'Jolly O Gymkhana Beast', lang: 'tamil', genre: 'party', movie: 'Beast' },
  { id: 'tam-07', query: 'Beast Mode Beast', lang: 'tamil', genre: 'mass', movie: 'Beast' },
  { id: 'tam-08', query: 'Naa Ready Leo', lang: 'tamil', genre: 'mass', movie: 'Leo' },
  { id: 'tam-09', query: 'Badass Leo', lang: 'tamil', genre: 'mass', movie: 'Leo' },
  { id: 'tam-10', query: 'Ordinary Person Leo', lang: 'tamil', genre: 'romantic', movie: 'Leo' },
  { id: 'tam-11', query: 'Porkanda Singam Vikram', lang: 'tamil', genre: 'romantic', movie: 'Vikram' },
  { id: 'tam-12', query: 'Pathala Pathala Vikram', lang: 'tamil', genre: 'folk', movie: 'Vikram' },
  { id: 'tam-13', query: 'Vikram Title Track', lang: 'tamil', genre: 'mass', movie: 'Vikram' },
  { id: 'tam-14', query: 'Vaathi Coming Master', lang: 'tamil', genre: 'mass', movie: 'Master' },
  { id: 'tam-15', query: 'Kutti Story Master', lang: 'tamil', genre: 'folk', movie: 'Master' },
  { id: 'tam-16', query: 'Andha Kanna Paathaakaa Master', lang: 'tamil', genre: 'romantic', movie: 'Master' },
  { id: 'tam-17', query: 'Ponni Nadhi Ponniyin Selvan', lang: 'tamil', genre: 'folk', movie: 'Ponniyin Selvan 1' },
  { id: 'tam-18', query: 'Aga Naga Ponniyin Selvan 2', lang: 'tamil', genre: 'romantic', movie: 'Ponniyin Selvan 2' },
  { id: 'tam-19', query: 'Chinnanjiru Nilave Ponniyin Selvan 2', lang: 'tamil', genre: 'romantic', movie: 'Ponniyin Selvan 2' },
  { id: 'tam-20', query: 'Rowdy Baby Maari 2', lang: 'tamil', genre: 'folk', movie: 'Maari 2' },
  { id: 'tam-21', query: 'Maari Gethu Maari 2', lang: 'tamil', genre: 'mass', movie: 'Maari 2' },
  { id: 'tam-22', query: 'Vaseegara Minnale', lang: 'tamil', genre: 'romantic', movie: 'Minnale' },
  { id: 'tam-23', query: 'Venmathi Minnale', lang: 'tamil', genre: 'romantic', movie: 'Minnale' },
  { id: 'tam-24', query: 'Katchi Sera', lang: 'tamil', genre: 'romantic', movie: 'Think Indie' },
  { id: 'tam-25', query: 'Aasa Kooda Think Indie', lang: 'tamil', genre: 'romantic', movie: 'Think Indie' },
  { id: 'tam-26', query: 'Chemma Chella Doctor', lang: 'tamil', genre: 'party', movie: 'Doctor' },
  { id: 'tam-27', query: 'So Baby Doctor', lang: 'tamil', genre: 'romantic', movie: 'Doctor' },
  { id: 'tam-28', query: 'Ranjithame Varisu', lang: 'tamil', genre: 'party', movie: 'Varisu' },
  { id: 'tam-29', query: 'Thee Thalapathy Varisu', lang: 'tamil', genre: 'mass', movie: 'Varisu' },
  { id: 'tam-30', query: 'Jimikki Ponnu Varisu', lang: 'tamil', genre: 'party', movie: 'Varisu' },
  { id: 'tam-31', query: 'Mundhinam Paartheney Vaaranam Aayiram', lang: 'tamil', genre: 'romantic', movie: 'Vaaranam Aayiram' },
  { id: 'tam-32', query: 'Nenjukkul Peidhidum Vaaranam Aayiram', lang: 'tamil', genre: 'romantic', movie: 'Vaaranam Aayiram' },
  { id: 'tam-33', query: 'Hosanna Vinnaithaandi Varuvaayaa', lang: 'tamil', genre: 'romantic', movie: 'Vinnaithaandi Varuvaayaa' },
  { id: 'tam-34', query: 'Mannipaaya Vinnaithaandi Varuvaayaa', lang: 'tamil', genre: 'romantic', movie: 'Vinnaithaandi Varuvaayaa' },
  { id: 'tam-35', query: 'Kaathalae Kaathalae 96', lang: 'tamil', genre: 'romantic', movie: '96' }
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
          const cleanTitle = song?.title ? song.title.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&') : item.query.split(' ')[0];
          const cleanSingers = song?.more_info?.primary_artists || song?.description || 'Featured Artist';

          resolve({
            id: item.id,
            title: cleanTitle,
            movie: item.movie,
            language: item.lang,
            singers: cleanSingers,
            genre: item.genre,
            duration: 200 + Math.floor(Math.random() * 80),
            playCount: 150000 + Math.floor(Math.random() * 350000),
            isTrending: Math.random() > 0.4,
            coverUrl: song?.image ? song.image.replace('50x50', '500x500') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            audioUrl: song?.more_info?.vlink || 'https://jiotunepreview.jio.com/content/Converted/010910621604732.mp3',
          });
        } catch (e) {
          resolve({
            id: item.id,
            title: item.query.split(' ')[0],
            movie: item.movie,
            language: item.lang,
            singers: 'Featured Artist',
            genre: item.genre,
            duration: 210,
            playCount: 180000,
            isTrending: true,
            coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            audioUrl: 'https://jiotunepreview.jio.com/content/Converted/010910621604732.mp3',
          });
        }
      });
    }).on('error', () => resolve({
      id: item.id,
      title: item.query.split(' ')[0],
      movie: item.movie,
      language: item.lang,
      singers: 'Featured Artist',
      genre: item.genre,
      duration: 210,
      playCount: 180000,
      isTrending: true,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      audioUrl: 'https://jiotunepreview.jio.com/content/Converted/010910621604732.mp3',
    }));
  });
}

(async () => {
  const fullCatalog = [];
  console.log('Fetching', songList.length, 'tracks...');
  for (let i = 0; i < songList.length; i++) {
    const res = await fetchSong(songList[i]);
    fullCatalog.push(res);
    if ((i + 1) % 15 === 0 || i === songList.length - 1) {
      console.log(`Progress: ${i + 1}/${songList.length} tracks processed`);
    }
  }
  fs.writeFileSync('full_100_songs.json', JSON.stringify(fullCatalog, null, 2));
  console.log('Done! Written', fullCatalog.length, 'songs to full_100_songs.json');
})();
