# 🎵 VibAura - Modern Music Streaming Platform

<div align="center">

![VibAura](https://img.shields.io/badge/VibAura-Music%20Player-blueviolet?style=for-the-badge&logo=spotify)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge)

**A sleek, responsive music streaming application with real-time search, playlist management, and song download capabilities.**

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [SpotSync – Automation Engine](#-spotsync--automation-engine)
- [API Endpoints](#-api-endpoints)
- [Future Enhancements](#-future-enhancements)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 👀 Overview

**VibAura** is a modern, feature-rich music streaming platform built with vanilla JavaScript, Node.js, and Python. It provides a seamless experience for discovering, searching, playing, and managing music with offline download capabilities.

### What is VibAura?
VibAura is a single-page application (SPA) that combines:
- **Fast Music Playback** - Play songs with intuitive controls
- **Smart Search** - Find songs, artists, and playlists in real-time
- **Music Library** - Organize and manage your music collection
- **Download & Process** - Automatically download and convert songs via SpotSync
- **Responsive Interface** - Works perfectly on mobile, tablet, and desktop
- **Theme Customization** - Light and dark modes with system preference detection
- **Seamless Navigation** - Fast page transitions without reloads

### Key Highlights
✨ **Lightweight** - No frameworks, pure HTML/CSS/JS  
🚀 **Fast** - Optimized for performance and speed  
📱 **Responsive** - Mobile-first design approach  
🎨 **Beautiful** - Modern UI with dark/light themes  
⚙️ **Powerful** - Advanced search, download, and music management  

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Browser                                 │
│  (Chrome, Firefox, Safari, Edge, Mobile Browsers)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
    ┌────────┐       ┌──────────┐       ┌─────────┐
    │Frontend│       │ Player   │       │ Router  │
    │(HTML5) │       │(Audio    │       │(SPA)    │
    │        │       │API)      │       │         │
    └────┬───┘       └────┬─────┘       └────┬────┘
         │                │                   │
         └────────────────┼───────────────────┘
                          │ HTTP/AJAX
         ┌────────────────▼────────────────┐
         │   Backend API (Express.js)      │
         │  /api/search                    │
         │  /api/songs                     │
         │  /api/library                   │
         └────────────────┬────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ↓                ↓                ↓
    ┌─────────┐    ┌──────────┐    ┌──────────────┐
    │SpotSync │    │Database  │    │File Storage  │
    │(Python) │    │(Models)  │    │(Downloads)   │
    │Download │    │          │    │              │
    │Convert  │    │          │    │              │
    └─────────┘    └──────────┘    └──────────────┘
```

### Core Modules

**Frontend (Single-Page App)**
- Router: Client-side navigation
- Player: Audio playback control
- Search: Real-time query interface
- Library: Music collection management
- UI Components: Reusable interface elements

**Backend (Express API)**
- Search Service: Query processing
- Data Service: Song/artist/playlist data
- File Service: Media management

**SpotSync (Download Engine)**
- Download Manager: Song acquisition
- Audio Processor: Format conversion
- Metadata Extractor: ID3 tag management
- Error Handler: Retry logic

---

## 🌟 Features

### 🎶 Music Player
- ▶️ Play, pause, skip, and rewind controls
- 🔊 Volume adjustment (0-100%)
- ⏱️ Real-time progress bar with seek capability
- 📋 Playlist and queue management
- 💾 Persistent playback state
- 🎯 Current song information display (title, artist, duration)

### 🔍 Search System
- 🔎 Real-time search results as you type
- 📌 Multi-type search (songs, artists, playlists)
- 💡 Auto-complete suggestions
- 🏷️ Advanced filtering options
- 📚 Search history tracking
- ⚡ Debounced search for performance

### 📚 Music Library
- 🎵 Browse your entire music collection
- 👤 Artist profiles with discographies
- ❤️ Favorites system with quick access
- 🔀 Multiple sorting options
- ⏰ Recently played tracking
- 📊 Library statistics

### 📥 Download & Management
- ⬇️ Download songs from Spotify/YouTube
- 🔄 Automatic format conversion to MP3
- 🏷️ Auto metadata extraction
- 🔁 Intelligent retry logic
- 📁 Local file management
- 🛡️ Error handling and recovery

### 🎨 User Interface
- 🌓 Light and dark theme support
- 🖥️ Responsive design (mobile, tablet, desktop)
- 📱 Touch-friendly controls
- ⚡ Smooth animations and transitions
- 🎯 Intuitive and clean design
- ♿ Accessible components

### 🧭 Navigation
- 🚀 Single-page app (SPA) architecture
- ⚡ Fast page transitions
- 🔗 Bookmarkable routes
- ⏮️ Browser history support
- 🗺️ Breadcrumb navigation
- 🎯 Smart URL management

---

## 💻 Tech Stack

### Frontend Stack
- **HTML5** - Semantic markup and structure
- **CSS3** - Advanced layouts (Flexbox, Grid)
  - CSS Custom Properties for theming
  - Media queries for responsiveness
  - Mobile-first design approach
- **JavaScript (ES6+)** - Modern vanilla JavaScript
  - HTML5 Audio API for playback
  - LocalStorage for data persistence
  - Fetch API for backend communication

### Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **RESTful API** - Standard API design pattern

### Download & Processing
- **Python 3.8+** - SpotSync automation engine
- **spotdl** - Spotify music downloader
- **yt-dlp** - YouTube downloader
- **pydub** - Audio processing and conversion
- **mutagen** - ID3 tag and metadata handling

### Development Tools
- **Git** - Version control
- **npm** - Node package manager
- **pip** - Python package manager

---

## 📁 Project Structure

```
VibAura/
│
├── 📂 backend/                    # Node.js Express Server
│   ├── server.js                  # Main server entry point
│   ├── routes/
│   │   └── search.js              # Search API endpoints
│   └── utils/
│       └── logger.js              # Server logging utility
│
├── 📂 frontend/                   # Web UI (Single Page App)
│   ├── 📂 public/
│   │   ├── index.html             # Main HTML entry point
│   │   └── 📂 assets/             # Images, icons, media
│   │
│   ├── 📂 scripts/                # JavaScript modules
│   │   ├── 📂 core/
│   │   │   ├── app.js             # App initialization
│   │   │   └── router.js          # Client-side router
│   │   │
│   │   ├── 📂 player/             # Music player logic
│   │   │   ├── playerState.js     # State management
│   │   │   ├── playerController.js # Playback logic
│   │   │   └── playerDOM.js       # UI updates
│   │   │
│   │   ├── 📂 ui/                 # UI components
│   │   │   ├── themeManager.js    # Theme switching
│   │   │   ├── pageRenderer.js    # Page rendering
│   │   │   ├── componentBuilder.js # Component creation
│   │   │   ├── scrollController.js # Scroll handling
│   │   │   ├── search.js          # Search component
│   │   │   └── splashScreen.js    # Loading screen
│   │   │
│   │   ├── 📂 mobile/             # Mobile optimizations
│   │   │   └── mobile.js          # Mobile-specific code
│   │   │
│   │   └── 📂 utils/              # Utility functions
│   │       └── utils.js           # Helper functions
│   │
│   └── 📂 css/                    # Stylesheets
│       ├── base/                  # Base styles & resets
│       ├── components/            # Component styles
│       ├── responsive/            # Media queries
│       ├── views/                 # Page-specific styles
│       ├── desktop.css            # Desktop overrides
│       ├── mobile.css             # Mobile overrides
│       └── search-page.css        # Search page styles
│
├── 📂 models/                     # Data Models
│   ├── song.js                    # Song model/schema
│   ├── artist.js                  # Artist model
│   ├── playlist.js                # Playlist model
│   └── homePageSection.js         # Home page section model
│
├── 📂 SpotSync/                   # Python Download Module
│   ├── config.py                  # Configuration management
│   ├── download.py                # Download logic
│   ├── process.py                 # Audio processing
│   ├── logger.py                  # Logging system
│   ├── retry_utils.py             # Error handling & retry
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment template
│   └── 📂 downloaded-songs/       # Downloaded audio files
│
├── 📂 docs/                       # Comprehensive Documentation
│   ├── INDEX.md                   # Documentation index
│   ├── MUSIC_PLAYER.md            # Music player feature
│   ├── SEARCH.md                  # Search functionality
│   ├── LIBRARY.md                 # Library management
│   ├── DOWNLOAD.md                # Download & processing
│   ├── RESPONSIVE.md              # Responsive design
│   ├── THEMES.md                  # Theme system
│   ├── ROUTING.md                 # Routing & navigation
│   ├── HOME.md                    # Home page feature
│   └── SUMMARY.md                 # Documentation summary
│
├── package.json                   # Node.js dependencies
├── README.md                      # This file
└── .gitignore                     # Git ignore rules
```

---

## 🔧 Setup & Installation

### Prerequisites
- **Node.js** 14.0 or higher ([Download](https://nodejs.org/))
- **Python** 3.8 or higher ([Download](https://www.python.org/))
- **Git** for version control ([Download](https://git-scm.com/))
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ak-Yadav05/VibAura.git
cd VibAura
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

### Step 3: Setup Python Environment (SpotSync)

```bash
cd SpotSync
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### Step 4: Configure Environment Variables

```bash
cd SpotSync
cp .env.example .env

# Edit .env and add your credentials:
# SPOTIFY_CLIENT_ID=your_id
# SPOTIFY_CLIENT_SECRET=your_secret
# YOUTUBE_API_KEY=your_key

cd ..
```

### Step 5: Run the Application

**Terminal 1 - Backend Server:**
```bash
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/public
python -m http.server 8000
# Open http://localhost:8000
```

---

## ⚙️ SpotSync – Automation Engine

### What is SpotSync?

SpotSync is an automated music download and processing engine built with Python. It handles:
- 📥 Downloading songs from Spotify and YouTube
- 🔄 Converting audio to MP3 format
- 🏷️ Extracting and embedding metadata
- 🔁 Intelligent retry logic for failed downloads
- 📊 Detailed logging and error reporting

### How SpotSync Works

```
User Click Download
    ↓
Request sent to SpotSync
    ↓
Search for song on source
    ↓
Download audio stream
    ↓
[Retry logic if fails]
    ↓
Convert to MP3 format
    ↓
Extract metadata
    ↓
Save to downloaded-songs/
    ↓
Notify user
```

### Using SpotSync

```bash
cd SpotSync
source venv/bin/activate

# Download a single song
python download.py --url "spotify:track:xxxxx"

# Download with custom quality
python download.py --url "spotify:track:xxxxx" --quality 320

# Process audio file
python process.py input.mp3 --output-dir ./processed
```

### SpotSync Components

| Component | Purpose | File |
|-----------|---------|------|
| **Config** | Manage settings & credentials | `config.py` |
| **Downloader** | Fetch songs from sources | `download.py` |
| **Processor** | Convert & optimize audio | `process.py` |
| **Logger** | Track operations & errors | `logger.py` |
| **Retry Engine** | Handle errors intelligently | `retry_utils.py` |

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Search Endpoints

**Search All**
```
GET /search?q=query&limit=20&offset=0
```

**Search Songs**
```
GET /search/songs?q=query&genre=pop&sort=relevance
```

**Search Artists**
```
GET /search/artists?q=query
```

**Search Playlists**
```
GET /search/playlists?q=query
```

### Library Endpoints

```
GET /library/songs?sort=title&order=asc
GET /library/artists?limit=50
GET /library/playlists
GET /library/favorites
GET /library/recently-played?limit=10
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

---

## 🚀 Future Enhancements

### Version 1.1 (Q1 2025)
- [ ] User authentication system
- [ ] Cloud synchronization
- [ ] Collaborative playlists
- [ ] Advanced equalizer controls

### Version 1.2 (Q2 2025)
- [ ] Podcast support
- [ ] Lyrics display with sync
- [ ] Karaoke mode
- [ ] Offline playlist access

### Version 2.0 (Q3 2025)
- [ ] Mobile app (iOS/Android)
- [ ] AI-powered recommendations
- [ ] Social features (sharing, following)
- [ ] Radio stations

### Long-term Roadmap
- [ ] Machine learning recommendations
- [ ] Community playlists
- [ ] Live streaming support
- [ ] Audio visualization
- [ ] Advanced analytics dashboard

---

## 📸 Screenshots

### Home Page
Featured content, recommendations, and trending songs displayed beautifully.

### Music Player
Album art, player controls, progress bar, and queue management.

### Search Results
Organized display of songs, artists, and playlists matching your query.

### Music Library
Browse your collection, create playlists, and mark favorites.

### Dark Theme
All pages optimized for night viewing with dark mode support.

*Screenshots coming soon in dedicated folder*

---

## 👤 Author

**Ak-Yadav05**

- 🌐 GitHub: [@Ak-Yadav05](https://github.com/Ak-Yadav05)
- 📧 Contact via GitHub
- 💼 Portfolio: [Your Portfolio URL]

---

<div align="center">

### Made with ❤️ by Ak-Yadav05

![GitHub Stars](https://img.shields.io/github/stars/Ak-Yadav05/VibAura?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Ak-Yadav05/VibAura?style=social)

**[⬆ back to top](#-vibaura---modern-music-streaming-platform)**

</div>
