/**
 * ============================================================================
 * VibAura Player Controller - Audio Playback & Controls
 * ============================================================================
 *
 * This is the main logic hub for the music player. It handles:
 * - Loading song data into the <audio> element and UI.
 * - Play/pause/next/previous controls.
 * - Shuffle and repeat functionality.
 * - Updating progress bars and time displays.
 * - Seeking (scrubbing) the progress bar.
 * - Opening/closing the fullscreen player UI.
 * - Touch gesture handling (swipe-to-close on mobile).
 *
 * Architecture:
 * - Imports `dom` from playerDOM.js to manipulate UI elements.
 * - Imports `state` from playerState.js for playlist/queue management.
 * - Imports `formatTime` from utils.js for time display.
 * ============================================================================
*/

import { dom } from "./playerDOM.js";
import { state } from "./playerState.js";
import { formatTime } from "../utils/utils.js";

/**
 * Loads a song object into the audio element and updates all UI displays.
 * This updates both the mini-player and the fullscreen player.
 *
 * @param {object} song - Song object (must have title, artist, artworkUrl, fileUrl)
 * @returns {void}
 */
function loadSong(song) {
  // Safely get artist name, providing a fallback
  const artistName =
    song.artist && song.artist.name ? song.artist.name : "Unknown Artist";

  // --- Update mini-player UI ---
  dom.songTitleEl.textContent = song.title;
  dom.songArtistEl.textContent = artistName;
  dom.songAlbumArtEl.src = song.artworkUrl;

  // --- Update fullscreen player UI ---
  dom.fsSongTitle.textContent = song.title;
  dom.fsSongArtist.textContent = artistName;
  dom.fsAlbumArt.src = song.artworkUrl;

  // --- Load audio source ---
  dom.audio.src = song.fileUrl;
}

/**
 * Starts audio playback and updates the UI to the "playing" state.
 * - Updates play/pause icons in both mini and fullscreen players.
 * - Adds the 'playing' class to the album art disc for rotation animation.
 *
 * @async
 * @returns {Promise<void>}
 */
async function playSong() {
  try {
    // Start playback
    await dom.audio.play();

    // Update mini-player icon
    dom.playIcon.style.display = "none";
    dom.pauseIcon.style.display = "block";

    // Update fullscreen player icon
    dom.fsPlayIcon.style.display = "none";
    dom.fsPauseIcon.style.display = "block";

    // Start album art rotation
    dom.fsAlbumArtDisc.classList.add("playing");
  } catch (error) {
    // Handle cases where playback fails (e.g., user hasn't interacted with page)
    console.error("Audio playback failed:", error);
    pauseSong(); // Revert UI to paused state
  }
}

/**
 * Pauses audio playback and updates the UI to the "paused" state.
 * - Updates play/pause icons.
 * - Stops the album art rotation animation.
 *
 * @returns {void}
 */
function pauseSong() {
  dom.audio.pause();

  // Update mini-player icon
  dom.playIcon.style.display = "block";
  dom.pauseIcon.style.display = "none";

  // Update fullscreen player icon
  dom.fsPlayIcon.style.display = "block";
  dom.fsPauseIcon.style.display = "none";

  // Stop album art rotation
  dom.fsAlbumArtDisc.classList.remove("playing");
}

/**
 * Toggles between playing and paused states.
 * Does nothing if no song is loaded (dom.audio.src is empty).
 *
 * @returns {void}
 */
function togglePlayPause() {
  if (!dom.audio.src) return; // Don't do anything if no song is loaded
  const isPlaying = !dom.audio.paused;
  isPlaying ? pauseSong() : playSong();
}

/**
 * Plays the next song in the playlist (managed by playerState).
 * Handles both shuffle mode (random) and sequential play.
 *
 * @returns {void}
 */
function playNextSong() {
  if (state.isPlaylistEmpty()) return;
  const song = state.nextSong();
  loadSong(song);
  playSong();
}

/**
 * Plays the previous song in the playlist (managed by playerState).
 * Wraps around to the end of the playlist if at the beginning.
 *
 * @returns {void}
 */
function playPrevSong() {
  if (state.isPlaylistEmpty()) return;
  const song = state.prevSong();
  loadSong(song);
  playSong();
}

