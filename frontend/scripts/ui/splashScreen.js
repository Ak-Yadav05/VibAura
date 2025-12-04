/**
 * VibAura Splash Screen Manager
 * Manages splash screen display, auto-hide, and user interaction dismissal.
 * Exports a global promise that router.js awaits before rendering.
 */

// Initializes splash screen with auto-hide timeout and interaction listeners
export function initSplashScreen() {
  const splashScreen = document.getElementById("splash-screen");

  if (!splashScreen) {
    console.warn("Splash screen element not found in DOM");
    window.splashAnimationDone = Promise.resolve();
    return;
  }

  window.splashAnimationDone = new Promise((resolve) => {
    document.body.classList.add("splash-active");

    // Hides splash screen, removes it from DOM, and resolves the promise
    window.hideSplashScreen = function () {
      if (!document.getElementById("splash-screen")) return;

      document.body.classList.remove("splash-active");

      setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        if (splash) splash.remove();
        resolve();
      }, 100);
    };

    // Auto-hide splash after 3 seconds
    let splashTimeout = setTimeout(window.hideSplashScreen, 3000);

    // Hides splash on user click or keypress, clears timeout, and removes listeners
    const hideOnInteraction = () => {
      clearTimeout(splashTimeout);
      window.hideSplashScreen();
      document.removeEventListener("click", hideOnInteraction);
      document.removeEventListener("keydown", hideOnInteraction);
    };

    document.addEventListener("click", hideOnInteraction);
    document.addEventListener("keydown", hideOnInteraction);
  });
}