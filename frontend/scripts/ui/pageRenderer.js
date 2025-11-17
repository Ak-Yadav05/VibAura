/**
 * ============================================================================
 * VibAura Page Renderer - View Rendering Functions
 * ============================================================================
 *
 * Handles rendering of all application pages/views into the main
 * content area (#album-sections).
 *
 * Pages:
 * - Homepage (with skeleton loading)
 * - Artist detail page
 * - Playlist detail page
 * - Library page (mobile)
 * - Search page (mobile)
 *
 * Rendering pattern:
 * 1. Get the main content area.
 * 2. Show skeleton loaders immediately for perceived performance (if applicable).
 * 3. Fetch real data from API endpoints.
 * 4. Clear loaders/old content.
 * 5. Build and inject new HTML from API data.
 * 6. Attach event listeners for user interactions (e.g., play song).
 * 7. Handle and display errors gracefully.
 * ============================================================================
 */

import { playSongFromPlaylist } from "../player/playerController.js";
import { formatTime } from "../utils/utils.js";
import {
  createSectionElement,
  attachScrollButtonListeners,
  createSkeletonSection,
} from "./componentBuilder.js";

// Helper function to get the main content area element
const getContentArea = () => document.getElementById("album-sections");

/**
 * Renders the home page with trending content and album sections.
 *
 * Flow:
 * 1. Display multiple skeleton placeholder sections immediately.
 * 2. Fetch content from /api/homepage.
 * 3. On success, clear skeletons and render real content sections.
 * 4. Attach scroll listeners to the new horizontal card sections.
 * 5. On failure, display an error message.
 *
 * @async
 * @exports renderHomePage
 * @returns {Promise<void>}
 */
export async function renderHomePage() {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  contentArea.innerHTML = ""; // Clear previous content

  // Step 1: Show skeleton placeholders immediately
  const placeholders = [
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
  ];
  placeholders.forEach((s) => contentArea.appendChild(s));

  try {
    // Step 2: Fetch real homepage data from API
    const response = await fetch("/api/homepage");
    if (!response.ok) throw new Error("Failed to fetch homepage data");

    const homepageSections = await response.json();

    // Step 3: Replace skeletons with real content
    contentArea.innerHTML = ""; // Clear skeletons

    homepageSections.forEach((section) => {
      // Normalize data structure: API might use "songs" or "items"
      const items = section.songs || section.items;

      if (items && items.length > 0) {
        // Ensure section has "songs" key if it was "items"
        if (!section.songs) {
          section.songs = items;
        }
        // Use componentBuilder to create and append the section
        contentArea.appendChild(createSectionElement(section));
      }
    });

    // Step 4: Attach event listeners for horizontal scrolling
    attachScrollButtonListeners();
  } catch (error) {
    console.error("Error rendering home page:", error);
    // Step 5: Display error message
    contentArea.innerHTML = `
      <div class="page-view">
        <p class="error-message">Could not load homepage content. Please try again later.</p>
      </div>`;
  }
}

/**
 * Renders the artist detail page with artist information and song listing.
 *
 * @async
 * @exports renderArtistPage
 * @param {string} artistId - MongoDB ID of the artist to display
 * @returns {Promise<void>}
 */
