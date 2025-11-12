/**
 * ============================================================================
 * VibAura Utils - Shared Utility Functions
 * ============================================================================
 *
 * Collection of common utility functions used throughout the application.
 * Includes time formatting and other helper functions.
 * ============================================================================
 */

/**
 * Converts duration in seconds to a formatted time string "M:SS".
 * Used for displaying song durations and playback progress.
 *
 * Examples:
 * - 221 seconds → "3:41"
 * - 15 seconds → "0:15"
 * - 3661 seconds → "61:01" (handles durations over 1 hour)
 *
 * @param {number} seconds - The duration in seconds (will be floored to an integer)
 * @returns {string} Formatted time string in "M:SS" format
 */
export function formatTime(seconds) {
  // Ensure we are working with an integer
  const flooredSeconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(flooredSeconds / 60);
  const secs = flooredSeconds % 60;

  // Return formatted string, padding seconds with a '0' if less than 10
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}