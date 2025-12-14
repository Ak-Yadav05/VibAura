
import { PlaylistService } from '../services/playlistService.js';

export const LibraryManager = {
    init() {
        this.renderLibrary();
        this.setupCreatePlaylistModal();
    },

    async renderLibrary() {
        const libraryList = document.querySelector('.library-list');
        if (!libraryList) return;

        const token = localStorage.getItem('vibAuraToken'); // Check token key
        // console.log("renderLibrary Check:", token);

        if (!token) {
            // Updated to be cleaner
            libraryList.innerHTML = '<li style="padding: 20px; color: var(--color-text-secondary); text-align: center;">Login to see your library</li>';
            document.querySelector('.library-add-btn').style.display = 'none';
            return;
        } else {
            const btn = document.querySelector('.library-add-btn');
            if (btn) btn.style.display = 'block';
        }

        try {
            const data = await PlaylistService.getUserLibrary();
            // data now returns { libraryPlaylists: [], likedSongs: [] }
            // Fallback for old API response (array) vs new Object
            const playlists = Array.isArray(data) ? data : (data.libraryPlaylists || []);
            const likedSongs = data.likedSongs || [];

            libraryList.innerHTML = '';

            // "Liked Songs" Item
            const likedItem = document.createElement('li');
            likedItem.className = 'library-item';
            likedItem.innerHTML = `
        <img src="images/media controls/favourite.png" alt="Liked Songs" class="library-item-img" style="padding: 12px; background: linear-gradient(135deg, #450af5, #c4efd9);" />
        <div class="library-item-info">
          <span class="library-item-title">Liked Songs</span>
          <span class="library-item-subtitle">Playlist • ${likedSongs.length} songs</span>
        </div>
      `;
            likedItem.onclick = () => window.location.hash = '#liked-songs';
            libraryList.appendChild(likedItem);

            // Render User Playlists
            const userStr = localStorage.getItem('vibAuraUser');
            let currentUserId = null;
            if (userStr) {
                try { currentUserId = JSON.parse(userStr).id; } catch (e) { }
            }

            playlists.forEach(playlist => {
                const li = document.createElement('li');
                li.className = 'library-item';
                // Use real cover image if available, otherwise generate placeholder
                const initial = playlist.name.charAt(0).toUpperCase();
                const colors = ['EAB308', '22C55E', '3B82F6', 'EC4899', 'F97316'];
                const color = colors[playlist.name.length % colors.length];

                // Allow "default-album.png" or similar if coverImageUrl is null/empty
                const coverSrc = playlist.coverImageUrl || `https://placehold.co/64x64/${color}/FFFFFF?text=${initial}`;

                // Determine ownership
                // playlist.owner might be an ID string or an object with _id
                const ownerId = (typeof playlist.owner === 'object') ? playlist.owner?._id : playlist.owner;
                const isOwner = (currentUserId && ownerId === currentUserId);

                // Add More Button HTML (Context Menu Trigger)
                // We use flex layout. 

                li.innerHTML = `
          <img src="${coverSrc}" alt="${playlist.name}" class="library-item-img" />
          <div class="library-item-info">
            <span class="library-item-title">${playlist.name}</span>
            <span class="library-item-subtitle">Playlist • ${playlist.owner?.name || 'User'}</span>
          </div>
          <button class="library-more-btn" title="More Options">
            <img src="images/icons/more.png" style="width: 20px; height: 20px;" />
          </button>
          
          <!-- Context Menu (Hidden) -->
          <div class="context-menu">
             <div class="context-menu-item danger" data-action="delete">
                <img src="images/icons/delete.png" class="context-menu-icon">
                <span>${isOwner ? 'Delete Playlist' : 'Remove from Library'}</span>
             </div>
             <div class="context-menu-item" data-action="download">
                <img src="images/icons/download.png" class="context-menu-icon" onerror="this.style.display='none'">
                <span>Download</span>
             </div>
             <div class="context-menu-item" data-action="share">
                <img src="images/icons/share.png" class="context-menu-icon" onerror="this.style.display='none'">
                <span>Share</span>
             </div>
          </div>
        `;

                // Main Click (Open Playlist)
                li.onclick = (e) => {
                    // Prevent if clicked on button or menu
                    if (e.target.closest('.library-more-btn') || e.target.closest('.context-menu')) return;
                    window.location.hash = `#/playlist/${playlist._id}`;
                };

                // Context Menu Logic
                const moreBtn = li.querySelector('.library-more-btn');
                const menu = li.querySelector('.context-menu');

                if (moreBtn && menu) {
                    moreBtn.onclick = (e) => {
                        e.stopPropagation();
                        // Close other menus
                        document.querySelectorAll('.context-menu.active').forEach(m => {
                            if (m !== menu) {
                                m.classList.remove('active');
                                // Find parent li and remove class
                                const parentLi = m.closest('.library-item');
                                if (parentLi) parentLi.classList.remove('menu-active');
                            }
                        });
                        menu.classList.toggle('active');
                        li.classList.toggle('menu-active');
                    };

                    // Menu Item Clicks
                    menu.querySelectorAll('.context-menu-item').forEach(item => {
                        item.onclick = async (e) => {
                            e.stopPropagation();
                            const action = item.dataset.action;
                            menu.classList.remove('active'); // Close
                            li.classList.remove('menu-active');

                            if (action === 'delete') {
                                const confirmMsg = isOwner
                                    ? `Are you sure you want to PERMANENTLY delete "${playlist.name}"?`
                                    : `Remove "${playlist.name}" from your library?`;

                                if (confirm(confirmMsg)) {
                                    try {
                                        if (isOwner) await PlaylistService.deletePlaylist(playlist._id);
                                        else await PlaylistService.removePlaylistFromLibrary(playlist._id);
                                        this.renderLibrary();
                                    } catch (err) {
                                        alert('Action failed: ' + err.message);
                                    }
                                }
                            } else if (action === 'download') {
                                alert("Download feature coming soon!");
                            } else if (action === 'share') {
                                alert("Share feature coming soon!");
                            }
                        };
                    });
                }

                libraryList.appendChild(li);
            });

            // Global Click to Close Menus
            // Prevent adding multiple listeners by checking a flag? Or just add/remove?
            // LibraryManager isn't a class instance that persists perfectly state-wise across renders.
            // A simple way is to remove old one if exists or just let it be (body click is cheap).
            // But better:
            if (!this._hasGlobalListener) {
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.library-more-btn') && !e.target.closest('.context-menu')) {
                        document.querySelectorAll('.context-menu.active').forEach(m => m.classList.remove('active'));
                        document.querySelectorAll('.library-item.menu-active').forEach(i => i.classList.remove('menu-active'));
                    }
                });
                this._hasGlobalListener = true;
            }

        } catch (err) {
            console.error('Error rendering library:', err);
        }
    },

    setupCreatePlaylistModal() {
        const openBtn = document.getElementById('create-playlist-btn');
        const modal = document.getElementById('create-playlist-modal');
        const closeBtn = document.getElementById('close-create-playlist');
        const form = document.getElementById('create-playlist-form');

        if (!openBtn || !modal || !form) return;

        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            document.getElementById('playlist-name-input').focus();
        });

        const closeModal = () => {
            modal.style.display = 'none';
            form.reset();
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('playlist-name-input');
            const name = nameInput.value.trim();

            if (!name) return;

            try {
                await PlaylistService.createPlaylist(name);
                closeModal();
                this.renderLibrary(); // Refresh list
                // Optionally navigate to new playlist?
            } catch (err) {
                alert('Failed to create playlist: ' + err.message);
            }
        });
    }
};
