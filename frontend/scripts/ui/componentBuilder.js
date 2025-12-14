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
import { PlaylistService } from "../services/playlistService.js";
import { getCurrentUser } from "../auth/authService.js";
import { BottomSheetManager } from "./bottomSheetManager.js";

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
  // Click Handler Wrapper to support Long Press interruption
  const handleClick = (callback) => {
    return (e) => {
      // Ignore clicks on action buttons
      if (e.target.closest('.card-options-btn')) return;
      // If long press triggered, ignore click
      if (card.dataset.longPressTriggered === 'true') {
        card.dataset.longPressTriggered = 'false';
        return;
      }
      callback(e);
    };
  };

  if (section.type === "song") {
    card.addEventListener("click", handleClick(() => {
      playSongFromPlaylist(section.songs, index);
    }));

    const optionsBtn = document.createElement('button');
    optionsBtn.className = 'card-options-btn';
    optionsBtn.innerHTML = '<img src="images/icons/more.png" style="width:16px; height:16px;">';
    optionsBtn.title = "Add to playlist";
    optionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      openAddToPlaylistModal(item);
    });
    card.appendChild(optionsBtn);
    card.addEventListener('mouseenter', () => optionsBtn.style.opacity = '1');
    card.addEventListener('mouseleave', () => optionsBtn.style.opacity = '0');

  } else {
    // Click navigates to the detail page (artist or playlist)
    card.addEventListener("click", handleClick(() => {
      window.location.hash = `#/${section.type}/${item._id}`;
    }));
  }

  // --- LONG PRESS DETECTION (Mobile) ---
  // Applies to ALL card types (Song, Artist, Playlist)
  let longPressTimer;
  const holdDuration = 500; // ms

  card.addEventListener('touchstart', (e) => {
    if (e.target.closest('.card-options-btn')) return;

    card.dataset.longPressTriggered = 'false';
    longPressTimer = setTimeout(() => {
      // Trigger Bottom Sheet
      card.dataset.longPressTriggered = 'true';
      if (navigator.vibrate) navigator.vibrate(50);

      // Open Bottom Sheet with correct type
      // Mongoose objects might need normalization, but 'item' usually works
      BottomSheetManager.open(section.type, item);
    }, holdDuration);
  }, { passive: true });

  card.addEventListener('touchend', () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  });

  card.addEventListener('touchmove', () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  });

  // Prevent default context menu (browser popup) on long press
  card.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
  // -------------------------------------

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
      item.artists && item.artists.length > 0
        ? item.artists.map(a => a.name).join(", ")
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

async function openAddToPlaylistModal(song) {
  // alert("Opening Modal for: " + (song ? song.title || song.name : "Undefined"));
  console.log("Opening Add to Playlist Modal", song);
  const modal = document.getElementById('add-to-playlist-modal');
  const list = document.getElementById('add-to-playlist-list');
  const closeBtn = document.getElementById('close-add-to-playlist');

  if (!modal || !list) return;

  // Reset
  list.innerHTML = '<li style="padding:10px;">Loading...</li>';
  modal.style.display = 'flex';

  const close = () => modal.style.display = 'none';
  closeBtn.onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };

  try {
    const responseData = await PlaylistService.getUserLibrary();
    // getUserLibrary returns { libraryPlaylists: [], likedSongs: [] }
    const playlists = responseData.libraryPlaylists || [];

    // Filter only playlists YOU own
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    const myPlaylists = playlists.filter(p =>
      p.owner === currentUserId || (p.owner && p.owner._id === currentUserId)
    );

    list.innerHTML = '';
    if (myPlaylists.length === 0) {
      list.innerHTML = '<li style="padding:10px;">No playlists found. Create one first!</li>';
      return;
    }

    myPlaylists.forEach(playlist => {
      const li = document.createElement('li');
      li.className = 'playlist-selection-item';

      // Check if song already in playlist (requires full playlist detail, or check ID in list)
      // Ideally backend would tell us, but for now we just show all.
      // If we have full details we could check `playlist.songs.includes(song._id)`
      // But getUserLibrary populates songs, so:
      const exists = playlist.songs.some(s => s._id === song._id || s === song._id);

      li.innerHTML = `
                <img src="${playlist.coverImageUrl || 'images/Playlist.png'}" alt="Cover">
                <div class="playlist-selection-info">
                    <span class="playlist-selection-title">${playlist.name}</span>
                    <span style="font-size:0.8rem; opacity:0.7;">${playlist.songs.length} songs</span>
                </div>
                ${exists ? '<span style="color:var(--color-accent); font-size:0.8rem;">Added</span>' : ''}
            `;

      if (!exists) {
        li.onclick = async () => {
          try {
            await PlaylistService.addSongToPlaylist(playlist._id, song._id);
            alert(`Added to ${playlist.name}`);
            close();
          } catch (err) {
            alert("Failed to add: " + err.message);
          }
        };
      }
      list.appendChild(li);
    });

  } catch (err) {
    list.innerHTML = '<li style="padding:10px; color:red;">Error loading playlists</li>';
  }
}
// Global function for Mobile Create Playlist button
function openCreatePlaylistModal() {
  const modal = document.getElementById('create-playlist-modal');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('playlist-name-input');
    if (input) setTimeout(() => input.focus(), 100); // Focus after flex paint
  } else {
    console.error("Create Playlist Modal not found in DOM");
  }
}
window.openCreatePlaylistModal = openCreatePlaylistModal;

window.openAddToPlaylistModal = openAddToPlaylistModal;