export async function renderArtistPage(artistId) {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  // Show a simple loading message
  contentArea.innerHTML = `<div class="page-view"><p>Loading artist...</p></div>`;

  try {
    // Fetch artist and their songs from the API
    const response = await fetch(`/api/artists/${artistId}`);
    if (!response.ok) throw new Error("Artist not found");

    const data = await response.json();
    const artist = data.artist;
    const songs = data.songs;

    // Build HTML for the song list
    let songsListHTML = "";
    songs.forEach((song, index) => {
      songsListHTML += `
        <li class="song-item" data-index="${index}">
          <div class="song-item-left">
            <span class="song-index">${index + 1}</span>
            <img src="${song.artworkUrl}" alt="${
        song.title
      }" class="song-item-img">
            <div class="song-item-details">
              <span class="song-item-title">${song.title}</span>
              <span class="song-item-artist">${artist.name}</span>
            </div>
          </div>
          <div class="song-item-right">
            <span class="song-item-duration">${formatTime(song.duration)}</span>
          </div>
        </li>`;
    });

    // Create header style with gradient and artist artwork
    const headerStyle = `background-image: linear-gradient(to top, var(--color-background-base) 10%, rgba(0,0,0,0.4) 100%), url(${artist.artworkUrl});`;

    // Set the final page HTML
    contentArea.innerHTML = `
      <div class="page-view artist-page">
        <div class="artist-header" style="${headerStyle}">
          <h1>${artist.name}</h1>
          <span>${songs.length} ${
      songs.length === 1 ? "song" : "songs"
    }</span>
        </div>
        <div class="song-list-container">
          <ul class="song-list">${songsListHTML}</ul>
        </div>
      </div>`;

    // Attach click listeners to play songs from this artist's list
    contentArea.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", () => {
        const songIndex = parseInt(item.dataset.index);
        // Play the song, passing the entire artist's song list as the playlist
        playSongFromPlaylist(songs, songIndex);
      });
    });
  } catch (error) {
    console.error("Error rendering artist page:", error);
    contentArea.innerHTML = `
      <div class="page-view">
        <p class="error-message">Could not load artist. Please try again.</p>
      </div>`;
  }
}

/**
 * Renders the playlist detail page with playlist information and song listing.
 *
 * @async
 * @exports renderPlaylistPage
 * @param {string} playlistId - MongoDB ID of the playlist to display
 * @returns {Promise<void>}
 */
export async function renderPlaylistPage(playlistId) {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  contentArea.innerHTML = `<div class="page-view"><p>Loading playlist...</p></div>`;

  try {
    // Fetch playlist data from the API
    const response = await fetch(`/api/playlists/${playlistId}`);
    if (!response.ok) throw new Error("Playlist not found");

    const playlist = await response.json();
    const songs = playlist.songs; // Songs are nested in the playlist object

    // Build HTML for the song list
    let songsListHTML = "";
    songs.forEach((song, index) => {
      // Safely get artist name
      const artistName =
        song.artist && song.artist.name ? song.artist.name : "Unknown Artist";
      songsListHTML += `
        <li class="song-item" data-index="${index}">
          <div class="song-item-left">
            <span class="song-index">${index + 1}</span>
            <img src="${song.artworkUrl}" alt="${
        song.title
      }" class="song-item-img">
            <div class="song-item-details">
              <span class="song-item-title">${song.title}</span>
              <span class="song-item-artist">${artistName}</span>
            </div>
          </div>
          <div class="song-item-right">
            <span class="song-item-duration">${formatTime(song.duration)}</span>
          </div>
        </li>`;
    });

    // Use playlist artwork or fallback to a default image
    const coverImage =
      playlist.artworkUrl || playlist.coverImageUrl || "images/Playlist.png";
    const headerStyle = `background-image: linear-gradient(to top, var(--color-background-base) 10%, rgba(0,0,0,0.4) 100%), url(${coverImage});`;

    // Set the final page HTML
    contentArea.innerHTML = `
      <div class="page-view playlist-page">
        <div class="artist-header" style="${headerStyle}">
          <h1>${playlist.name}</h1>
          <span>${songs.length} ${
      songs.length === 1 ? "song" : "songs"
    }</span>
        </div>
        <div class="song-list-container">
          <ul class="song-list">${songsListHTML}</ul>
        </div>
      </div>`;

    // Attach click listeners to play songs from this playlist
    contentArea.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", () => {
        const songIndex = parseInt(item.dataset.index);
        // Play the song, passing the playlist's song list
        playSongFromPlaylist(songs, songIndex);
      });
    });
  } catch (error) {
    console.error("Error rendering playlist page:", error);
    contentArea.innerHTML = `
      <div class="page-view">
        <p class="error-message">Could not load playlist. Please try again.</p>
      </div>`;
  }
}

/**
 * Renders the library page (mobile-focused view).
 *
 * This is currently a static page.
 *
 * @exports renderLibraryPage
 * @returns {void}
 */
