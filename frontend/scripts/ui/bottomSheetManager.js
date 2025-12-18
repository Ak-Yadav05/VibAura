
import { PlaylistService } from '../services/playlistService.js';
// Removed circular dependency: import { openAddToPlaylistModal } from './componentBuilder.js'; 

export const BottomSheetManager = {
    overlay: null,
    content: null,

    init() {
        // Create elements if not in HTML
        if (!document.getElementById('mobile-bottom-sheet')) {
            const overlay = document.createElement('div');
            overlay.id = 'mobile-bottom-sheet';
            overlay.className = 'bottom-sheet-overlay';

            const content = document.createElement('div');
            content.className = 'bottom-sheet-content';

            overlay.appendChild(content);
            document.body.appendChild(overlay);

            // Close on background click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        this.overlay = document.getElementById('mobile-bottom-sheet');
        this.content = this.overlay.querySelector('.bottom-sheet-content');
    },

    open(type, data) {
        if (!this.overlay) this.init();

        // Populate Content
        this.render(type, data);

        // Show
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling bg
    },

    close() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    render(type, data) {
        // data = { title, subtitle, image, id, ... }

        const isSong = type === 'song';
        const image = data.artworkUrl || data.coverImageUrl || 'images/music.png';
        const title = data.title || data.name || 'Unknown';
        const subtitle = isSong
            ? (data.artists ? data.artists.map(a => a.name).join(', ') : 'Artist')
            : 'Playlist';

        let optionsHTML = '';

        if (isSong) {
            optionsHTML = `
                <li class="bs-option-item" id="bs-add-playlist">
                    <img src="images/icons/plus.png" class="bs-icon icon-adaptive">
                    <span class="bs-text">Add to Playlist</span>
                </li>
                <li class="bs-option-item" id="bs-add-library">
                     <img src="images/media controls/favourite.png" class="bs-icon icon-adaptive">
                    <span class="bs-text">Save to Liked Songs</span>
                </li>
            `;
        } else if (type === 'library-playlist') {
            const isOwner = data.isOwner;
            const itemID = data._id || data.id;
            const isHistory = itemID === 'recently-played';
            const isLikedSongs = itemID === 'liked-songs';

            if (isHistory || isLikedSongs) {
                const actionLabel = isHistory ? 'Play Recently Played' : 'Play Liked Songs';
                const shareLabel = isHistory ? 'Share History' : 'Share Liked Songs';
                const targetHash = isHistory ? '#/recently-played' : '#liked-songs';

                optionsHTML = `
                    <li class="bs-option-item" id="bs-lib-play" data-hash="${targetHash}">
                        <img src="images/media controls/play.png" class="bs-icon icon-adaptive">
                        <span class="bs-text">${actionLabel}</span>
                    </li>
                    <li class="bs-option-item" id="bs-lib-share">
                         <img src="images/icons/share.png" class="bs-icon icon-adaptive" onerror="this.style.display='none'">
                        <span class="bs-text">${shareLabel}</span>
                    </li>
                `;
            } else {
                const deleteLabel = isOwner ? 'Delete Playlist' : 'Remove from Library';
                const deleteIcon = 'images/icons/delete.png';

                optionsHTML = `
                <li class="bs-option-item" id="bs-lib-delete">
                    <img src="${deleteIcon}" class="bs-icon icon-adaptive" style="opacity: 0.8;">
                    <span class="bs-text" style="color: var(--color-error, #ef4444);">${deleteLabel}</span>
                </li>
                <li class="bs-option-item" id="bs-lib-download">
                     <img src="images/icons/download.png" class="bs-icon icon-adaptive" onerror="this.style.display='none'"> 
                    <span class="bs-text">Download</span>
                </li>
                <li class="bs-option-item" id="bs-lib-share">
                     <img src="images/icons/share.png" class="bs-icon icon-adaptive" onerror="this.style.display='none'">
                    <span class="bs-text">Share</span>
                </li>
            `;
            }
        } else if (type === 'sort-options') {
            const options = data.options || [];
            optionsHTML = options.map(opt => `
                <li class="bs-option-item sort-option" data-value="${opt.value}">
                    <img src="${opt.icon || 'images/icons/sort.png'}" class="bs-icon icon-adaptive">
                    <span class="bs-text">${opt.label}</span>
                </li>
            `).join('');
        } else {
            // Playlist Options (Default/Other)
            optionsHTML = `
                <li class="bs-option-item" id="bs-add-library-pl">
                    <img src="images/icons/library.png" class="bs-icon icon-adaptive">
                    <span class="bs-text">Save to Library</span>
                </li>
            `;
        }

        this.content.innerHTML = `
            <div class="bottom-sheet-handle"></div>
            ${type !== 'sort-options' ? `
            <div class="bs-header">
                <img src="${image}" class="bs-cover">
                <div class="bs-meta">
                    <span class="bs-title">${title}</span>
                    <span class="bs-subtitle">${subtitle}</span>
                </div>
            </div>
            ` : '<div class="bs-header-simple"><span class="bs-title">Sort By</span></div>'}
            <ul class="bs-options">
                ${optionsHTML}
            </ul>
        `;

        // Attach Listeners
        if (type === 'sort-options') {
            this.content.querySelectorAll('.sort-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    this.close();
                    if (data.onSelect) data.onSelect(opt.dataset.value);
                });
            });
        } else if (isSong) {
            // ... (Song listeners)
            const addToPlBtn = this.content.querySelector('#bs-add-playlist');
            if (addToPlBtn) {
                addToPlBtn.addEventListener('click', () => {
                    this.close();
                    if (typeof window.openAddToPlaylistModal === 'function') {
                        window.openAddToPlaylistModal(data);
                    }
                });
            }
            const addToLibBtn = this.content.querySelector('#bs-add-library');
            if (addToLibBtn) {
                addToLibBtn.addEventListener('click', async () => {
                    this.close();
                    try {
                        await PlaylistService.addToLikedSongs(data._id || data.id);
                        if (window.LibraryManager) window.LibraryManager.renderLibrary();
                        alert("Added to Liked Songs");
                    } catch (e) {
                        // ignore or alert
                    }
                });
            }
        } else if (type === 'library-playlist') {
            const playBtn = this.content.querySelector('#bs-lib-play');
            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    this.close();
                    const hash = playBtn.dataset.hash || '#/recently-played';
                    window.location.hash = hash;
                });
            }

            const delBtn = this.content.querySelector('#bs-lib-delete');
            if (delBtn) {
                delBtn.addEventListener('click', async () => {
                    this.close();
                    const isOwner = data.isOwner;
                    const confirmMsg = isOwner
                        ? `Are you sure you want to PERMANENTLY delete "${title}"?`
                        : `Remove "${title}" from your library?`;

                    if (confirm(confirmMsg)) {
                        try {
                            if (isOwner) await PlaylistService.deletePlaylist(data._id);
                            else await PlaylistService.removePlaylistFromLibrary(data._id);

                            if (window.LibraryManager) window.LibraryManager.renderLibrary();
                            if (window.renderLibraryPage) window.renderLibraryPage(); // Refresh mobile view if open
                        } catch (e) {
                            alert("Action failed: " + e.message);
                        }
                    }
                });
            }

            // Dummies
            const downBtn = this.content.querySelector('#bs-lib-download');
            if (downBtn) downBtn.addEventListener('click', () => { this.close(); alert("Download feature coming soon!"); });

            const shareBtn = this.content.querySelector('#bs-lib-share');
            if (shareBtn) shareBtn.addEventListener('click', () => { this.close(); alert("Share feature coming soon!"); });

        } else {
            // ... (Playlist listeners)
            const savePlBtn = this.content.querySelector('#bs-add-library-pl');
            if (savePlBtn) {
                savePlBtn.addEventListener('click', async () => {
                    this.close();
                    try {
                        await PlaylistService.addPlaylistToLibrary(data._id);
                        if (window.LibraryManager) window.LibraryManager.renderLibrary();
                        alert("Saved to Library!");
                    } catch (e) {
                        alert(e.message);
                    }
                });
            }
        }
    }
};

// Expose globally for now or import where needed
window.BottomSheetManager = BottomSheetManager;
