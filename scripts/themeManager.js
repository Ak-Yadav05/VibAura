const body = document.body;

// Function to apply the theme and update icons
function applyTheme(theme) {
  const isDarkMode = theme === "dark";
  body.classList.toggle("dark-theme", isDarkMode);

  // Update icons on both desktop and mobile toggles if they exist
  const toggles = document.querySelectorAll(".theme-toggle");
  toggles.forEach((toggle) => {
    const sunIcon = toggle.querySelector(".sun-icon");
    const moonIcon = toggle.querySelector(".moon-icon");
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDarkMode ? "none" : "block";
      moonIcon.style.display = isDarkMode ? "block" : "none";
    }
  });
}

// Public function to be called on click
export function toggleTheme() {
  const currentTheme = body.classList.contains("dark-theme") ? "light" : "dark";
  localStorage.setItem("vibAuraTheme", currentTheme); // Save manual choice
  applyTheme(currentTheme);
}

// Main initialization function
export function initThemeManager() {
  const savedTheme = localStorage.getItem("vibAuraTheme");

  if (savedTheme) {
    // 1. If a theme is saved in localStorage, use it.
    applyTheme(savedTheme);
  } else {
    // 2. If no theme is saved, check the device preference.
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  // Attach listener to desktop toggle
  const desktopToggle = document.getElementById("theme-toggle");
  if (desktopToggle) {
    desktopToggle.addEventListener("click", toggleTheme);
  }

  // Attach listener to the new mobile toggle
  const mobileToggle = document.getElementById("mobile-theme-toggle");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", toggleTheme);
  }

  // Also, listen for OS-level theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      // Only change if the user has NOT made a manual choice
      if (!localStorage.getItem("vibAuraTheme")) {
        applyTheme(event.matches ? "dark" : "light");
      }
    });
}