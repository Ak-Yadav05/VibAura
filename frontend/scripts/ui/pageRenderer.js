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

// Cache for homepage data to prevent redundant invalidation/loading states
let cachedHomepageData = null;

/**
 * Renders the home page with trending content and album sections.
 *
 * Flow:
 * 1. Check cache: if data exists, render immediately and skip skeletons.
 * 2. If no cache: Display multiple skeleton placeholder sections immediately.
 * 3. Fetch content from /api/homepage.
 * 4. On success, clear skeletons and render real content sections.
 * 5. Cache the data.
 * 6. Attach scroll listeners to the new horizontal card sections.
 * 7. On failure, display an error message.
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

  // OPTIMIZATION: Check if we have cached data to render immediately
  if (cachedHomepageData) {
    contentArea.innerHTML = ""; // Clear previous content
    cachedHomepageData.forEach((section) => {
      const items = section.songs || section.items;
      if (items && items.length > 0) {
        if (!section.songs) section.songs = items;
        contentArea.appendChild(createSectionElement(section));
      }
    });
    attachScrollButtonListeners();
    return; // Exit early, no need to fetch or show skeletons
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

    // Store in cache for next time
    cachedHomepageData = homepageSections;

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

  // Remove padding for full-width design
  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) {
    scrollContainer.classList.add("no-padding");
  }

  contentArea.innerHTML = `<div class="page-view"><p>Loading artist...</p></div>`;

  try {
    const response = await fetch(`/api/artists/${artistId}`);
    if (!response.ok) throw new Error("Artist not found");

    const data = await response.json();
    const artist = data.artist;
    const songs = data.songs || [];

    // Fallback artworks
    const artistImg = artist.artworkUrl || artist.imageUrl || "https://placehold.co/300x300?text=Artist";
    const songCount = songs.length;

    // 1. Get Dynamic Color
    const { r, g, b } = await getDominantColor(artistImg);
    const bgColor = `rgb(${r}, ${g}, ${b})`;
    const textColor = getContrastColor(r, g, b);

    // 2. Build Popular Songs List (Limit to top 5-10 for "Popular" feel)
    let songsListHTML = "";
    if (songs.length > 0) {
      songsListHTML = `<div class="artist-song-list">`;
      songs.forEach((song, index) => {
        songsListHTML += `
              <div class="artist-row song-item" data-index="${index}">
                <div class="col-index">
                  <span class="index-num">${index + 1}</span>
                  <span class="play-icon-row">▶</span>
                </div>
                <div class="col-title">
                  <img src="${song.artworkUrl}" alt="${song.title}">
                  <div class="song-meta-text">
                    <span class="song-title-text">${song.title}</span>
                  </div>
                </div>
                <div class="col-album">${song.album || "Single"}</div>
                <div class="col-duration">${formatTime(song.duration)}</div>
              </div>
            `;
      });
      songsListHTML += `</div>`;
    } else {
      songsListHTML = `<div class="empty-state"><p>No songs available.</p></div>`;
    }

    // 3. Render Page Structure
    contentArea.innerHTML = `
      <div class="page-view artist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: ${textColor};">
        
        <!-- Adaptive Header -->
        <div class="artist-header-dynamic" id="artist-header">
           <div class="artist-header-content">
              <img src="${artistImg}" alt="${artist.name}" class="artist-img-large">
              <div class="artist-details-large">
                 <div class="verified-bade">
                    <img src="images/icons/verified.png" class="verified-icon" alt="Verified">
                    Verified Artist
                 </div>
                 <h1 class="artist-title-large">${artist.name}</h1>
                 <p class="artist-stats">
                   ${songCount} songs • 1,234,567 monthly listeners
                 </p>
              </div>
           </div>
        </div>

        <!-- Sticky Actions -->
        <div class="artist-sticky-group" id="artist-sticky">
            <div class="artist-actions-bar">
               <button class="action-play-btn" id="artist-play-btn">
                 <img src="images/media controls/play.png" alt="Play">
               </button>
               <button class="action-follow-btn">Follow</button>
               
               <span class="sticky-artist-name">${artist.name}</span>
            </div>
        </div>

        <!-- Scrollable Content -->
        <div class="artist-content-container">
           <div class="section-title">Popular</div>
           ${songsListHTML}
           
           <!-- Placeholder Discography -->
           <div class="section-title">Discography</div>
           <div class="discography-grid">
               <!-- Mock Cards based on songs to show the layout -->
               ${songs.map(s => `
                  <div class="discography-card">
                      <img src="${s.artworkUrl}" class="discography-img">
                      <div class="discography-title">${s.album || "Single"}</div>
                      <div class="discography-year">2024 • Single</div>
                  </div>
               `).slice(0, 4).join('')}
           </div>
        </div>
      </div>
    `;

    // 4. Listeners
    const stickyGroup = contentArea.querySelector("#artist-sticky");
    const mainHeader = contentArea.querySelector("#artist-header");

    // Scroll Logic
    scrollContainer.onscroll = () => {
      const scrollY = scrollContainer.scrollTop;
      const triggerPoint = 300;

      if (scrollY > triggerPoint) {
        stickyGroup.classList.add("stuck");
      } else {
        stickyGroup.classList.remove("stuck");
      }

      if (mainHeader) {
        mainHeader.style.opacity = Math.max(0, 1 - (scrollY / 280));
      }
    };

    // Play Buttons
    const handlePlay = () => playSongFromPlaylist(songs, 0);
    const mainPlayBtn = contentArea.querySelector("#artist-play-btn");

    if (songs.length > 0 && mainPlayBtn) {
      mainPlayBtn.addEventListener("click", handlePlay);
    }

    // Row Click
    contentArea.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", () => {
        const songIndex = parseInt(item.dataset.index);
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

// Helper to extract dominant color from an image URL
async function getDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      resolve({ r, g, b });
    };
    img.onerror = () => resolve({ r: 80, g: 80, b: 80 }); // Default gray
  });
}

// Helper to calculate brightness and return appropriate text color (white or black)
function getContrastColor(r, g, b) {
  // YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // If dark mode, we usually want white text on dark bg.
  // If light mode, we might ignore this function's result in CSS anyway.
  return yiq >= 128 ? "black" : "white";
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

  // Remove padding for full-width playlist design
  // IMPORTANT: The padding is on the PARENT .content element, not #album-sections
  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) {
    scrollContainer.classList.add("no-padding");
  }

  contentArea.innerHTML = `<div class="page-view"><p>Loading playlist...</p></div>`;

  try {
    // Fetch playlist data from the API
    const response = await fetch(`/api/playlists/${playlistId}`);
    if (!response.ok) throw new Error("Playlist not found");

    const playlist = await response.json();
    const songs = playlist.songs || [];
    const coverImage = playlist.artworkUrl || playlist.coverImageUrl || "images/Playlist.png";
    const songCount = songs.length;

    // Calculate total duration
    const totalDurationSec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const totalHours = Math.floor(totalDurationSec / 3600);
    const totalMinutes = Math.floor((totalDurationSec % 3600) / 60);
    const durationText = totalHours > 0
      ? `about ${totalHours} hr ${totalMinutes} min`
      : `about ${totalMinutes} min`;

    // 1. Get Dynamic Color
    const { r, g, b } = await getDominantColor(coverImage);
    const bgColor = `rgb(${r}, ${g}, ${b})`;
    const textColor = getContrastColor(r, g, b);

    // 2. Build Song List HTML
    let songsListRowsHTML = "";

    // Header is now separate, so we can group it with actions
    const songListHeaderHTML = `
        <div class="song-list-header">
          <div class="col-header col-index">#</div>
          <div class="col-header col-title">Title</div>
          <div class="col-header col-album">Album</div>
          <div class="col-header col-right col-duration">
             <img src="images/icons/clock.png" style="width:16px; opacity:0.6; filter: invert(1);">
          </div>
        </div>
    `;

    if (songs.length > 0) {
      songsListRowsHTML = `<div class="playlist-song-list">`;

      songs.forEach((song, index) => {
        const artistName = song.artist && song.artist.name ? song.artist.name : "Unknown Artist";
        const albumName = song.album || "Single"; // Fallback if no album

        songsListRowsHTML += `
          <div class="playlist-row song-item" data-index="${index}">
            <div class="col-index">
              <span class="index-num">${index + 1}</span>
              <span class="play-icon-row">▶</span>
            </div>
            <div class="col-title">
              <img src="${song.artworkUrl}" alt="${song.title}">
              <div class="song-meta-text">
                <span class="song-title-text">${song.title}</span>
                <span class="song-artist-text">${artistName}</span>
              </div>
            </div>
            <div class="col-album">${albumName}</div>
            <div class="col-duration">${formatTime(song.duration)}</div>
          </div>
        `;
      });
      songsListRowsHTML += `</div>`;
    } else {
      songsListRowsHTML = `<div class="empty-state"><p>No songs in this playlist yet.</p></div>`;
    }

    // 3. Render Page Structure
    // Note: We use CSS variables for dynamic colors to allow easy transition
    contentArea.innerHTML = `
      <div class="page-view playlist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: ${textColor};">
        
        <!-- Main Dynamic Header -->
        <div class="playlist-header-dynamic" id="main-header">
           <div class="header-content-wrapper">
              <img src="${coverImage}" alt="${playlist.name}" class="playlist-cover-large">
              <div class="playlist-details-large">
                 <span class="playlist-label">Playlist</span>
                 <h1 class="playlist-title-large">${playlist.name}</h1>
                 <p class="playlist-description">
                   <span class="owner-name">VibAura</span> • 
                   <span class="song-count">${songCount} songs</span>, 
                   <span class="total-duration">${durationText}</span>
                 </p>
              </div>
           </div>
        </div>

        <!-- Grouped Sticky Container (Actions + List Header) -->
        <div class="playlist-sticky-group" id="sticky-group">
            <!-- Action Bar -->
            <div class="playlist-actions-bar" id="actions-bar">
               <div class="actions-left">
                   <button class="action-play-btn" id="playlist-play-btn">
                     <img src="images/media controls/play.png" alt="Play">
                   </button>
                   <button class="action-icon-btn" id="shuffle-btn">
                     <img src="images/media controls/shuffle.png" alt="Shuffle" style="filter: brightness(0) invert(0.7);">
                   </button>
               </div>
               <span class="sticky-group-title">${playlist.name}</span>
            </div>

            <!-- List Header -->
            ${songListHeaderHTML}
        </div>

        <!-- Song List Rows -->
        <div class="song-list-container">
           ${songsListRowsHTML}
        </div>
      </div>
    `;

    // 4. Attach Listeners

    // Scroll Observer for Sticky Styling
    // IMPORTANT: Listen on the SCROLLING container (.content), not inner wrapper
    const stickyGroup = contentArea.querySelector("#sticky-group");
    const mainHeader = contentArea.querySelector("#main-header");

    scrollContainer.onscroll = () => {
      // Calculate when the sticky group hits the top
      // The header is approx 340px height. 
      // We want the 'stuck' state to trigger when the group passes the header bottom.
      const scrollY = scrollContainer.scrollTop;
      const triggerPoint = 300; // slightly before full scroll

      if (scrollY > triggerPoint) {
        stickyGroup.classList.add("stuck");
      } else {
        stickyGroup.classList.remove("stuck");
      }

      // Opacity fade for main header background/content
      if (mainHeader) {
        mainHeader.style.opacity = Math.max(0, 1 - (scrollY / 280));
      }
    };

    // Play Buttons (Main & Sticky) - Note: Now we only have one play button in DOM, but logic remains valid
    const handlePlay = () => playSongFromPlaylist(songs, 0);
    const mainPlayBtn = contentArea.querySelector("#playlist-play-btn");

    if (songs.length > 0) {
      if (mainPlayBtn) mainPlayBtn.addEventListener("click", handlePlay);
    }

    // Row Click
    contentArea.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", () => {
        const songIndex = parseInt(item.dataset.index);
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