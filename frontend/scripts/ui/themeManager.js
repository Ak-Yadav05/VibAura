/**
 * ============================================================================
 * VibAura Theme Manager - Smart 3-State Mode
 * ============================================================================
 *
 * Manages application theme switching with 3 modes:
 * 1. AUTO (Default) - Follows System Preference
 * 2. LIGHT - Forces Light Mode
 * 3. DARK - Forces Dark Mode
 *
 * Cycle: Auto -> Light -> Dark -> Auto
 */

const body = document.body;

/**
 * Access Safe LocalStorage
 * Returns null if access is denied/error
 */
function getSafeStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("[ThemeManager] Storage access denied, utilizing fallback.");
    return null;
  }
}

function setSafeStorage(key, value) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn("[ThemeManager] Storage access denied, cannot save preference.");
  }
}

/**
 * Applies the specified theme logic and updates UI icons.
 * 
 * @param {string|null} theme - "light", "dark", or null (for Auto)
 */
function applyTheme(theme) {
  let isDark = false;

  // 1. Determine effective theme (Dark or Light)
  if (theme === "dark") {
    isDark = true;
  } else if (theme === "light") {
    isDark = false;
  } else {
    // Auto Mode: Use System Preference
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // 2. Apply to Body
  if (isDark) {
    body.classList.add("dark-theme");
  } else {
    body.classList.remove("dark-theme");
  }

  // 3. Update Icons (Sun vs Moon vs Auto)
  const toggles = document.querySelectorAll(".theme-toggle");
  toggles.forEach((toggle) => {
    const sunIcon = toggle.querySelector(".sun-icon");
    const moonIcon = toggle.querySelector(".moon-icon");
    const autoIcon = toggle.querySelector(".auto-icon");

    // Reset all
    if (sunIcon) sunIcon.style.display = "none";
    if (moonIcon) moonIcon.style.display = "none";
    if (autoIcon) autoIcon.style.display = "none";

    // Show active state icon
    if (!theme || theme === "auto") {
      if (autoIcon) autoIcon.style.display = "block";
    } else if (theme === "light") {
      if (sunIcon) sunIcon.style.display = "block";
    } else if (theme === "dark") {
      if (moonIcon) moonIcon.style.display = "block";
    }
  });
}

/**
 * Toggles the theme in a cycle: Auto -> Light -> Dark -> Auto
 */
export function toggleTheme() {
  const currentSaved = getSafeStorage("vibAuraTheme"); // null, "light", "dark"
  let newTheme = null;

  if (!currentSaved || currentSaved === "auto") {
    newTheme = "light";
  } else if (currentSaved === "light") {
    newTheme = "dark";
  } else {
    newTheme = "auto"; // Back to Auto (clears preference)
  }

  // Save Preference
  setSafeStorage("vibAuraTheme", newTheme === "auto" ? null : newTheme);

  // Apply
  applyTheme(newTheme === "auto" ? null : newTheme);
}

/**
 * Initializes the theme manager.
 */
export function initThemeManager() {
  const savedTheme = getSafeStorage("vibAuraTheme");

  // Apply initial state
  applyTheme(savedTheme);

  // Attach Listeners
  const desktopToggle = document.getElementById("theme-toggle");
  if (desktopToggle) desktopToggle.addEventListener("click", toggleTheme);

  const mobileToggle = document.getElementById("mobile-theme-toggle");
  if (mobileToggle) mobileToggle.addEventListener("click", toggleTheme);

  // Listen for System Changes (Only affects AUTO mode)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!getSafeStorage("vibAuraTheme")) {
        applyTheme(null); // Re-evaluate Auto logic
      }
    });
}