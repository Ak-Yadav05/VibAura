# Music Library Documentation

## Overview
The Music Library feature allows users to organize, manage, and browse their music collection. It provides a structured view of all songs, artists, and playlists with various management options.

## Key Features

### 1. **Library Organization**
- View all songs in library
- Organize by artists
- Group by playlists
- Sort by various criteria

### 2. **Playlist Management**
- Create new playlists
- Add songs to playlists
- Remove songs from playlists
- Delete playlists
- Rename playlists
- Reorder songs in playlist

### 3. **Favorite Tracking**
- Mark songs as favorites
- Mark artists as favorites
- Mark playlists as favorites
- Quick access to favorites section

### 4. **Library Browsing**
- Browse all songs
- Browse artists
- Browse playlists
- Search within library
- View song details

### 5. **Library Statistics**
- Total songs count
- Total artists count
- Total playlists count
- Library size
- Last updated date

## Architecture

```
┌──────────────────────────┐
│   Library UI             │  <- Display library content
│   (componentBuilder)     │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Library Controller       │  <- Manage library operations
│ (pageRenderer.js)        │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Library State Manager    │  <- Store library data
│ (Models: Song, Artist,   │
│   Playlist)              │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Database / File System   │  <- Persistent storage
│                          │
└──────────────────────────┘
```

## Component Structure

```
Library Feature Files:
├── models/song.js              # Song data model
├── models/artist.js            # Artist data model
├── models/playlist.js          # Playlist data model
├── frontend/scripts/ui/        # UI components
├── frontend/css/components/    # Styling
│   └── library.css
└── frontend/public/index.html  # Library page
```

## Library Workflow

### 1. Loading Library
```
User opens library
    ↓
Fetch all songs from database
    ↓
Fetch all artists from database
    ↓
Fetch all playlists from database
    ↓
Load favorite status for each item
    ↓
Render library view
    ↓
Display to user
```

### 2. Creating Playlist
```
User clicks "New Playlist"
    ↓
Show playlist creation modal
    ↓
User enters playlist name
    ↓
User clicks "Create"
    ↓
Backend creates playlist entry
    ↓
Add new playlist to library
    ↓
Redirect to new playlist
```

### 3. Adding Songs to Playlist
```
User views a song
    ↓
Right-click or click menu icon
    ↓
Select "Add to Playlist"
    ↓
Show list of playlists
    ↓
User selects target playlist
    ↓
Backend adds song to playlist
    ↓
Show success notification
    ↓
Update playlist count
```

### 4. Marking as Favorite
```
User clicks heart icon on song
    ↓
Toggle favorite status
    ↓
Update backend/database
    ↓
Song moved to Favorites
    ↓
Heart icon fills with color
    ↓
Update library statistics
```

### 5. Browsing Library Sections
```
User clicks "Songs" tab
    ↓
Display all songs in library
    ↓
Show song details (title, artist, duration)
    ↓
Provide sort/filter options
    ↓
User clicks song to play
    ↓
OR
User clicks "Artists" tab
    ↓
Display all artists
    ↓
Show artist thumbnail and follower count
    ↓
Click artist to view all their songs
```

## User Interaction Flow

```
┌─────────────────────────────────────┐
│     Library Main View               │
│  • Songs  • Artists  • Playlists    │
│  • Favorites  • Recently Played     │
└────────────┬────────────────────────┘
             │ User clicks tab
             ↓
┌─────────────────────────────────────┐
│   Songs / Artists / Playlists       │
│   (List view with details)          │
└────────────┬────────────────────────┘
             │ User interacts
             ├─→ Click song to play
             ├─→ Right-click for menu
             ├─→ Click add to playlist
             ├─→ Click favorite heart
             └─→ Scroll to load more
             ↓
┌─────────────────────────────────────┐
│    Action Completed                 │
│    (Song playing, added to list,    │
│     favorite marked, etc)           │
└─────────────────────────────────────┘
```

## Library Data Models

