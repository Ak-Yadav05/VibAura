/**
 * ============================================================================
 * VibAura Component Builder - UI Element Creation
 * ============================================================================
 *
 * Factory functions for creating reusable UI components:
 * - Skeleton loading placeholders (shimmer animation)
 * - Album/Artist/Playlist card sections
 * - Clickable cards with images and metadata
 * - Horizontal scroll navigation buttons
 *
 * Component patterns:
 * - Skeleton sections show immediately for perceived performance
 * - Real content sections build from API data with click handlers
 * - Scroll buttons appear on hover and enable horizontal card scrolling
 * ============================================================================
 */

import { playSongFromPlaylist } from "../player/playerController.js";

/**
 * Creates a skeleton loading section with placeholder cards.
 * Used to show immediate visual feedback while content is being fetched.
 *
 * Features:
 * - Displays a title (e.g., "Loading...")
 * - Shows a specified number of placeholder cards with a shimmer animation
 * - Uses CSS classes defined in skeleton.css
 *
 * @param {string} [title="Loading..."] - Section header text
 * @param {number} [count=8] - Number of placeholder cards to show
 * @returns {HTMLElement} A <section> element containing the skeleton placeholders
 */
export function createSkeletonSection(title = "Loading...", count = 8) {
  const section = document.createElement("section");
  section.classList.add("album-section", "skeleton-section");

  // Generate the HTML for the skeleton cards
  const skeletonCardsHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-text title"></div>
        <div class="skeleton-text subtitle"></div>
      </div>`
    )
    .join("");

  // Set the inner HTML of the section
  section.innerHTML = `
    <div class="section-header">
      <h2>${title}</h2>
    </div>
    <div class="wrapper">
      <div class="card-container">
        ${skeletonCardsHTML}
      </div>
    </div>
  `;

  return section;
}

/**
 * Creates a complete section with a title and a scrollable card grid.
 * Includes left/right scroll buttons for horizontal navigation.
 *
 * Handles different content types:
 * - Songs: Displays artwork, title, artist
 * - Artists: Displays artwork, artist name (circular)
 * - Playlists: Displays artwork, playlist name
 *
 * @param {object} section - Section data object from the API
 * @param {string} section.title - The section heading (e.g., "Trending")
 * @param {string} section.type - Content type: "song", "artist", or "playlist"
 * @param {Array} section.songs - Array of songs (if type === "song")
 * @param {Array} section.items - Array of artists/playlists (if type !== "song")
 * @returns {DocumentFragment} A fragment containing the complete section HTML
 */
export function createSectionElement(section) {
  // Use a DocumentFragment for efficient DOM insertion
  const fragment = document.createDocumentFragment();

  // Create section title
  const sectionTitle = document.createElement("h2");
  sectionTitle.textContent = section.title;
  fragment.appendChild(sectionTitle);

  // Create wrapper (for scroll buttons and card container)
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";
  if (section.type === "artist") {
    // Add specific class for artist sections (for circular images)
    wrapper.classList.add("artist-section");
  }

  // Create card container
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";

  // Get the correct array of items (API uses 'songs' or 'items')
  const items = section.songs || section.items;

  // Populate container with cards
  items.forEach((item, index) => {
    cardContainer.appendChild(createCardElement(item, section, index));
  });

  // Assemble wrapper with scroll controls
  wrapper.appendChild(createScrollButton("scroll-left"));
  wrapper.appendChild(cardContainer);
  wrapper.appendChild(createScrollButton("scroll-right"));
  fragment.appendChild(wrapper);

  return fragment;
}

/**
 * Creates an individual clickable card for a song, artist, or playlist.
 *
 * Behavior:
 * - Songs: Click plays the song from this section's playlist.
 * - Artists/Playlists: Click navigates to the detail page (#/artist/:id).
 *
 * @param {object} item - The data object (song, artist, or playlist)
 * @param {object} section - Parent section data (to determine type and full playlist)
 * @param {number} index - Index of this item in its array (for playback)
 * @returns {HTMLElement} A <div> element with the class "card"
 */
function createCardElement(item, section, index) {
  const card = document.createElement("div");
  card.className = "card";

  // --- 1. Set up click behavior based on content type ---
  if (section.type === "song") {
    // Click plays song from the *current section* as a playlist
    card.addEventListener("click", () => {
      playSongFromPlaylist(section.songs, index);
    });
  } else {
    // Click navigates to the detail page (artist or playlist)
    card.addEventListener("click", () => {
      window.location.hash = `#/${section.type}/${item._id}`;
    });
  }

  // --- 2. Create image element with appropriate source and fallback ---
  const imgDiv = document.createElement("div");
  imgDiv.className = "card-img-div";
  const img = document.createElement("img");

  // Determine the correct image URL property and fallback
  if (section.type === "song") {
    img.src = item.artworkUrl;
  } else if (section.type === "artist") {
    img.src = item.artworkUrl || "images/Artist.png"; // Fallback for artist
  } else if (section.type === "playlist") {
    img.src = item.artworkUrl || item.coverImageUrl || "images/Playlist.png"; // Fallback for playlist
  }

  img.alt = item.name || item.title;
  img.className = "album-img";
  imgDiv.appendChild(img);

  // --- 3. Create title/name element ---
  const nameDiv = document.createElement("div");
  nameDiv.className = "album-name-div";
  const name = document.createElement("div");
  name.className = "album-name";
  name.textContent = item.name || item.title;
  nameDiv.appendChild(name);

  // --- 4. Assemble card ---
  card.appendChild(imgDiv);
  card.appendChild(nameDiv);

  // --- 5. Add artist name (for songs only) ---
  if (section.type === "song") {
    const artist = document.createElement("div");
    artist.className = "artist-name";
    // Safely access nested artist name
    artist.textContent =
      item.artist && item.artist.name
        ? item.artist.name
        : "Unknown Artist";
    card.appendChild(artist);
  }

  return card;
}