/**
 * Toggles shuffle mode on/off in the playerState.
 * Updates UI buttons (both mini and fullscreen) to show the active state.
 *
 * @returns {void}
 */
function toggleShuffle() {
  const isShuffleOn = state.toggleShuffle();
  // Toggle 'active' class on both buttons based on the new state
  dom.shuffleBtn.classList.toggle("active", isShuffleOn);
  dom.fsShuffleBtn.classList.toggle("active", isShuffleOn);
}

/**
 * Toggles repeat (loop) mode on/off for the <audio> element.
 * Updates UI buttons (both mini and fullscreen) to show the active state.
 *
 * @returns {void}
 */
function toggleRepeat() {
  dom.audio.loop = !dom.audio.loop; // Toggle the audio element's loop property
  // Toggle 'active' class on both buttons
  dom.repeatBtn.classList.toggle("active", dom.audio.loop);
  dom.fsRepeatBtn.classList.toggle("active", dom.audio.loop);
}

/**
 * Updates progress bar and time displays based on the audio's current position.
 * This function is called rapidly on the 'timeupdate' event.
 *
 * @returns {void}
 */
function updateProgress() {
  const { duration, currentTime } = dom.audio;

  // Check if duration is available (it might be NaN on load)
  if (duration) {
    // Calculate progress percentage
    const progressPercent = (currentTime / duration) * 100;

    // Update both progress bars
    dom.progressBar.value = progressPercent;
    dom.fsProgressBar.value = progressPercent;

    // Update time displays
    const formattedTime = formatTime(currentTime);
    dom.timeCurrent.textContent = formattedTime;
    dom.fsTimeCurrent.textContent = formattedTime;
  }
}

/**
 * Seeks to a new position in the song based on progress bar input.
 * Updates the audio's currentTime to match the user's scrub.
 *
 * @param {HTMLInputElement} inputElement - The progress bar <input> element (either mini or fullscreen)
 * @returns {void}
 */
function setProgressFromInput(inputElement) {
  const duration = dom.audio.duration;
  if (duration) {
    // Calculate new time based on percentage value of the input
    dom.audio.currentTime = (inputElement.value / 100) * duration;
  }
}

// ============================================================================
// FULLSCREEN PLAYER UI LOGIC
// ============================================================================

/**
 * Opens the fullscreen player view.
 * - Adds 'open' class to the player and 'fullscreen-open' to the body.
 * - Attaches touch listeners for swipe-to-close gesture.
 *
 * @returns {void}
 */
function openFullscreenPlayer() {
  dom.fullscreenPlayer.classList.add("open");
  document.body.classList.add("fullscreen-open"); // Prevents page content scrolling

  // Attach touch listeners for swipe gesture
  dom.fullscreenPlayer.addEventListener("touchstart", handleTouchStart, false);
  dom.fullscreenPlayer.addEventListener("touchmove", handleTouchMove, false);
  dom.fullscreenPlayer.addEventListener("touchend", handleTouchEnd, false);
}

/**
 * Closes the fullscreen player view.
 * - Removes 'open' classes.
 * - Removes touch listeners *after* the CSS transition completes.
 *
 * @returns {void}
 */
function closeFullscreenPlayer() {
  dom.fullscreenPlayer.classList.remove("open");
  document.body.classList.remove("fullscreen-open");

  // Wait for the CSS transition (400ms) before removing listeners
  // to prevent jank and ensure they are active during the slide-out.
  setTimeout(() => {
    dom.fullscreenPlayer.removeEventListener(
      "touchstart",
      handleTouchStart,
      false
    );
    dom.fullscreenPlayer.removeEventListener(
      "touchmove",
      handleTouchMove,
      false
    );
    dom.fullscreenPlayer.removeEventListener("touchend", handleTouchEnd, false);
  }, 400); // Matches CSS transition-duration
}

// ============================================================================
// TOUCH GESTURE HANDLING FOR FULLSCREEN PLAYER (SWIPE-TO-CLOSE)
// ============================================================================

let touchstartY = 0;
let touchEndY = 0;

