/**
 * ============================================================================
 * VibAura Player State - Playlist & Playback State Management
 * ============================================================================
 *
 * Manages the internal player state using a closure pattern.
 * This module keeps track of the current playlist, the index of the
 * currently playing song, and whether shuffle mode is active.
 *
 * All state is private to this module and is only accessed or modified
 * through the exported `state` object.
 *
 * Private State Variables:
 * - _playlist : An array of song objects.
 * - _currentSongIndex : The index of the song in `_playlist` that is
 * currently loaded or playing.
 * - _isShuffleOn : A boolean flag indicating if shuffle mode is active.
 * ============================================================================
*/

// ============================================================================
// PRIVATE STATE VARIABLES (Protected by closure)
// ============================================================================

let _playlist = []; // The current queue of songs
let _currentSongIndex = 0; // The index of the currently active song
let _isShuffleOn = false; // Flag for shuffle mode

// ============================================================================
// PUBLIC STATE API
// ============================================================================

/**
 * Exported state management API.
 * Provides a clean interface to interact with the private player state.
 *
 * @exports state
 * @type {object}
 */
export const state = {
  /**
   * Sets a new playlist and initializes playback at a specific index.
   * This is called when a user clicks on a song from a list
   * (e.g., in a card section, artist page, or search result).
   *
   * @param {Array<object>} newPlaylist - An array of song objects to queue.
   * @param {number} index - The index of the song in the new playlist to
   * start playing immediately.
   * @returns {void}
   */
  setPlaylist: (newPlaylist, index) => {
    _playlist = newPlaylist;
    _currentSongIndex = index;
  },

  /**
   * Advances to the next song in the playlist.
   * - If shuffle is ON, it picks a new random song.
   * - If shuffle is OFF, it plays the next song sequentially, wrapping
   * around to the beginning if at the end of the playlist.
   *
   * @returns {object} The next song object to be played.
   */
  nextSong: () => {
    if (_isShuffleOn) {
      // Shuffle mode: select a random song index
      _currentSongIndex = Math.floor(Math.random() * _playlist.length);
    } else {
      // Sequential mode: advance to next, wrap around at end
      _currentSongIndex = (_currentSongIndex + 1) % _playlist.length;
    }
    return _playlist[_currentSongIndex];
  },

  /**
   * Goes back to the previous song in the playlist.
   * - Wraps around to the end of the playlist if at the beginning.
   * - Note: Shuffle mode does not affect "previous" behavior; it always
   * goes back one in the sequence.
   *
   * @returns {object} The previous song object to be played.
   */
  prevSong: () => {
    // The modulo operator handles wrapping around from index 0 to the end
    _currentSongIndex =
      (_currentSongIndex - 1 + _playlist.length) % _playlist.length;
    return _playlist[_currentSongIndex];
  },

  /**
   * Toggles shuffle mode on or off.
   *
   * @returns {boolean} The *new* shuffle state (true = on, false = off).
   */
  toggleShuffle: () => {
    _isShuffleOn = !_isShuffleOn;
    return _isShuffleOn;
  },

  /**
   * Retrieves the currently playing song object from the playlist.
   *
   * @returns {object} The current song object.
   */
  getCurrentSong: () => {
    return _playlist[_currentSongIndex];
  },

  /**
   * Checks if the current playlist is empty.
   * Used to prevent errors when trying to play from an empty list.
   *
   * @returns {boolean} True if the playlist is empty, false otherwise.
   */
  isPlaylistEmpty: () => {
    return _playlist.length === 0;
  },
};