/**
 * Creates a left/right scroll navigation button.
 * Hidden by default, shown on hover (via CSS).
 *
 * @param {string} direction - Button type: "scroll-left" or "scroll-right"
 * @returns {HTMLElement} A <button> element with a directional arrow
 */
function createScrollButton(direction) {
  const btn = document.createElement("button");
  btn.className = `scroll-btn ${direction}`;
  // Use HTML entities for arrows
  btn.innerHTML = direction === "scroll-left" ? "&#10094;" : "&#10095;";
  return btn;
}

/**
 * Attaches scroll event listeners to all card containers on the page.
 * This function should be called *after* new sections are added to the DOM.
 *
 * Features:
 * - Scroll buttons appear/hide on hover (by adding/removing 'show-buttons' class)
 * - Smooth horizontal scrolling on button click
 * - Scroll distance: 1200px per click
 *
 * @exports attachScrollButtonListeners
 * @returns {void}
 */
export function attachScrollButtonListeners() {
  document.querySelectorAll(".wrapper").forEach((wrapper) => {
    const cardContainer = wrapper.querySelector(".card-container");
    const leftBtn = wrapper.querySelector(".scroll-left");
    const rightBtn = wrapper.querySelector(".scroll-right");

    // Show buttons on hover
    wrapper.addEventListener("mouseenter", () =>
      wrapper.classList.add("show-buttons")
    );
    wrapper.addEventListener("mouseleave", () =>
      wrapper.classList.remove("show-buttons")
    );

    // Scroll on button click
    leftBtn.addEventListener("click", () =>
      cardContainer.scrollBy({ left: -1200, behavior: "smooth" })
    );
    rightBtn.addEventListener("click", () =>
      cardContainer.scrollBy({ left: 1200, behavior: "smooth" })
    );
  });
}