/**
 * Records the starting Y position of a touch on the fullscreen player.
 *
 * @param {TouchEvent} e - The touch event
 * @returns {void}
 */
function handleTouchStart(e) {
  touchstartY = e.changedTouches[0].screenY;
}

/**
 * Prevents the page from scrolling while the fullscreen player is open.
 *
 * @param {TouchEvent} e - The touch event
 * @returns {void}
 */
function handleTouchMove(e) {
  const fs = dom.fullscreenPlayer;
  const isFullyOpen =
    fs &&
    fs.classList.contains("open") &&
    getComputedStyle(fs).visibility === "visible";

  // If the player is open, prevent default browser scroll behavior
  if (isFullyOpen) {
    e.preventDefault();
  }
}

/**
 * Checks if the user swiped down sufficiently to close the player.
 * Closes the fullscreen player if the swipe gesture is > 100px.
 *
 * @param {TouchEvent} e - The touch event
 * @returns {void}
 */
function handleTouchEnd(e) {
  touchEndY = e.changedTouches[0].screenY;
  // Check if the user swiped *down* (touchEndY > touchstartY) by at least 100px
  if (touchEndY > touchstartY + 100) {
    closeFullscreenPlayer();
  }
}

// ============================================================================
// PUBLIC API FUNCTIONS (Exported)
// ============================================================================

/**
 * PUBLIC: Sets a new playlist and immediately plays a song from it.
 * This is the main function called by other modules (like pageRenderer
 * or search) to start playback.
 *
 * @exports playSongFromPlaylist
 * @param {Array<object>} newPlaylist - Array of song objects
 * @param {number} index - Index of the song to play from the new playlist
 * @returns {void}
 */
export function playSongFromPlaylist(newPlaylist, index) {
  state.setPlaylist(newPlaylist, index); // Set the new playlist in playerState
  const song = state.getCurrentSong();
  loadSong(song);
  playSong();
}

/**
 * PUBLIC: Initializes all player event listeners.
 * Called once on app startup from app.js.
 *
 * @exports initPlayer
 * @returns {void}
 */
export function initPlayer() {
  // --- Fullscreen player open/close listeners ---
  dom.openFullscreenBtn.addEventListener("click", openFullscreenPlayer);
  // Also open fullscreen if user clicks the song info area on mobile
  dom.songInfoWrapper.addEventListener("click", openFullscreenPlayer);
  dom.closeFullscreenBtn.addEventListener("click", closeFullscreenPlayer);

  // --- Mini-player controls ---
  dom.playPauseBtn.addEventListener("click", togglePlayPause);
  dom.nextBtn.addEventListener("click", playNextSong);
  dom.prevBtn.addEventListener("click", playPrevSong);
  dom.shuffleBtn.addEventListener("click", toggleShuffle);
  dom.repeatBtn.addEventListener("click", toggleRepeat);
  dom.volumeSlider.addEventListener(
    "input",
    (e) => (dom.audio.volume = e.target.value / 100) // Update volume
  );

  // --- Fullscreen player controls ---
  dom.fsPlayPauseBtn.addEventListener("click", togglePlayPause);
  dom.fsNextBtn.addEventListener("click", playNextSong);
  dom.fsPrevBtn.addEventListener("click", playPrevSong);
  dom.fsShuffleBtn.addEventListener("click", toggleShuffle);
  dom.fsRepeatBtn.addEventListener("click", toggleRepeat);

  // --- Audio playback events ---
  dom.audio.addEventListener("timeupdate", updateProgress);
  dom.audio.addEventListener("loadedmetadata", () => {
    // When song is loaded, update the total duration display
    const formattedTime = formatTime(dom.audio.duration);
    dom.timeTotal.textContent = formattedTime;
    dom.fsTimeTotal.textContent = formattedTime;
  });
  dom.audio.addEventListener("ended", () => {
    // When song ends, play next (unless repeat-one is on)
    if (!dom.audio.loop) playNextSong();
  });

  // --- Progress bar seeking ---
  dom.progressBar.addEventListener("input", () =>
    setProgressFromInput(dom.progressBar)
  );
  dom.fsProgressBar.addEventListener("input", () =>
    setProgressFromInput(dom.fsProgressBar)
  );
}