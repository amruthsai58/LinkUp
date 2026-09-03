import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MUSIC_TRACKS } from '../data/musicCatalog';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const [tracks, setTracks] = useState(MUSIC_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(MUSIC_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(MUSIC_TRACKS[0]?.duration || 200);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueue] = useState(MUSIC_TRACKS.slice(1, 6));
  const [likedSongIds, setLikedSongIds] = useState(['kan-01', 'tel-01', 'tam-01']);
  const [activeLanguage, setActiveLanguage] = useState('all');

  const audioRef = useRef(null);

  // Initialize global audio element once
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      const a = new Audio();
      a.volume = 1.0;
      audioRef.current = a;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNext();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [isRepeat]);

  // Stop audio immediately
  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
    setIsPlaying(false);
  };

  // Play a specific track smoothly without getting stuck on rapid clicks
  const playTrack = (track) => {
    if (!track || !track.audioUrl) return;
    let audio = audioRef.current;
    if (!audio && typeof window !== 'undefined') {
      audio = new Audio();
      audio.volume = 1.0;
      audioRef.current = audio;
    }
    if (!audio) return;

    setCurrentTrack(track);
    setDuration(track.duration || 200);

    // Pause previous playback cleanly
    try {
      audio.pause();
    } catch (e) {}

    audio.volume = isMuted ? 0 : volume;

    // Set new stream source without calling .load() to avoid abort lockups
    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          // AbortError is normal when quickly clicking to another song
          if (err.name !== 'AbortError') {
            console.warn('Audio play notice:', err.message);
          }
        });
    }
  };

  // Handle Play / Pause toggle
  const togglePlay = (track = null) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (track && track.id !== currentTrack?.id) {
      playTrack(track);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const targetTrack = track || currentTrack;
      if (targetTrack?.audioUrl) {
        if (audio.src !== targetTrack.audioUrl) {
          audio.src = targetTrack.audioUrl;
        }
        audio.volume = isMuted ? 0 : volume;
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    } else {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
      let nextIndex = (currentIndex + 1) % tracks.length;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }
      playTrack(tracks[nextIndex]);
    }
  };

  const handlePrev = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const seek = (time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (val) => {
    const newVol = parseFloat(val);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      setIsMuted(false);
      audio.volume = volume;
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  };

  const toggleLikeSong = (trackId) => {
    setLikedSongIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        queue,
        likedSongIds,
        activeLanguage,
        setActiveLanguage,
        playTrack,
        stopAudio,
        togglePlay,
        handleNext,
        handlePrev,
        seek,
        changeVolume,
        toggleMute,
        toggleLikeSong,
        setIsShuffle,
        setIsRepeat,
        formatTime,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export default MusicProvider;