export function renderLibraryPage() {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  // Set static HTML for the library page
  contentArea.innerHTML = `
    <div class="page-view mobile-library-page">
      <div class="library-header">
        <h2 class="library-title">Your Library</h2>
      </div>
      <ul class="library-list">
        <li class="library-item">
          <img src="https://placehold.co/64x64/8B5CF6/FFFFFF?text=♥" alt="Liked Songs" class="library-item-img" />
          <div class="library-item-info">
            <span class="library-item-title">Liked Songs</span>
            <span class="library-item-subtitle">Playlist • 20 songs</span>
          </div>
        </li>
        <li class="library-item">
          <img src="https://placehold.co/64x64/EAB308/000000?text=P1" alt="My Playlist #1" class="library-item-img" />
          <div class="library-item-info">
            <span class="library-item-title">My Playlist #1</span>
            <span class="library-item-subtitle">Playlist • Artist</span>
          </div>
        </li>
        <li class="library-item">
          <img src="https://placehold.co/64x64/22C55E/FFFFFF?text=WM" alt="Workout Mix" class="library-item-img" />
          <div class="library-item-info">
            <span class="library-item-title">Workout Mix</span>
            <span class="library-item-subtitle">Playlist • Artist</span>
          </div>
        </li>
        <li class="library-item">
          <img src="https://placehold.co/64x64/3B82F6/FFFFFF?text=CV" alt="Chill Vibes" class="library-item-img" />
          <div class="library-item-info">
            <span class="library-item-title">Chill Vibes</span>
            <span class="library-item-subtitle">Playlist • Artist</span>
          </div>
        </li>
        <li class="library-item">
          <img src="https://placehold.co/64x64/EC4899/FFFFFF?text=RT" alt="Road Trip" class="library-item-img" />
          <div class="library-item-info">
            <span class="library-item-title">Road Trip</span>
            <span class="library-item-subtitle">Playlist • Artist</span>
          </div>
        </li>
      </ul>
    </div>`;
}

/**
 * Renders the search page (mobile-focused view).
 * This function renders the *container* for the search.
 * The search.js module is responsible for attaching listeners
 * and handling the search logic.
 *
 * @exports renderSearchPage
 * @returns {void}
 */
export function renderSearchPage() {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  // Get user avatar from somewhere (placeholder for now)
  const userAvatar =
    "https://placehold.co/40x40/DBEAFE/2563EB?text=A";

  // Set the HTML structure for the search page
  contentArea.innerHTML = `
    <div class="page-view search-page">
      <div class="search-page-container">
        <div class="search-page-input-wrapper">
          <img src="images/music.png" alt="VibAura Logo" class="search-logo" />
          <div class="search-bar-container">
            <img src="images/icons/search.png" alt="Search" class="search-icon" />
            <input 
              type="text" 
              id="vibAura-search-input" 
              class="vibAura-search-input"
              placeholder="What do you want to play?" 
              autocomplete="off"
              aria-label="Search songs, artists, and playlists"
              readonly
            />
            <button 
              class="search-clear-btn" 
              id="search-clear-btn"
              aria-label="Clear search"
              style="display: none;"
            >
              ✕
            </button>
          </div>
          <img src="${userAvatar}" alt="User Avatar" class="search-avatar" />
        </div>
        
        <div class="search-results-dropdown" id="search-results" style="position: relative; top: 0; left: 0; right: 0; border: none; max-height: none;">
          <div class="search-loading" style="display: none;">
            <span class="loading-text">Searching…</span>
          </div>
          <div class="search-no-results" style="display: none;">
            <span class="no-results-text">No results found</span>
          </div>
          <div class="search-results-content">
            </div>
        </div>
      </div>
    </div>`;

  // Mark the page as active
  document.body.classList.add("search-page-active");
}


/**
 * Renders a generic detail page template (e.g., for un-implemented routes).
 *
 * @exports renderDetailPage
 * @param {string} type - The type of page (e.g., "Artist", "Playlist")
 * @param {string} name - The name or ID to display
 * @returns {void}
 */
export function renderDetailPage(type, name) {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  // Simple placeholder page with a "Go Back" button
  contentArea.innerHTML = `
    <div class="page-view">
      <button class="back-btn">&#10094; Go Back</button>
      <h1>${type}: ${name}</h1>
      <p>Content for this page will be built in a future phase.</p>
    </div>`;

  // Add click listener to the back button
  contentArea.querySelector(".back-btn").addEventListener("click", () => {
    window.history.back();
  });
}