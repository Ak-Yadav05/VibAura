/**
 * ============================================================================
 * VibAura Mobile - Mobile-Specific Functionality
 * ============================================================================
 *
 * Module for mobile-specific event handlers and UI adjustments.
 *
 * This module is kept as a placeholder for future mobile-specific features
 * and is imported by app.js for potential future use.
 * ============================================================================
 */

window.addEventListener("DOMContentLoaded", function () {
  /**
   * GLOBAL CONTEXT MENU SUPPRESSION
   * Blocks the native browser context menu app-wide on mobile devices.
   */
  const handleContextMenu = (e) => {
    // Only prevent if not on an input field (to allow copy/paste/editing)
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  if (window.innerWidth <= 768) {
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
  }

  const libraryMenu = document.getElementById("libraryMenu");
});