### Song Model
```
Song:
├── id (unique identifier)
├── title (string)
├── artist (Artist object/reference)
├── album (string)
├── duration (number - seconds)
├── url (file path or stream URL)
├── coverArt (image URL)
├── dateAdded (timestamp)
├── isFavorite (boolean)
└── playCount (number)
```

### Artist Model
```
Artist:
├── id (unique identifier)
├── name (string)
├── profileImage (image URL)
├── followers (number)
├── bio (text)
├── songs (array of Song objects)
├── isFavorite (boolean)
└── dateAdded (timestamp)
```

### Playlist Model
```
Playlist:
├── id (unique identifier)
├── name (string)
├── description (text)
├── creator (string)
├── songs (array of Song objects)
├── thumbnail (image URL)
├── dateCreated (timestamp)
├── dateModified (timestamp)
├── isPublic (boolean)
└── followerCount (number)
```

## Library Views

### 1. All Songs View
```
Display all songs in table format:
├── Song title
├── Artist name
├── Album
├── Duration
├── Date added
├── Favorite button
└── Menu (add to playlist, delete)
```

### 2. Artists View
```
Display all artists in grid/list:
├── Artist image
├── Artist name
├── Song count
├── Favorite button
└── Click to view artist songs
```

### 3. Playlists View
```
Display all playlists:
├── Playlist thumbnail
├── Playlist name
├── Creator name
├── Song count
├── Play button
└── Menu options
```

### 4. Favorites View
```
Display favorited items:
├── Favorite songs
├── Favorite artists
├── Favorite playlists
```

### 5. Recently Played
```
Show last N songs played:
├── Song thumbnail
├── Song title & artist
├── Play time
└── Play button to resume
```

## Library Operations

### Sorting Options
- **Songs**: By title, artist, date added, duration, play count
- **Artists**: By name, followers, date added
- **Playlists**: By name, date created, song count

### Filtering Options
- By artist name
- By album
- By genre
- By date added (range)
- By duration (range)
- By favorite status

### Search Within Library
- Search songs by title
- Search artists by name
- Search playlists by name

## Library Statistics & Metadata

```
Library Stats Display:
├── Total Songs (count)
├── Total Artists (count)
├── Total Playlists (count)
├── Total Duration (hours:minutes)
├── Favorite Songs (count)
├── Favorite Artists (count)
├── Last Updated (date/time)
└── Library Size (MB or GB)
```

## Mobile Library Experience

**Mobile-specific features:**
- Full-width list view
- Swipe gestures to reveal action menu
- Sticky header with tabs
- Simplified sort/filter options
- One column layout

**Files:**
- `frontend/css/responsive/mobile-layout.css`
- `frontend/css/mobile.css`
- `frontend/scripts/mobile/mobile.js`

## Event Handling

The library responds to:
- **Click events**: Tab selection, item selection, menu items
- **Right-click event**: Context menu for more options
- **Scroll event**: Load more items (pagination/infinite scroll)
- **Drag-drop events**: Reorder songs in playlists
- **Double-click**: Play song or open item

## Library State Management

```
Library State:
├── allSongs (array)
├── allArtists (array)
├── allPlaylists (array)
├── favorites (array of IDs)
├── currentView (songs | artists | playlists)
├── sortBy (current sort field)
├── filterBy (active filters)
├── loading (boolean)
└── error (error message)
```

## Performance Optimization

1. **Pagination**: Load songs in batches (50-100 per page)
2. **Lazy Loading**: Load images as user scrolls
3. **Caching**: Cache library data locally
4. **Indexing**: Use database indexes for fast searches
5. **Virtual Scrolling**: Render only visible items

## Browser Compatibility

- All modern browsers
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design support

## Future Enhancements

- [ ] Advanced filtering UI
- [ ] Bulk playlist operations
- [ ] Import/Export playlists
- [ ] Share playlists with other users
- [ ] Collaborative playlists
- [ ] Smart playlists (auto-generated)
- [ ] Library backup/restore
- [ ] Duplicate song detection
