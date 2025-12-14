/**
 * ============================================================================
 * VibAura Player DOM - DOM Element References
 * ============================================================================
 *
 * This module centralizes all DOM element selections for the music player
 * (both mini-player and fullscreen player).
 *
 * It queries the DOM *once* when the module is first loaded and exports a
 * single `dom` object containing all cached references. This improves
 * performance by avoiding repeated `getElementById` or `querySelector` calls
 * in functions that run frequently (like `updateProgress`).
 * ============================================================================
*/

// Cache references to play/pause buttons, as they are used to find
// nested icons immediately.
const playPauseBtn = document.getElementById("play-pause-btn");
const fsPlayPauseBtn = document.getElementById("fullscreen-play-pause-btn");

/**
 * Exported DOM element references for the entire player module.
 *
 * @exports dom
 * @type {object}
 */
export const dom = {
  // ========================================================================
  // AUDIO ELEMENT
  // ========================================================================
  audio: document.getElementById("audio-player"),

  // ========================================================================
  // MINI-PLAYER ELEMENTS (Desktop and Mobile)
  // ========================================================================
  playerContainer: document.querySelector(".player-container"),
  songInfoWrapper: document.querySelector(".song-info-wrapper"), // Clickable area on mobile
  openFullscreenBtn: document.getElementById("open-fullscreen-btn"), // Desktop fullscreen button

  // Mini-player Play/pause button and its nested icons
  playPauseBtn: playPauseBtn,
  playIcon: playPauseBtn.querySelector(".play-icon"),
  pauseIcon: playPauseBtn.querySelector(".pause-icon"),

  // Mini-player navigation controls (Desktop)
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),

  // Mini-player progress tracking (Desktop)
  progressBar: document.getElementById("progress-bar"),
  timeCurrent: document.querySelector(".time-current"), // Note: Selects the first on page
  timeTotal: document.querySelector(".time-total"), // Note: Selects the first on page

  // Mini-player song information display
  songTitleEl: document.querySelector(".song-title"), // Note: Selects the first on page
  songArtistEl: document.querySelector(".song-artist"), // Note: Selects the first on page
  songAlbumArtEl: document.querySelector(".song-album-art"), // Note: Selects the first on page

  // Mini-player playback options (Desktop)
  shuffleBtn: document.getElementById("shuffle-btn"),
  repeatBtn: document.getElementById("repeat-btn"),
  volumeSlider: document.getElementById("volume-slider"),
  likeBtn: document.getElementById("favorite-btn"),

  // ========================================================================
  // FULLSCREEN PLAYER ELEMENTS
  // ========================================================================
  fullscreenPlayer: document.getElementById("fullscreen-player"),
  closeFullscreenBtn: document.getElementById("close-fullscreen-btn"),

  // Fullscreen album art display
  fsAlbumArtDisc: document.getElementById("fullscreen-album-art-disc"), // The rotating disc
  fsAlbumArt: document.getElementById("fullscreen-album-art"), // The <img> tag

  // Fullscreen song information display
  fsSongTitle: document.getElementById("fullscreen-song-title"),
  fsSongArtist: document.getElementById("fullscreen-song-artist"),

  // Fullscreen progress tracking
  fsProgressBar: document.getElementById("fullscreen-progress-bar"),
  fsTimeCurrent: document.getElementById("fullscreen-time-current"),
  fsTimeTotal: document.getElementById("fullscreen-time-total"),

  // Fullscreen Play/pause button and its nested icons
  fsPlayPauseBtn: fsPlayPauseBtn,
  fsPlayIcon: fsPlayPauseBtn.querySelector(".play-icon"),
  fsPauseIcon: fsPlayPauseBtn.querySelector(".pause-icon"),

  // Fullscreen navigation and controls
  fsPrevBtn: document.getElementById("fullscreen-prev-btn"),
  fsNextBtn: document.getElementById("fullscreen-next-btn"),
  fsShuffleBtn: document.getElementById("fullscreen-shuffle-btn"),
  fsRepeatBtn: document.getElementById("fullscreen-repeat-btn"),
  fsLikeBtn: document.getElementById("fullscreen-favorite-btn"),
};