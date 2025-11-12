/**
 * ============================================================================
 * VibAura Theme Manager - Dark/Light Mode Management
 * ============================================================================
 *
 * Manages application theme switching between light and dark modes.
 * Persists user preference to localStorage and respects OS/system preference
 * as a fallback when no manual selection is made.
 *
 * Features:
 * - Toggles dark/light theme with immediate visual update.
 * - Persists user preference to localStorage.
 * - Detects system OS preference (prefers-color-scheme).
 * - Listens for OS-level theme changes and updates if no user preference is set.
 * - Updates all UI toggle buttons (desktop and mobile) on theme change.
 *
 * CSS variable organization:
 * - Light mode colors are defined in :root (base.css).
 * - Dark mode overrides are in body.dark-theme (base.css).
 * ============================================================================
*/

const body = document.body;

/**
 * Applies the specified theme to the document and updates theme toggle UI.
 * It adds or removes the "dark-theme" class on the <body> element, which
 * triggers all CSS variable overrides for dark mode.
 *
 * @param {string} theme - The theme to apply: "dark" or "light"
 * @returns {void}
 */
function applyTheme(theme) {
  const isDarkMode = theme === "dark";

  // Toggle the main theme class on the body
  body.classList.toggle("dark-theme", isDarkMode);

  // Update sun/moon icons on *all* theme toggle buttons
  // (e.g., one for desktop, one for mobile header)
  const toggles = document.querySelectorAll(".theme-toggle");
  toggles.forEach((toggle) => {
    const sunIcon = toggle.querySelector(".sun-icon");
    const moonIcon = toggle.querySelector(".moon-icon");

    if (sunIcon && moonIcon) {
      // Show moon icon in dark mode, sun icon in light mode
      sunIcon.style.display = isDarkMode ? "none" : "block";
      moonIcon.style.display = isDarkMode ? "block" : "none";
    }
  });
}

/**
 * Toggles the active theme between light and dark modes.
 * Saves the user's *explicit* preference to localStorage for persistence
 * across sessions. Immediately applies the new theme.
 *
 * @exports toggleTheme
 * @returns {void}
 */
export function toggleTheme() {
  // Determine the *new* theme
  const currentTheme = body.classList.contains("dark-theme") ? "light" : "dark";

  // Save this choice to localStorage
  localStorage.setItem("vibAuraTheme", currentTheme);

  // Apply the new theme
  applyTheme(currentTheme);
}

/**
 * Initializes the theme manager on application startup.
 * Called once by app.js.
 *
 * Theme selection priority:
 * 1. User's saved preference (localStorage) - This overrides system preference.
 * 2. System OS preference (prefers-color-scheme media query).
 * 3. Default to light theme (if system preference is not available).
 *
 * Also attaches click listeners to all theme toggle buttons.
 *
 * @exports initThemeManager
 * @returns {void}
 */
export function initThemeManager() {
  const savedTheme = localStorage.getItem("vibAuraTheme");

  if (savedTheme) {
    // 1. User has manually set a theme preference - use this saved choice.
    applyTheme(savedTheme);
  } else {
    // 2. No saved preference - check system OS preference.
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  // Attach listener to desktop theme toggle button
  const desktopToggle = document.getElementById("theme-toggle");
  if (desktopToggle) {
    desktopToggle.addEventListener("click", toggleTheme);
  }

  // Attach listener to mobile theme toggle button
  const mobileToggle = document.getElementById("mobile-theme-toggle");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", toggleTheme);
  }

  // Listen for OS-level theme changes (e.g., user's OS switches at sunset)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      // *Only* apply the change if the user hasn't manually set a theme.
      if (!localStorage.getItem("vibAuraTheme")) {
        applyTheme(event.matches ? "dark" : "light");
      }
    });
}