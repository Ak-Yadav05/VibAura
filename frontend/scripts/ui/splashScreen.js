/**
 * ============================================================================
 * VibAura Splash Screen - Initialization & Animation Manager
 * ============================================================================
 *
 * Manages the splash screen overlay shown on initial page load. Coordinates:
 * - Animation timing with fade-in effects (defined in splash.css)
 * - Theme application (light/dark mode) before splash renders
 * - Auto-hide after timeout (3 seconds) or user interaction (click/key)
 * - System theme preference detection
 * - Exports a global promise for the router to synchronize with
 *
 * Key exports (attached to the window object):
 * - window.splashAnimationDone : A Promise that resolves when the splash
 * screen has finished its out-animation.
 * - window.hideSplashScreen()  : A function to manually hide the splash
 * screen and resolve the promise.
 *
 * Initialization flow:
 * 1. `initSplashScreen` is called by app.js.
 * 2. It finds the #splash-screen element.
 * 3. It creates the `window.splashAnimationDone` promise.
 * 4. *Inside* the promise, it immediately applies the correct theme
 * (this prevents a flash of the wrong theme).
 * 5. It adds `splash-active` to the body to hide main content.
 * 6. It defines `window.hideSplashScreen`.
 * 7. It sets a 3-second timeout to call `hideSplashScreen`.
 * 8. It adds event listeners for click/keydown to call `hideSplashScreen` early.
 * ============================================================================
*/

/**
 * Initializes the splash screen.
 * This function sets up the theme, animations, and the global promise
 * `window.splashAnimationDone` which the router.js module awaits before
 * rendering the homepage for the first time.
 *
 * @exports initSplashScreen
 * @returns {void}
 */
export function initSplashScreen() {
  const splashScreen = document.getElementById("splash-screen");

  if (!splashScreen) {
    console.warn("Splash screen element not found in DOM");
    // If no splash screen, resolve the promise immediately so the app doesn't hang
    window.splashAnimationDone = Promise.resolve();
    return;
  }

  // Create a global promise that resolves when the splash animation completes.
  // The router uses this to wait before rendering the homepage.
  window.splashAnimationDone = new Promise((resolve) => {
    /**
     * Applies the user's saved theme or system preference to the splash screen
     * and document body. This *must* run before the splash renders
     * to prevent a flash of unstyled content (FOUC) or the wrong theme.
     *
     * Priority order:
     * 1. Saved preference in localStorage (user's manual choice)
     * 2. System OS preference (prefers-color-scheme media query)
     * 3. Default to light theme
     *
     * @inner
     * @returns {void}
     */
    const applyThemeToSplash = () => {
      const savedTheme = localStorage.getItem("vibAuraTheme");

      if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
      } else if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
      } else {
        // No saved preference - check system OS preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
          document.body.classList.add("dark-theme");
        } else {
          document.body.classList.remove("dark-theme");
        }
      }
    };

    // Apply theme *immediately*
    // Note: This logic is duplicated in index.html <head> script.
    // The <head> script handles the *very first* paint.
    // This ensures consistency if the module loads later.
    applyThemeToSplash();

    // Add class to hide main content (defined in splash.css)
    document.body.classList.add("splash-active");

    /**
     * Manually hides the splash screen and resolves the global promise.
     * This function is idempotent (can be called multiple times safely).
     *
     * @inner
     * @returns {void}
     */
    window.hideSplashScreen = function () {
      // Check if splashScreen is still in the DOM
      if (!document.getElementById("splash-screen")) return;

      // Remove splash-active class to show main content
      document.body.classList.remove("splash-active");

      // Remove splash screen from DOM after a short delay for smooth transition
      setTimeout(() => {
        try {
          const splash = document.getElementById("splash-screen");
          if (splash) {
            splash.remove();
          }
        } catch (e) {
          // Fallback if .remove() fails
          const splash = document.getElementById("splash-screen");
          if (splash) {
            splash.style.display = "none";
          }
        }
        resolve(); // Fulfill the promise so the router can proceed
      }, 100); // 100ms delay for CSS to catch up
    };

    // Auto-hide splash screen after 3 seconds
    let splashTimeout = setTimeout(window.hideSplashScreen, 3000);

    /**
     * Closes splash screen on any user interaction (click, keyboard).
     * Clears the auto-hide timeout and removes its own listeners.
     *
     * @inner
     * @returns {void}
     */
    const hideOnInteraction = () => {
      clearTimeout(splashTimeout); // Cancel the auto-hide
      window.hideSplashScreen();
      // Clean up listeners to prevent multiple calls
      document.removeEventListener("click", hideOnInteraction);
      document.removeEventListener("keydown", hideOnInteraction);
    };

    // Add interaction listeners to allow early splash dismissal
    document.addEventListener("click", hideOnInteraction);
    document.addEventListener("keydown", hideOnInteraction);

    // Handle visibility change (e.g., user tabs away)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // If user tabs away, pause the timeout
        clearTimeout(splashTimeout);
      } else {
        // If user tabs back, restart a (new) timeout
        splashTimeout = setTimeout(window.hideSplashScreen, 3000);
      }
    });

    // Listen for OS-level theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

      darkModeQuery.addEventListener("change", (e) => {
        // Only apply if user *has not* manually set a theme preference
        if (!localStorage.getItem("vibAuraTheme")) {
          applyThemeToSplash();
        }
      });
    }
  });
}