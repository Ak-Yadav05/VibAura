/**
 * ============================================================================
 * VibAura Scroll Controller - Page Scroll Effects
 * ============================================================================
 *
 * Manages scroll-triggered visual effects on the main desktop page header.
 * Adds a shadow/elevation to the header when the user scrolls down.
 *
 * Effect:
 * - Header is flat (no shadow) when page is at the top (scrollTop <= 1px).
 * - Header adds a drop shadow when the user scrolls down.
 * - The shadow color adapts to dark/light theme via CSS.
 * ============================================================================
 */

/**
 * Initializes the scroll controller to detect scroll position changes.
 * Adds/removes the "scrolled" class on the header element (.nav)
 * to trigger CSS effects defined in header.css.
 *
 * CSS classes:
 * - .nav : The header element to apply scroll effects to.
 * - .nav.scrolled : The class added when the page scrolls > 1px.
 * - .content : The main content area that is being scrolled.
 *
 * @exports initScrollController
 * @returns {void}
 */
export function initScrollController() {
  const navHeader = document.querySelector(".nav");
  const contentArea = document.querySelector(".content");

  // Check if required DOM elements exist before adding listeners
  if (!navHeader || !contentArea) {
    console.warn(
      "VibAura: Header (.nav) or Content area (.content) not found for scroll controller."
    );
    return;
  }

  // Listen for scroll events on the main content area
  contentArea.addEventListener("scroll", () => {
    // Add 'scrolled' class if scrolled more than 1px
    if (contentArea.scrollTop > 1) {
      navHeader.classList.add("scrolled");
    } else {
      // Remove 'scrolled' class if at the top
      navHeader.classList.remove("scrolled");
    }
  });

  // Check if already scrolled on page load/refresh
  // (e.g., if the user refreshes mid-scroll)
  if (contentArea.scrollTop > 1) {
    navHeader.classList.add("scrolled");
  }
}