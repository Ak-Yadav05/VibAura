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
import { login, signup, getCurrentUser } from "../auth/authService.js";
import { initAuthUI } from "./authUI.js";
import { PlaylistService } from "../services/playlistService.js";
import { LibraryManager } from "./libraryManager.js";

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

  // Ensure mobile header is visible (reset from playlist view)
  document.body.classList.remove("playlist-view-active");

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

  // Reset mobile view state
  document.body.classList.remove("playlist-view-active");

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
  if (!contentArea) return;

  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) {
    scrollContainer.classList.add("no-padding");
  }

  contentArea.innerHTML = `<div class="page-view"><p>Loading playlist...</p></div>`;

  try {
    const response = await fetch(`/api/playlists/${playlistId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('vibAuraToken')}` }
    });
    if (!response.ok) throw new Error("Playlist not found");

    const playlist = await response.json();
    const songs = playlist.songs || [];
    const coverImage = playlist.artworkUrl || playlist.coverImageUrl || "images/Playlist.png";
    const songCount = songs.length;

    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    // If owner is null/undefined, it's a global playlist => isOwner = false
    // If owner exists, check ID match
    let isOwner = false;
    if (playlist.owner) {
      if (typeof playlist.owner === 'object') {
        isOwner = playlist.owner._id === currentUserId;
      } else {
        isOwner = playlist.owner === currentUserId;
      }
    }

    // Check if valid user and not owner, is it in library?
    let isSaved = false;
    if (currentUserId && !isOwner) {
      try {
        const myPlaylists = await PlaylistService.getUserLibrary();
        // Check if ID matches
        isSaved = myPlaylists.some(p => p._id === playlist._id);
      } catch (e) {
        console.warn("Could not check library status", e);
      }
    }

    // Calc duration
    const totalDurationSec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const totalHours = Math.floor(totalDurationSec / 3600);
    const totalMinutes = Math.floor((totalDurationSec % 3600) / 60);
    const durationText = totalHours > 0
      ? `about ${totalHours} hr ${totalMinutes} min`
      : `about ${totalMinutes} min`;

    // Colors
    const rgb = await getDominantColor(coverImage);
    const bgColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    // --- LAYOUT ADJUSTMENTS ---

    // --- LAYOUT ADJUSTMENTS ---
    // Hide default mobile header for immersive experience
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) mobileHeader.style.display = 'none';

    // Create Owner Actions HTML
    let ownerActionsHTML = "";
    if (isOwner) {
      ownerActionsHTML = `
            <button class="action-icon-btn" id="rename-playlist-btn" title="Rename">
                <img src="images/icons/edit.png" alt="Edit" class="icon-adaptive icon-edit">
            </button>
        `;
    } else {
      if (isSaved) {
        ownerActionsHTML = `
            <button class="action-icon-btn" id="save-library-btn" title="Already in Linked" style="cursor: default;">
                <img src="images/icons/check.png" alt="Saved" class="icon-adaptive icon-check">
            </button>
        `;
      } else {
        ownerActionsHTML = `
            <button class="action-icon-btn" id="save-library-btn" title="Save to Library">
                <img src="images/icons/plus.png" alt="Save" class="icon-adaptive icon-save">
            </button>
        `;
      }
    }

    // Fix mobile layout visibility
    document.body.classList.remove("library-page-active");
    document.body.classList.remove("search-page-active");

    // Ensure we remove the header hiding if we exit (handled by other pages restoring it)
    // But since this is SPA, we must rely on other pages to SHow it.
    // Let's add that to `renderHomePage`, `renderLibraryPage`, etc?
    // Or just do it in `router.js`?
    // For now, I will modify `renderHomePage` etc in a separate tool call if needed.
    // But actually, I can just use a class on body.
    document.body.classList.add('playlist-view-active');

    // Check Mobile View
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // --- MOBILE RENDER ---
      const durationMin = Math.floor(totalDurationSec / 60);

      // Generate song list for mobile
      const mobileSongListHTML = songs.map((song, index) => {
        const artistNames = (song.artists && song.artists.length > 0)
          ? song.artists.map(a => a.name).join(", ")
          : "Unknown Artist";

        const artwork = song.artworkUrl || song.imageUrl || "images/default-album.png";

        return `
            <div class="playlist-song-row" 
                 data-index="${index}"
                 data-song-id="${song._id}">
               <div class="song-index">
                 <img src="${artwork}" class="song-list-art" loading="lazy">
                 <img src="images/equaliser.gif" class="playing-gif" style="display: none;" />
               </div>
               <div class="song-main-info">
                 <div class="song-title-row">${song.title}</div>
                 <div class="song-artist-row">${artistNames}</div>
               </div>
               <div class="song-options">
                 <button class="card-options-btn" data-song-id="${song._id}" onclick="event.stopPropagation();">
                   <img src="images/icons/more.png" alt="Options" />
                 </button>
               </div>
            </div>
          `;
      }).join("");


      // Render Mobile HTML
      // Use standard vars for theme adaptiveness
      contentArea.innerHTML = `
          <div class="page-view playlist-mode" style="background: var(--color-background-surface);">
            
            <!-- Sticky Header (Theme Adaptive) -->
            <div class="mobile-sticky-header" id="mobile-sticky-header">
               <button class="sticky-back-btn" onclick="window.history.back()">
                  <img src="images/icons/back.png" alt="Back" class="icon-adaptive">
               </button>
               <span class="sticky-title">${playlist.name}</span>
               <div style="width: 24px;"></div> <!-- Spacer -->
            </div>


            <!-- Main Header (Split View) -->
            <div class="playlist-header">
               <!-- Top Row: Artwork + Info -->
               <div class="header-top-row">
                   <div class="playlist-cover-wrapper">
                     <img src="${coverImage}" alt="${playlist.name}" class="playlist-cover">
                   </div>
                   <div class="playlist-info">
                     <span class="playlist-type" style="opacity: 0.8; color: var(--color-text-secondary);">Playlist</span>
                     <h1 class="playlist-title" style="color: var(--color-text-primary);">${playlist.name}</h1>
                     <div class="playlist-meta" style="color: var(--color-text-secondary); opacity: 0.8;">
                        <span class="playlist-owner">${playlist.owner ? (playlist.owner.name || 'User') : 'You'}</span>
                        <span class="bullet">•</span>
                        <span>${songCount} songs</span>
                     </div>
                   </div>
               </div>

               <!-- Controls Row (Pill Buttons) -->
               <div class="play-shuffle-row">
                   <button class="play-btn-pill" id="mobile-play-btn">
                      <img src="images/media controls/play.png" class="btn-icon"> Play
                   </button>
                   <button class="shuffle-btn-pill" id="mobile-shuffle-btn">
                      <img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle
                   </button>
               </div>
            </div>
    
            <!-- List -->
            <div class="playlist-songs-list">
               ${mobileSongListHTML}
            </div>
            
            <!-- Empty State -->
            ${songs.length === 0 ? '<div style="text-align:center; padding:20px; opacity:0.6;">No songs yet</div>' : ''}
          </div>
        `;

      // 1. Row Click Listeners
      contentArea.querySelectorAll('.playlist-song-row').forEach(row => {
        row.addEventListener('click', () => {
          const index = parseInt(row.dataset.index);
          playSongFromPlaylist(songs, index);
        });
      });

      // 2. Play Button Listener
      const playBtn = contentArea.querySelector("#mobile-play-btn");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          if (songs.length > 0) playSongFromPlaylist(songs, 0);
        });
      }

      // 3. Shuffle Button Listener
      const shuffleBtn = contentArea.querySelector("#mobile-shuffle-btn");
      if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
          if (songs.length > 0) {
            // Create a shuffled copy
            const shuffled = [...songs].sort(() => Math.random() - 0.5);
            playSongFromPlaylist(shuffled, 0);
          }
        });
      }

      // 4. Scroll Listener for Sticky Header
      const stickyHeader = contentArea.querySelector("#mobile-sticky-header");
      const parentScroll = contentArea.parentElement; // .content container
      if (stickyHeader && parentScroll) {
        const onScroll = () => {
          if (parentScroll.scrollTop > 150) {
            stickyHeader.classList.add("visible");
          } else {
            stickyHeader.classList.remove("visible");
          }
        };
        parentScroll.addEventListener("scroll", onScroll);

        // Cleanup on page change? (PageRenderer usually overwrites innerHTML, removing elements and listeners attached to them)
        // But listener is on parentScroll, which persists? 
        // Actually parentScroll is the main content div. We should probably remove listener before rendering new page?
        // For now, simpler approach: check if contentArea still contains stickyHeader inside the handler?
        // Or strictly, we should clean up. But let's assume PageRenderer clears contentArea.
        // The issue is the listener is on the *parent*.
        // BETTER: attach scroll to contentArea (if it overflows) or window?
        // The .content div overflows.
        // Quick fix: Set `parentScroll.onscroll = onScroll` to override previous listeners.
        parentScroll.onscroll = onScroll;
      }

      return; // Exit function for mobile
    }

    // --- DESKTOP RENDER (Legacy) ---
    // Song List Header
    const songListHeaderHTML = `
        <div class="song-list-header">
          <div class="col-header col-index">#</div>
          <div class="col-header col-title">Title</div>
          <div class="col-header col-album">Album</div>
          <div class="col-header col-right col-duration">
             <img src="images/icons/clock.png" class="icon-adaptive small icon-clock">
          </div>
          ${isOwner ? '<div class="col-header col-right"></div>' : ''}
        </div>
    `;

    // Song List Rows
    let songsListRowsHTML = "";
    if (songs.length > 0) {
      songsListRowsHTML = `<div class="playlist-song-list">`;
      songs.forEach((song, index) => {
        const artistName = (song.artists && song.artists.length > 0)
          ? song.artists.map(a => a.name).join(", ")
          : "Unknown Artist";
        const albumName = song.album || "Single";

        songsListRowsHTML += `
          <div class="playlist-row song-item" data-index="${index}" data-id="${song._id}">
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
            ${isOwner ? `
            <div class="col-actions">
               <button class="icon-btn small remove-song-btn" data-song-id="${song._id}" title="Remove">
                 <img src="images/icons/trash.png" class="icon-adaptive small icon-trash">
               </button>
            </div>` : ''}
          </div>
        `;
      });
      songsListRowsHTML += `</div>`;
    } else {
      songsListRowsHTML = `<div class="empty-state"><p>No songs in this playlist yet.</p></div>`;
    }

    // Render
    contentArea.innerHTML = `
      <div class="page-view playlist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
        <div class="playlist-header-dynamic" id="main-header">
           <div class="header-content-wrapper">
              <img src="${coverImage}" alt="${playlist.name}" class="playlist-cover-large">
              <div class="playlist-details-large">
                 <span class="playlist-label">Playlist</span>
                 <h1 class="playlist-title-large" id="playlist-title-display">${playlist.name}</h1>
                 <p class="playlist-description">
                   <span class="owner-name">${playlist.owner?.name || 'VibAura'}</span> • 
                   <span class="song-count">${songCount} songs</span>, 
                   <span class="total-duration">${durationText}</span>
                 </p>
              </div>
           </div>
        </div>

        <div class="playlist-sticky-group" id="sticky-group">
            <div class="playlist-actions-bar" id="actions-bar">
               <div class="actions-left">
                   <button class="action-play-btn" id="playlist-play-btn">
                     <img src="images/media controls/play.png" alt="Play">
                   </button>
                   ${ownerActionsHTML}
               </div>
               <span class="sticky-group-title">${playlist.name}</span>
            </div>
            ${songListHeaderHTML}
        </div>

        <div class="song-list-container">
           ${songsListRowsHTML}
        </div>
      </div>
    `;

    // Listeners
    const stickyGroup = contentArea.querySelector("#sticky-group");
    const mainHeader = contentArea.querySelector("#main-header");
    scrollContainer.onscroll = () => {
      const scrollY = scrollContainer.scrollTop;
      const triggerPoint = 300;
      if (scrollY > triggerPoint) stickyGroup.classList.add("stuck");
      else stickyGroup.classList.remove("stuck");
      if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (scrollY / 280));
    };

    const handlePlay = () => playSongFromPlaylist(songs, 0);
    const mainPlayBtn = contentArea.querySelector("#playlist-play-btn");
    if (songs.length > 0 && mainPlayBtn) mainPlayBtn.addEventListener("click", handlePlay);

    // Song Clicks
    contentArea.querySelectorAll(".song-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest('.remove-song-btn')) return; // Ignore delete click
        const songIndex = parseInt(item.dataset.index);
        playSongFromPlaylist(songs, songIndex);
      });
    });

    // Owner Actions: Remove Song
    if (isOwner) {
      contentArea.querySelectorAll(".remove-song-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("Remove song from playlist?")) return;
          const songId = btn.dataset.songId;
          try {
            await PlaylistService.removeSongFromPlaylist(playlistId, songId);
            renderPlaylistPage(playlistId); // Re-render
          } catch (err) {
            alert("Failed to remove song");
          }
        });
      });

      const renameBtn = document.getElementById('rename-playlist-btn');
      if (renameBtn) {
        renameBtn.addEventListener('click', async () => {
          const newName = prompt("Enter new playlist name:", playlist.name);
          if (newName && newName !== playlist.name) {
            try {
              await PlaylistService.renamePlaylist(playlistId, newName);
              renderPlaylistPage(playlistId);
              LibraryManager.renderLibrary(); // Update sidebar
            } catch (err) {
              alert("Failed to rename");
            }
          }
        });
      }
    } else {
      // Viewer Actions: Save to Library
      const saveBtn = document.getElementById('save-library-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          if (isSaved) {
            alert("This playlist is already in your library.");
            return;
          }
          try {
            await PlaylistService.addPlaylistToLibrary(playlistId);
            LibraryManager.renderLibrary();
            alert("Saved to library");
            // Optionally re-render page to update button state
            renderPlaylistPage(playlistId);
          } catch (err) {
            alert("Failed to save: " + err.message);
          }
        });
      }
    }

  } catch (error) {
    console.error("Error rendering playlist page:", error);
    contentArea.innerHTML = `<div class="page-view"><p class="error-message">Could not load playlist.</p></div>`;
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
export async function renderLibraryPage() {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  // Fix mobile layout visibility
  document.body.classList.remove("search-page-active");
  document.body.classList.remove("playlist-view-active"); // Reset header visibility
  document.body.classList.add("library-page-active");

  // Check auth
  const token = localStorage.getItem('vibAuraToken');
  const userStr = localStorage.getItem('vibAuraUser');
  let currentUserId = null;
  if (userStr) {
    try { currentUserId = JSON.parse(userStr).id; } catch (e) { }
  }

  if (!token) {
    // ... (existing no token logic)
    contentArea.innerHTML = `
        <div class="page-view mobile-library-page" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
            <h2 style="margin-bottom:1rem;">Your Library</h2>
            <p>Log in to view your playlists.</p>
        </div>`;
    return;
  }

  contentArea.innerHTML = '<div class="loader"></div>';

  try {
    const data = await PlaylistService.getUserLibrary();
    // data now returns { libraryPlaylists: [], likedSongs: [] }
    // Fallback for old API response (array) vs new Object
    const playlists = Array.isArray(data) ? data : (data.libraryPlaylists || []);
    const likedSongs = data.likedSongs || [];

    // console.log("Mobile Library Playlists:", playlists);

    let listHTML = '';

    // Liked Songs
    listHTML += `
        <li class="library-item" onclick="window.location.hash = '#liked-songs'">
          <img src="images/media controls/favourite.png" alt="Liked Songs" class="library-item-img" style="padding: 12px; background: linear-gradient(135deg, #450af5, #c4efd9);" />
          <div class="library-item-info">
            <span class="library-item-title">Liked Songs</span>
            <span class="library-item-subtitle">Playlist • ${likedSongs.length} songs</span>
          </div>
        </li>
    `;

    if (playlists.length === 0) {
      listHTML += `<li style="padding:20px; text-align:center; opacity:0.7;">No playlists yet. Create one!</li>`;
    } else {
      playlists.forEach(p => {
        const songCount = p.songs ? p.songs.length : 0;
        const cover = p.coverImageUrl || 'images/Playlist.png';

        // Determine ownership
        const ownerId = (typeof p.owner === 'object') ? p.owner?._id : p.owner;
        const isOwner = (currentUserId && ownerId === currentUserId);

        listHTML += `
            <li class="library-item mobile-playlist-item" 
                data-id="${p._id}" 
                data-name="${p.name}" 
                data-is-owner="${isOwner}"
                data-cover="${cover}"
                style="position: relative; user-select: none;">
              <img src="${cover}" alt="${p.name}" class="library-item-img" style="pointer-events: none;" />
              <div class="library-item-info" style="pointer-events: none;">
                <span class="library-item-title">${p.name}</span>
                <span class="library-item-subtitle">Playlist • ${songCount} songs</span>
              </div>
            </li>
            `;
      });
    }

    contentArea.innerHTML = `
    <div class="page-view mobile-library-page">
      <div class="library-header">
        <h2 class="library-title">Your Library</h2>
        <button id="mobile-create-pl-btn" class="action-icon-btn" style="background:transparent; border:none;">
            <img src="images/icons/plus.png" class="icon-adaptive" style="width:24px; height:24px;">
        </button>
      </div>
      <ul class="library-list">
        ${listHTML}
      </ul>
    </div>
  `;

    const btn = contentArea.querySelector('#mobile-create-pl-btn');
    if (btn) btn.addEventListener('click', () => window.openCreatePlaylistModal());

    // Attach Long Press Listeners
    contentArea.querySelectorAll('.mobile-playlist-item').forEach(item => {
      let timer;
      let isLongPress = false;

      const startPress = (e) => {
        // Don't start if it's a right click or similar
        if (e.type === 'mousedown' && e.button !== 0) return;

        isLongPress = false;
        timer = setTimeout(() => {
          isLongPress = true;
          // Trigger Vibrate
          if (navigator.vibrate) navigator.vibrate(50);

          // Open Bottom Sheet
          if (window.BottomSheetManager) {
            window.BottomSheetManager.open('library-playlist', {
              _id: item.dataset.id,
              name: item.dataset.name,
              isOwner: item.dataset.isOwner === 'true',
              coverImageUrl: item.dataset.cover
            });
          }
        }, 500); // 500ms threshold
      };

      const cancelPress = () => {
        clearTimeout(timer);
      };

      const handleClick = (e) => {
        if (isLongPress) {
          e.preventDefault();
          e.stopPropagation();
          isLongPress = false; // Reset
          return;
        }
        // Navigate only if NOT a long press
        window.location.hash = `#/playlist/${item.dataset.id}`;
      };

      // Touch
      item.addEventListener('touchstart', startPress, { passive: true });
      item.addEventListener('touchend', cancelPress);
      item.addEventListener('touchmove', cancelPress); // Cancel if scrolling

      // Mouse (for testing/desktop view of mobile page)
      item.addEventListener('mousedown', startPress);
      item.addEventListener('mouseup', cancelPress);
      item.addEventListener('mouseleave', cancelPress);

      // Click & Context Menu
      item.addEventListener('click', handleClick);
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent native menu on long hold
      });
    });

  } catch (err) {
    console.error("Failed to load mobile library", err);
    contentArea.innerHTML = `<div class="error-message">Failed to load library: ${err.message}</div>`;
  }
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

  // Fix mobile layout visibility
  document.body.classList.remove("library-page-active");
  document.body.classList.remove("playlist-view-active"); // Reset header visibility
  document.body.classList.add("search-page-active");

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
    </div > `;

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

// ============================================================================
// AUTHENTICATION RENDERING (Restored)
// ============================================================================

export function setAuthMode(isAuth) {
  const appRoot = document.getElementById("app-root");
  const authRoot = document.getElementById("auth-root");

  if (isAuth) {
    if (appRoot) appRoot.style.display = "none";
    if (authRoot) {
      authRoot.style.display = "block";
      document.body.classList.add("auth-mode");
    }
  } else {
    // Show App
    if (appRoot) appRoot.style.display = "block";
    // Hide Auth
    if (authRoot) {
      authRoot.style.display = "none";
      authRoot.innerHTML = ""; // Cleanup to stop listeners
      document.body.classList.remove("auth-mode");
    }
  }
}

export function renderLoginPage() {
  setAuthMode(true);
  const contentArea = document.getElementById("auth-root");
  if (!contentArea) return;

  contentArea.innerHTML = `
  <div class="auth-view">
    <div class="auth-wrapper">
      <div class="auth-container fade-in">
        <img src="images/music.png" alt="VibAura" class="auth-logo">

          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Login to continue your vibe</p>

          <form id="login-form">
            <div class="input-group">
              <label class="form-label">Email</label>
              <div class="input-wrapper">
                <img src="images/icons/mail.png" class="input-icon-left" alt="">
                  <input type="email" id="email" class="form-input" placeholder="hello@example.com" required>
                  </div>
              </div>

              <div class="input-group" style="margin-top: 1rem;">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                  <img src="images/icons/lock.png" class="input-icon-left" alt="">
                    <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                      <button type="button" class="toggle-password" id="toggle-password">
                        <img src="images/icons/eye.png" class="eye-icon" alt="Show">
                      </button>
                    </div>
                </div>

                <div style="text-align: right; margin-top: 0.5rem;">
                  <a href="#/forgot-password" class="auth-link" style="font-size: 0.9rem;">Forgot Password?</a>
                </div>

                <button type="submit" class="btn-submit">Login</button>

                <div class="auth-footer">
                  Don't have an account? <a href="#/signup" class="auth-link">Sign Up</a>
                </div>
              </form>
            </div>
          </div>
      </div>
      `;

  // Password Toggle
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      toggleBtn.querySelector("img").src = type === "password"
        ? "images/icons/eye.png"
        : "images/icons/eye-off.png";
    });
  }

  // Submit Handler
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await login(email, password);
      initAuthUI(); // Force update header to show avatar
      if (LibraryManager) {
        LibraryManager.renderLibrary(); // Refresh library sidebar
      } else {
        // LibraryManager is undefined in pageRenderer!
      }
      window.location.hash = "#";
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}

export function renderSignupPage() {
  setAuthMode(true);
  const contentArea = document.getElementById("auth-root");
  if (!contentArea) return;

  contentArea.innerHTML = `
      <div class="auth-view">
        <div class="auth-wrapper">
          <div class="auth-container fade-in">
            <img src="images/music.png" alt="VibAura" class="auth-logo">

              <h1 class="auth-title">Join VibAura</h1>
              <p class="auth-subtitle">Create an account to start listening</p>

              <form id="signup-form">
                <div class="input-group">
                  <label class="form-label">Email</label>
                  <div class="input-wrapper">
                    <img src="images/icons/mail.png" class="input-icon-left" alt="">
                      <input type="email" id="email" class="form-input" placeholder="hello@example.com" required>
                      </div>
                  </div>

                  <div class="input-group" style="margin-top: 1rem;">
                    <label class="form-label">Password</label>
                    <div class="input-wrapper">
                      <img src="images/icons/lock.png" class="input-icon-left" alt="">
                        <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                          <button type="button" class="toggle-password" id="toggle-password">
                            <img src="images/icons/eye.png" class="eye-icon" alt="Show">
                          </button>
                        </div>
                    </div>

                    <button type="submit" class="btn-submit">Sign Up</button>

                    <div class="auth-footer">
                      Already have an account? <a href="#/login" class="auth-link">Login</a>
                    </div>
                  </form>
                </div>
              </div>
          </div>
          `;

  // Password Toggle
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      toggleBtn.querySelector("img").src = type === "password"
        ? "images/icons/eye.png"
        : "images/icons/eye-off.png";
    });
  }

  // Submit Handler
  const form = document.getElementById("signup-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signup(email, password);
      // Backend returns 201 Created, no token. Redirect to login.
      alert("Account created! Please login.");
      window.location.hash = "#/login";
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  });
}

export function renderForgotPasswordPage() {
  setAuthMode(true);
  const contentArea = document.getElementById("auth-root");
  if (!contentArea) return;

  contentArea.innerHTML = `
          <div class="auth-view">
            <div class="auth-wrapper">
              <div class="auth-container fade-in">
                <img src="images/music.png" alt="VibAura" class="auth-logo">

                  <h1 class="auth-title">Forgot Password</h1>
                  <p class="auth-subtitle">Enter your email to receive a reset link</p>

                  <form id="forgot-form">
                    <div class="input-group">
                      <label class="form-label">Email</label>
                      <div class="input-wrapper">
                        <img src="images/icons/mail.png" class="input-icon-left" alt="">
                          <input type="email" id="email" class="form-input" placeholder="hello@example.com" required>
                          </div>
                      </div>

                      <button type="submit" class="btn-submit">Send Reset Link</button>

                      <div class="auth-footer">
                        <a href="#/login" class="auth-link">Back to Login</a>
                      </div>
                  </form>
              </div>
            </div>
          </div>
          `;

  const form = document.getElementById("forgot-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const btn = form.querySelector(".btn-submit");
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message); // Always success message
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

export function renderResetPasswordPage() {
  setAuthMode(true);
  const contentArea = document.getElementById("auth-root");
  if (!contentArea) return;

  // Parse token from URL query params (hash routing compatible)
  const hash = window.location.hash; // #/reset-password?token=XYZ
  // We need to handle cases where token might be a query param on the hash
  // e.g. #/reset-password?token=...
  const parts = hash.split('?');
  const params = new URLSearchParams(parts[1] || "");
  const token = params.get("token");

  if (!token) {
    contentArea.innerHTML = `
      <div class="auth-view"><div class="auth-wrapper"><div class="auth-container">
        <h1 class="auth-title">Invalid Link</h1>
        <p class="auth-subtitle">Missing reset token.</p>
        <a href="#/login" class="auth-link">Back to Login</a>
      </div></div></div>`;
    return;
  }

  contentArea.innerHTML = `
          <div class="auth-view">
            <div class="auth-wrapper">
              <div class="auth-container fade-in">
                <img src="images/music.png" alt="VibAura" class="auth-logo">

                  <h1 class="auth-title">Reset Password</h1>
                  <p class="auth-subtitle">Enter your new password below</p>

                  <form id="reset-form">
                    <div class="input-group">
                      <label class="form-label">New Password</label>
                      <div class="input-wrapper">
                        <img src="images/icons/lock.png" class="input-icon-left" alt="">
                          <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                            <button type="button" class="toggle-password" id="toggle-password">
                              <img src="images/icons/eye.png" class="eye-icon" alt="Show">
                            </button>
                          </div>
                      </div>

                      <button type="submit" class="btn-submit">Update Password</button>
                  </form>
              </div>
            </div>
          </div>
          `;

  // Password Toggle
  const toggleBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      toggleBtn.querySelector("img").src = type === "password"
        ? "images/icons/eye.png"
        : "images/icons/eye-off.png";
    });
  }

  const form = document.getElementById("reset-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("password").value;
    const btn = form.querySelector(".btn-submit");

    btn.disabled = true;
    btn.textContent = "Updating...";

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        // Show success message and hide form
        const container = document.querySelector(".auth-container");
        container.innerHTML = `
          <h2>Password Updated!</h2>
          <p>Your password has been successfully reset.</p>
          <p style="margin-top: 1rem; color: #aaa;">You can now close this tab and log in with your new password on your original device.</p>
          `;
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      alert("Error updating password.");
      console.error(error);
    } finally {
      btn.disabled = false;
      btn.textContent = "Update Password";
    }
  });
}

/**
 * Renders the Liked Songs page.
 * Fetches user's liked songs from the library API and displays them as a virtual playlist.
 */
export async function renderLikedSongsPage() {
  document.body.classList.remove("library-page-active"); // Fix mobile layout
  document.body.classList.remove("search-page-active");
  document.body.classList.add("playlist-view-active"); // Enable header visibility for recursive header


  const contentArea = getContentArea();
  if (!contentArea) return;

  // Adjust layout class for page view
  const scrollContainer = contentArea.parentElement;
  if (scrollContainer && scrollContainer.classList.contains("content")) {
    scrollContainer.classList.add("no-padding");
  }

  contentArea.innerHTML = `<div class="page-view"><p>Loading Liked Songs...</p></div>`;

  try {
    // Fetch library including liked songs
    const data = await PlaylistService.getUserLibrary();
    const likedSongs = data.likedSongs || [];

    // Manually construct a "Playlist" object for the renderer
    const mockPlaylist = {
      _id: "liked-songs",
      name: "Liked Songs",
      description: "Your favorite tracks, all in one place.",
      songs: likedSongs,
      coverImageUrl: "images/media controls/favourite.png", // Use local icon
      owner: { name: "You" }
    };

    // Reuse render logic? Or copy-paste for safety?
    // Since renderPlaylistPage fetches by ID, we can't reuse it directly.
    // We will render it manually here similar to playlist page.

    const songCount = likedSongs.length;
    const totalDurationSec = likedSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const totalMinutes = Math.floor(totalDurationSec / 60);

    // Gradient background
    const bgColor = "rgb(79, 70, 229)"; // Indigo-ish (or Heart color)
    const textColor = "white";

    // Check Mobile View
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // --- MOBILE RENDER ---
      const songListHTML = likedSongs.map((song, index) => {
        const artistNames = song.artists ? song.artists.map(a => a.name).join(", ") : "Unknown Artist";
        const durationMin = Math.floor((song.duration || 0) / 60);
        const durationSec = (song.duration || 0) % 60;
        const durationStr = `${durationMin}:${durationSec.toString().padStart(2, "0")}`;

        const artwork = song.artworkUrl || song.imageUrl || "images/default-album.png";

        return `
            <div class="playlist-song-row" 
                 data-index="${index}"
                 data-song-id="${song._id}">
               <div class="song-index">
                 <img src="${artwork}" class="song-list-art" loading="lazy">
                 <img src="images/equaliser.gif" class="playing-gif" style="display: none;" />
               </div>
               <div class="song-main-info">
                 <div class="song-title-row">${song.title}</div>
                 <div class="song-artist-row">${artistNames}</div>
               </div>
               <div class="song-album-info">${song.album || ''}</div>
               <div class="song-duration">${durationStr}</div>
               <div class="song-options">
                 <button class="card-options-btn" data-song-id="${song._id}" onclick="event.stopPropagation();">
                   <img src="images/icons/more.png" alt="Options" />
                 </button>
               </div>
            </div>
          `;
      }).join("");

      contentArea.innerHTML = `
          <div class="page-view playlist-mode" style="background: var(--color-background-surface);">
            
            <!-- Sticky Header (Theme Adaptive) -->
            <div class="mobile-sticky-header" id="liked-sticky-header">
               <button class="sticky-back-btn" onclick="window.history.back()">
                  <img src="images/icons/back.png" alt="Back" class="icon-adaptive"> 
               </button>
               <span class="sticky-title">Liked Songs</span>
               <div style="width: 24px;"></div> <!-- Spacer -->
            </div>
    
            <!-- Main Header -->
            <div class="playlist-header">
               <div class="header-top-row">
                   <div class="playlist-cover-wrapper">
                     <img src="${mockPlaylist.coverImageUrl}" alt="Liked Songs" class="playlist-cover" 
                          style="background: linear-gradient(135deg, #450af5, #c4efd9); object-fit: contain;">
                   </div>
                   <div class="playlist-info">
                     <span class="playlist-type" style="color: ${textColor}; opacity: 0.8;">Playlist</span>
                     <h1 class="playlist-title" style="color: ${textColor}">Liked Songs</h1>
                     <div class="playlist-meta" style="color: ${textColor}; opacity: 0.7;">
                       <span class="playlist-owner">You</span>
                       <span class="bullet">•</span>
                       <span>${songCount} songs</span>
                     </div>
                   </div>
               </div>
    
               <!-- Controls Row -->
               <div class="play-shuffle-row">
                   <button class="play-btn-pill" id="liked-play-btn">
                      <img src="images/media controls/play.png" class="btn-icon"> Play
                   </button>
                   <button class="shuffle-btn-pill" id="liked-shuffle-btn">
                      <img src="images/media controls/shuffle.png" class="btn-icon"> Shuffle
                   </button>
               </div>
            </div>
    
            <!-- List -->
            <div class="playlist-songs-list">
               ${songListHTML}
            </div>
             <div class="playlist-songs-list-spacer"></div>
          </div>
        `;

      // 1. Attach Listeners to Rows (Mobile)
      contentArea.querySelectorAll('.playlist-song-row').forEach(row => {
        row.addEventListener('click', () => {
          const index = parseInt(row.dataset.index);
          playSongFromPlaylist(likedSongs, index);
        });
      });

      // 4. Scroll Listener (Mobile)
      const stickyHeader = contentArea.querySelector("#liked-sticky-header");
      if (stickyHeader && scrollContainer) {
        scrollContainer.onscroll = () => {
          if (scrollContainer.scrollTop > 150) {
            stickyHeader.classList.add("visible");
          } else {
            stickyHeader.classList.remove("visible");
          }
        };
      }

    } else {
      // --- DESKTOP RENDER ---
      const songListHeaderHTML = `
            <div class="song-list-header">
              <div class="col-header col-index">#</div>
              <div class="col-header col-title">Title</div>
              <div class="col-header col-album">Album</div>
              <div class="col-header col-right col-duration">
                 <img src="images/icons/clock.png" class="icon-adaptive small icon-clock">
              </div>
            </div>
        `;

      let songsListRowsHTML = "";
      if (likedSongs.length > 0) {
        songsListRowsHTML = `<div class="playlist-song-list">`;
        likedSongs.forEach((song, index) => {
          const artistName = (song.artists && song.artists.length > 0)
            ? song.artists.map(a => a.name).join(", ")
            : "Unknown Artist";
          const albumName = song.album || "Single";
          const durationMin = Math.floor((song.duration || 0) / 60);
          const durationSec = (song.duration || 0) % 60;
          const durationStr = `${durationMin}:${durationSec.toString().padStart(2, "0")}`;

          songsListRowsHTML += `
              <div class="playlist-row song-item" data-index="${index}" data-id="${song._id}">
                <div class="col-index">
                  <span class="index-num">${index + 1}</span>
                  <span class="play-icon-row">▶</span>
                </div>
                <div class="col-title">
                  <img src="${song.artworkUrl || 'images/default-album.png'}" alt="${song.title}">
                  <div class="song-meta-text">
                    <span class="song-title-text">${song.title}</span>
                    <span class="song-artist-text">${artistName}</span>
                  </div>
                </div>
                <div class="col-album">${albumName}</div>
                <div class="col-duration">${durationStr}</div>
                <div class="col-actions">
                   <button class="icon-btn small remove-song-btn" data-song-id="${song._id}" title="Remove from Liked Songs">
                     <img src="images/media controls/favourite-filled.png" class="icon-adaptive small icon-trash" style="filter: brightness(0) saturate(100%) invert(28%) sepia(93%) saturate(1989%) hue-rotate(307deg) brightness(91%) contrast(92%);">
                   </button>
                </div>
              </div>
            `;
        });
        songsListRowsHTML += `</div>`;
      } else {
        songsListRowsHTML = `<div class="empty-state"><p>No liked songs yet.</p></div>`;
      }

      contentArea.innerHTML = `
          <div class="page-view playlist-page" style="--dynamic-bg: ${bgColor}; --dynamic-text: var(--color-text-primary);">
            <div class="playlist-header-dynamic" id="main-header">
               <div class="header-content-wrapper">
                  <img src="${mockPlaylist.coverImageUrl}" alt="Liked Songs" class="playlist-cover-large" style="background: linear-gradient(135deg, #450af5, #c4efd9); object-fit: contain;">
                  <div class="playlist-details-large">
                     <span class="playlist-label">Playlist</span>
                     <h1 class="playlist-title-large">Liked Songs</h1>
                     <p class="playlist-description">
                       <span class="owner-name">You</span> • 
                       <span class="song-count">${songCount} songs</span> 
                     </p>
                  </div>
               </div>
            </div>
    
            <div class="playlist-sticky-group" id="sticky-group">
                <div class="playlist-actions-bar" id="actions-bar">
                   <div class="actions-left">
                       <button class="action-play-btn" id="liked-play-btn">
                         <img src="images/media controls/play.png" alt="Play">
                       </button>
                   </div>
                   <span class="sticky-group-title">Liked Songs</span>
                </div>
                ${songListHeaderHTML}
            </div>
    
            <div class="song-list-container">
               ${songsListRowsHTML}
            </div>
          </div>
        `;

      // Desktop Listeners
      const stickyGroup = contentArea.querySelector("#sticky-group");
      const mainHeader = contentArea.querySelector("#main-header");
      if (stickyGroup && scrollContainer) {
        scrollContainer.onscroll = () => {
          const scrollY = scrollContainer.scrollTop;
          if (scrollY > 300) stickyGroup.classList.add("stuck");
          else stickyGroup.classList.remove("stuck");
          if (mainHeader) mainHeader.style.opacity = Math.max(0, 1 - (scrollY / 280));
        };
      }

      // Song Clicks (Desktop)
      contentArea.querySelectorAll(".song-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.closest('.remove-song-btn')) return; // Ignore delete click
          const songIndex = parseInt(item.dataset.index);
          playSongFromPlaylist(likedSongs, songIndex);
        });
      });

      // Unlike Logic
      contentArea.querySelectorAll(".remove-song-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const songId = btn.dataset.songId;
          try {
            await PlaylistService.removeFromLikedSongs(songId);
            renderLikedSongsPage(); // Re-render
          } catch (err) {
            alert("Failed to unlike song");
          }
        });
      });
    }

    // Shared Play Wrapper (for Desktop's #liked-play-btn and Mobile's #liked-play-btn if reused)
    // Mobile uses specific IDs in the block above, Desktop uses #liked-play-btn too. 
    // Let's attach safely if not already attached (or just attach again, no harm if element unique)
    const playBtn = contentArea.querySelector("#liked-play-btn");
    if (playBtn) {
      // Clone/Replace to ensure clean listener? No, just add one.
      // But we added one in the Mobile block. 
      // Desktop block needs one too.
      playBtn.addEventListener("click", () => {
        if (likedSongs.length > 0) playSongFromPlaylist(likedSongs, 0);
      });
    }

    // Shared Shuffle (Desktop doesn't show shuffle in this design, but if it did...)

    // Register global playlist
    if (window.registerPlaylist) window.registerPlaylist(mockPlaylist);


  } catch (err) {
    console.error("Error rendering Liked Songs:", err);
    contentArea.innerHTML = `<div class="page-view error"><p>Error loading Liked Songs</p></div>`;
  }
}
