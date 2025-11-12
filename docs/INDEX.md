# VibAura Documentation

## Table of Contents

### Core Features
1. [Music Player](./MUSIC_PLAYER.md) - Audio playback and controls ✅
2. [Search](./SEARCH.md) - Find songs, artists, and playlists ✅
3. [Music Library](./LIBRARY.md) - Manage your collection ✅
4. [Song Download & Processing](./DOWNLOAD.md) - SpotSync integration ✅
5. [Responsive Design](./RESPONSIVE.md) - Mobile and desktop UI ✅
6. [Theme Management](./THEMES.md) - Dark/Light mode ✅
7. [Routing & Navigation](./ROUTING.md) - App navigation system ✅
8. [Home Page](./HOME.md) - Featured content ✅

### Additional Documentation
- [API Reference](./API.md) *(Coming Soon)*
- [Database Schema](./DATABASE.md) *(Coming Soon)*
- [Setup Guide](./SETUP.md) *(Coming Soon)*

## Documentation Overview

### Music Player ✅
- **Overview**: Core audio playback and control system
- **Key Features**: Play/pause, skip, volume, progress control
- **Architecture**: 3-layer architecture (State, Controller, DOM)
- **Learn**: [Full Documentation](./MUSIC_PLAYER.md)

### Search ✅
- **Overview**: Find songs, artists, and playlists
- **Key Features**: Real-time search, filters, suggestions, history
- **Architecture**: Frontend UI → Controller → Backend API
- **Learn**: [Full Documentation](./SEARCH.md)

### Music Library ✅
- **Overview**: Organize and manage music collection
- **Key Features**: View songs, create playlists, favorites, sorting
- **Architecture**: UI → Controller → Database models
- **Learn**: [Full Documentation](./LIBRARY.md)

### Song Download & Processing ✅
- **Overview**: Download and process songs locally (SpotSync)
- **Key Features**: Download, convert, metadata extraction, retry logic
- **Architecture**: Frontend → Backend → SpotSync Python module
- **Learn**: [Full Documentation](./DOWNLOAD.md)

### Responsive Design ✅
- **Overview**: Optimize UI for all screen sizes
- **Key Features**: Mobile-first, flexible layouts, touch-friendly
- **Architecture**: Base CSS → Responsive breakpoints → Media queries
- **Learn**: [Full Documentation](./RESPONSIVE.md)

### Theme Management ✅
- **Overview**: Light/Dark theme switching
- **Key Features**: Theme toggle, system preference, persistence
- **Architecture**: Theme controller → CSS variables → Visual update
- **Learn**: [Full Documentation](./THEMES.md)

### Routing & Navigation ✅
- **Overview**: Single-page app navigation without reloads
- **Key Features**: Client-side routing, URL management, history
- **Architecture**: Router → Page renderer → Component builder
- **Learn**: [Full Documentation](./ROUTING.md)

### Home Page ✅
- **Overview**: Main dashboard with featured content
- **Key Features**: Featured section, recently played, recommendations, trending
- **Architecture**: Data loader → Section builder → Page renderer
- **Learn**: [Full Documentation](./HOME.md)

## Project Structure

```
VibAura/
├── backend/              # Node.js server
│   ├── server.js        # Express server
│   ├── routes/
│   │   └── search.js    # Search API
│   └── utils/
│       └── logger.js    # Logging
│
├── frontend/             # Web UI
│   ├── public/          # HTML entry point
│   ├── scripts/
│   │   ├── core/        # App core, router
│   │   ├── player/      # Music player logic
│   │   ├── ui/          # UI components
│   │   ├── mobile/      # Mobile optimizations
│   │   └── utils/       # Utilities
│   └── css/             # All styling
│
├── models/              # Data models
│   ├── song.js         # Song model
│   ├── artist.js       # Artist model
│   ├── playlist.js     # Playlist model
│   └── homePageSection.js
│
├── SpotSync/            # Python download module
│   ├── config.py       # Configuration
│   ├── download.py     # Download logic
│   ├── process.py      # Audio processing
│   ├── logger.py       # Logging
│   └── retry_utils.py  # Error handling
│
└── docs/                # Documentation
    ├── MUSIC_PLAYER.md
    ├── SEARCH.md
    ├── LIBRARY.md
    ├── DOWNLOAD.md
    ├── RESPONSIVE.md
    ├── THEMES.md
    ├── ROUTING.md
    ├── HOME.md
    └── INDEX.md (this file)
```

## Quick Navigation

| Feature | Purpose | Location | Status |
|---------|---------|----------|--------|
| Music Player | Audio playback | `frontend/scripts/player/` | ✅ Documented |
| Search | Find content | `frontend/scripts/ui/search.js` | ✅ Documented |
| Library | Manage collection | `models/` | ✅ Documented |
| Download | Song acquisition | `SpotSync/` | ✅ Documented |
| Responsive | Mobile/Desktop | `frontend/css/responsive/` | ✅ Documented |
| Themes | UI customization | `frontend/scripts/ui/themeManager.js` | ✅ Documented |
| Routing | Navigation | `frontend/scripts/core/router.js` | ✅ Documented |
| Home | Main dashboard | `frontend/public/index.html` | ✅ Documented |

## Getting Started

**Read in this order:**
1. Start with [Home Page](./HOME.md) - Understand the main interface
2. Learn [Routing & Navigation](./ROUTING.md) - How to move around
3. Explore [Music Player](./MUSIC_PLAYER.md) - Core playback feature
4. Discover [Search](./SEARCH.md) - Find music
5. Master [Music Library](./LIBRARY.md) - Organize collection
6. Review [Responsive Design](./RESPONSIVE.md) - Multi-device support
7. Customize [Themes](./THEMES.md) - Visual preferences
8. Advanced [Download & Processing](./DOWNLOAD.md) - Technical integration

## Key Concepts

- **SPA (Single-Page Application)**: VibAura loads once and updates views dynamically
- **Responsive**: Works on all devices (mobile, tablet, desktop)
- **Progressive Web App**: Can work offline (future enhancement)
- **Modular Architecture**: Separate concerns (player, search, router, etc.)
- **State Management**: Centralized data flow
- **Event-Driven**: User interactions trigger state changes

## Technology Stack

**Frontend:**
- Vanilla JavaScript (no frameworks)
- HTML5 Audio API
- CSS3 (Flexbox, Grid, Custom Properties)
- LocalStorage for persistence

**Backend:**
- Node.js + Express
- Python (SpotSync module)
- RESTful API

**Features:**
- Client-side routing
- Real-time search
- Theme switching
- Responsive design
- Song downloading & processing

## Last Updated
November 12, 2025

---

**All core features documented!** ✅ Start reading and exploring!
