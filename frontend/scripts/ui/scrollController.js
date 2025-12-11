/**
 * ============================================================================
 * VibAura Scroll Controller - Page Scroll Effects & Custom Scrollbar
 * ============================================================================
 *
 * Manages:
 * 1. Scroll-triggered visual effects on the main desktop page header
 * 2. Custom scrollbar for the main content area
 *
 * Features:
 * - Header shadow on scroll
 * - Custom scrollbar with dynamic positioning and sizing
 * - Smooth drag functionality
 * - Works on dynamically rendered pages (playlist, artist)
 * ============================================================================
 */

/**
 * Updates the position and height of the custom scrollbar thumb
 * based on the content's scroll state and viewport position
 */
function updateCustomScrollbarPosition(content, thumb, scrollbarContainer) {
  const scrollHeight = content.scrollHeight;
  const clientHeight = content.clientHeight;
  const scrollTop = content.scrollTop;
  const contentRect = content.getBoundingClientRect();

  // Set scrollbar position and height to match content element
  scrollbarContainer.style.top = contentRect.top + 'px';
  scrollbarContainer.style.height = contentRect.height + 'px';

  // Hide scrollbar if content fits without scrolling
  if (scrollHeight <= clientHeight) {
    scrollbarContainer.style.display = 'none';
    return;
  }

  scrollbarContainer.style.display = 'block';

  // Calculate thumb dimensions and position
  const thumbHeight = (clientHeight / scrollHeight) * clientHeight;
  const maxScroll = scrollHeight - clientHeight;
  const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
  const maxThumbPosition = clientHeight - thumbHeight;
  const thumbTop = scrollPercentage * maxThumbPosition;

  thumb.style.height = Math.max(20, thumbHeight) + 'px';
  thumb.style.top = thumbTop + 'px';
}

/**
 * Initializes the scroll controller for header effects and custom scrollbar
 */
export function initScrollController() {
  const navHeader = document.querySelector(".nav");
  const mobileHeader = document.querySelector(".mobile-header");
  const contentArea = document.querySelector(".content");
  const customScrollbar = document.querySelector(".custom-scrollbar");
  const scrollbarThumb = document.querySelector(".custom-scrollbar-thumb");

  if (!contentArea) {
    console.warn(
      "VibAura: Content area (.content) not found for scroll controller."
    );
    return;
  }

  const hasCustomScrollbar = customScrollbar && scrollbarThumb;

  // Handle scroll events for header shadow and scrollbar position
  const handleScroll = () => {
    if (contentArea.scrollTop > 1) {
      // Add scrolled class to content area for inset shadow effect
      contentArea.classList.add("scrolled");
    } else {
      contentArea.classList.remove("scrolled");
    }

    if (hasCustomScrollbar) {
      updateCustomScrollbarPosition(contentArea, scrollbarThumb, customScrollbar);
    }
  };

  contentArea.addEventListener("scroll", handleScroll);

  // Detect dynamic content changes
  if (hasCustomScrollbar) {
    const mutationObserver = new MutationObserver(() => {
      updateCustomScrollbarPosition(contentArea, scrollbarThumb, customScrollbar);
    });

    mutationObserver.observe(contentArea, {
      childList: true,
      subtree: true,
    });
  }

  // Custom scrollbar drag functionality
  if (hasCustomScrollbar) {
    let isDragging = false;
    let thumbYOffset = 0;

    scrollbarThumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      scrollbarThumb.classList.add("dragging");
      e.preventDefault();

      const thumbRect = scrollbarThumb.getBoundingClientRect();
      thumbYOffset = e.clientY - thumbRect.top;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      scrollbarThumb.classList.remove("dragging");
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const scrollbarContainerRect = customScrollbar.getBoundingClientRect();
      const scrollbarHeight = scrollbarContainerRect.height;
      const thumbHeight = scrollbarThumb.offsetHeight;
      const maxThumbPosition = scrollbarHeight - thumbHeight;
      const mouseYRelativeToTrack = e.clientY - scrollbarContainerRect.top;
      const newThumbTop = mouseYRelativeToTrack - thumbYOffset;
      const clampedThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbPosition));
      const scrollPercentage = maxThumbPosition > 0 ? clampedThumbTop / maxThumbPosition : 0;

      contentArea.scrollTop = scrollPercentage * (contentArea.scrollHeight - contentArea.clientHeight);
    });

    // Initialize scrollbar on load and observe size changes
    updateCustomScrollbarPosition(contentArea, scrollbarThumb, customScrollbar);

    window.addEventListener("resize", () => {
      updateCustomScrollbarPosition(contentArea, scrollbarThumb, customScrollbar);
    });

    const resizeObserver = new ResizeObserver(() => {
      updateCustomScrollbarPosition(contentArea, scrollbarThumb, customScrollbar);
    });

    resizeObserver.observe(contentArea);
  }

  // Apply initial header state
  if (contentArea.scrollTop > 1) {
    if (navHeader) navHeader.classList.add("scrolled");
    if (mobileHeader) mobileHeader.classList.add("scrolled");
  }
}

