// Mini-Player DOM Elements
const openFullscreenBtn = document.getElementById("open-fullscreen-btn");
const audio = document.getElementById("audio-player");
const playerContainer = document.querySelector(".player-container");
const songInfoWrapper = document.querySelector(".song-info-wrapper");
const playPauseBtn = document.getElementById("play-pause-btn");
const playIcon = playPauseBtn.querySelector(".play-icon");
const pauseIcon = playPauseBtn.querySelector(".pause-icon");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const timeCurrent = document.querySelector(".time-current");
const timeTotal = document.querySelector(".time-total");
const songTitleEl = document.querySelector(".song-title");
const songArtistEl = document.querySelector(".song-artist");
const songAlbumArtEl = document.querySelector(".song-album-art");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const volumeSlider = document.getElementById("volume-slider");

// Fullscreen Player DOM Elements
const fullscreenPlayer = document.getElementById("fullscreen-player");
const closeFullscreenBtn = document.getElementById("close-fullscreen-btn");
const fsAlbumArtDisc = document.getElementById("fullscreen-album-art-disc");
const fsAlbumArt = document.getElementById("fullscreen-album-art");
const fsSongTitle = document.getElementById("fullscreen-song-title");
const fsSongArtist = document.getElementById("fullscreen-song-artist");
const fsProgressBar = document.getElementById("fullscreen-progress-bar");
const fsTimeCurrent = document.getElementById("fullscreen-time-current");
const fsTimeTotal = document.getElementById("fullscreen-time-total");
const fsPlayPauseBtn = document.getElementById("fullscreen-play-pause-btn");
const fsPlayIcon = fsPlayPauseBtn.querySelector(".play-icon");
const fsPauseIcon = fsPlayPauseBtn.querySelector(".pause-icon");
const fsPrevBtn = document.getElementById("fullscreen-prev-btn");
const fsNextBtn = document.getElementById("fullscreen-next-btn");
const fsShuffleBtn = document.getElementById("fullscreen-shuffle-btn");
const fsRepeatBtn = document.getElementById("fullscreen-repeat-btn");

// Player State
let currentSongIndex = 0;
let playlist = [];
let isShuffleOn = false;

// Fullscreen Player Logic
function openFullscreenPlayer() {
  fullscreenPlayer.classList.add("open");
}

function closeFullscreenPlayer() {
  fullscreenPlayer.classList.remove("open");
}

// Core Player Logic
export function playSongFromPlaylist(newPlaylist, index) {
  playlist = newPlaylist;
  currentSongIndex = index;
  loadSong(playlist[currentSongIndex]);
  playSong();
}

function loadSong(song) {
  // Update mini-player
  songTitleEl.textContent = song.title;
  songArtistEl.textContent = song.artist;
  songAlbumArtEl.src = song.img;
  // Update fullscreen player
  fsSongTitle.textContent = song.title;
  fsSongArtist.textContent = song.artist;
  fsAlbumArt.src = song.img;

  audio.src = song.src;
}

async function playSong() {
  try {
    await audio.play();
    // Update mini-player icons
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
    // Update fullscreen icons
    fsPlayIcon.style.display = "none";
    fsPauseIcon.style.display = "block";
    // Start rotation animation
    fsAlbumArtDisc.classList.add("playing");
  } catch (error) {
    console.error("Audio playback failed:", error);
    pauseSong(); // Ensure UI is in paused state
  }
}

function pauseSong() {
  audio.pause();
  // Update mini-player icons
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
  // Update fullscreen icons
  fsPlayIcon.style.display = "block";
  fsPauseIcon.style.display = "none";
  // Stop rotation animation
  fsAlbumArtDisc.classList.remove("playing");
}

function togglePlayPause() {
  if (!audio.src) return;
  const isPlaying = !audio.paused;
  isPlaying ? pauseSong() : playSong();
}

function playNextSong() {
  if (!playlist.length) return;
  if (isShuffleOn) {
    currentSongIndex = Math.floor(Math.random() * playlist.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
  }
  loadSong(playlist[currentSongIndex]);
  playSong();
}

function playPrevSong() {
  if (!playlist.length) return;
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong(playlist[currentSongIndex]);
  playSong();
}

function updateProgress() {
  const { duration, currentTime } = audio;
  if (duration) {
    const progressPercent = (currentTime / duration) * 100;
    // Update both progress bars
    progressBar.value = progressPercent;
    fsProgressBar.value = progressPercent;
    // Update both time displays
    timeCurrent.textContent = formatTime(currentTime);
    fsTimeCurrent.textContent = formatTime(currentTime);
  }
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  if (duration) {
    audio.currentTime = (clickX / width) * duration;
  }
}

function setProgressFromInput(inputElement) {
  const duration = audio.duration;
  if (duration) {
    audio.currentTime = (inputElement.value / 100) * duration;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function toggleShuffle() {
  isShuffleOn = !isShuffleOn;
  shuffleBtn.classList.toggle("active", isShuffleOn);
  fsShuffleBtn.classList.toggle("active", isShuffleOn);
}

function toggleRepeat() {
  audio.loop = !audio.loop;
  repeatBtn.classList.toggle("active", audio.loop);
  fsRepeatBtn.classList.toggle("active", audio.loop);
}

// Swipe Down to Close Logic
let touchstartY = 0;
let touchEndY = 0;

function handleTouchStart(e) {
  touchstartY = e.changedTouches[0].screenY;
}

function handleTouchMove(e) {
  // Optional: You could add logic here to move the player with the finger
  e.preventDefault();
}

function handleTouchEnd(e) {
  touchEndY = e.changedTouches[0].screenY;
  // Check if the swipe was downwards and long enough
  if (touchEndY > touchstartY + 100) {
    // 100px swipe threshold
    closeFullscreenPlayer();
  }
}
export function initMusicPlayer() {
  // Open/Close fullscreen player
  openFullscreenBtn.addEventListener("click", openFullscreenPlayer);
  songInfoWrapper.addEventListener("click", openFullscreenPlayer);
  closeFullscreenBtn.addEventListener("click", closeFullscreenPlayer);
  fullscreenPlayer.addEventListener("touchstart", handleTouchStart, false);
  fullscreenPlayer.addEventListener("touchmove", handleTouchMove, false);
  fullscreenPlayer.addEventListener("touchend", handleTouchEnd, false);

  // Mini-player controls
  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", playNextSong);
  prevBtn.addEventListener("click", playPrevSong);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);
  volumeSlider.addEventListener(
    "input",
    (e) => (audio.volume = e.target.value / 100)
  );

  // Fullscreen player controls
  fsPlayPauseBtn.addEventListener("click", togglePlayPause);
  fsNextBtn.addEventListener("click", playNextSong);
  fsPrevBtn.addEventListener("click", playPrevSong);
  fsShuffleBtn.addEventListener("click", toggleShuffle);
  fsRepeatBtn.addEventListener("click", toggleRepeat);

  // Audio element events
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", () => {
    const formattedTime = formatTime(audio.duration);
    timeTotal.textContent = formattedTime;
    fsTimeTotal.textContent = formattedTime;
  });
  audio.addEventListener("ended", () => {
    if (!audio.loop) playNextSong();
  });

  // Progress bar seeking
  progressBar.addEventListener("input", () =>
    setProgressFromInput(progressBar)
  );
  fsProgressBar.addEventListener("input", () =>
    setProgressFromInput(fsProgressBar)
  );
}