# Search Feature Documentation

## Overview
The Search feature enables users to find songs, artists, and playlists quickly and efficiently. It provides real-time search results with filtering and sorting capabilities.

## Key Features

### 1. **Real-Time Search**
- Instant search results as user types
- Auto-complete suggestions
- Debounced search for performance
- No need to press enter

### 2. **Multi-Type Search**
- Search for songs by title
- Search for artists by name
- Search for playlists by title
- Filter results by category

### 3. **Search Results Display**
- Display matching songs with metadata
- Show artist information
- Display playlist previews
- Highlight search keywords

### 4. **Search History**
- Store recent searches
- Quick access to previous searches
- Clear search history option

### 5. **Advanced Filtering**
- Filter by artist
- Filter by genre
- Filter by date
- Sort by relevance, popularity, recency

## Architecture

```
┌──────────────────────────┐
│   Search UI Component    │  <- Search input & results display
│   (searchPage.js)        │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Search Controller        │  <- Search logic & filtering
│ (search.js)              │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Search Engine            │  <- Query processing
│ (backend/routes/search)  │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ Database / Song Library  │  <- Data source
│ (Models)                 │
└──────────────────────────┘
```

## Component Structure

```
Search Feature Files:
├── frontend/scripts/ui/search.js       # Frontend search logic
├── backend/routes/search.js            # Backend search API
├── frontend/css/search-page.css        # Search page styling
├── frontend/css/components/search.css  # Search component styles
└── frontend/public/index.html          # Search page HTML
```

## Search Workflow

### 1. User Initiates Search
```
User types in search input
    ↓
Input triggers onchange/oninput event
    ↓
Frontend search.js receives input
    ↓
Debounce timer starts (300-500ms)
    ↓
Wait for user to stop typing
```

### 2. Query Processing
```
Debounce timer expires
    ↓
Validate search query (min 2 characters)
    ↓
Send query to backend API
    ↓
Backend search.js receives request
    ↓
Parse query parameters
    ↓
Prepare database query
```

### 3. Search Execution
```
Backend queries song library
    ↓
Match songs by title
    ↓
Match artists by name
    ↓
Match playlists by title
    ↓
Apply filters (if any)
    ↓
Sort results by relevance
    ↓
Return top N results
```

### 4. Results Display
```
Frontend receives results
    ↓
Parse response data
    ↓
Build result HTML elements
    ↓
Render songs section
    ↓
Render artists section
    ↓
Render playlists section
    ↓
Display to user with highlighting
```

## User Interaction Flow

```
┌─────────────────────────────────────┐
│       Search Input Field            │
│   (e.g., "Drake", "One Dance")      │
└────────────┬────────────────────────┘
             │ User types
             ↓
┌─────────────────────────────────────┐
│     Real-Time Suggestions           │
│   (Auto-complete dropdown)          │
└────────────┬────────────────────────┘
             │ User selects or continues typing
             ↓
┌─────────────────────────────────────┐
│    Search Results Page              │
│  • Songs matching query             │
│  • Artists matching query           │
│  • Playlists matching query         │
└────────────┬────────────────────────┘
             │ User clicks result
             ↓
┌─────────────────────────────────────┐
│    Navigate to Song/Artist/Playlist  │
│    (Play song or view details)      │
└─────────────────────────────────────┘
```

## Search Data Model

```
Search Query:
├── text (string) - Search term
├── type (string) - songs | artists | playlists | all
├── filters (object)
│   ├── genre (string)
│   ├── artist (string)
│   └── dateRange (object)
└── sort (string) - relevance | popularity | recent

Search Result:
├── id (string/number)
├── type (string) - song | artist | playlist
├── title (string)
├── subtitle (string) - artist name or playlist count
├── thumbnail (image URL)
├── metadata (object)
│   ├── duration (for songs)
│   ├── followers (for artists)
│   └── trackCount (for playlists)
└── relevanceScore (number)
```

## Search Features in Detail

### 1. Auto-Complete Suggestions
```
User types "dra"
    ↓
Frontend queries suggestions
    ↓
Display dropdown with:
    • Drake (artist)
    • Dragon (playlist)
    • Dracula (song)
    ↓
User clicks suggestion
    ↓
Perform full search for that item
```

### 2. Search Filtering
```
User sees search results
    ↓
Clicks "Filter by" button
    ↓
Filters appear:
    • Genre: Pop, Hip-Hop, Rock...
    • Artist: Select artists...
    • Year: 2020-2025...
    ↓
User selects filters
    ↓
Results update in real-time
```

### 3. Search History
```
User searches for songs
    ↓
Search query saved to localStorage
    ↓
Recent searches shown in search bar
    ↓
User can click recent search to repeat
    ↓
User can clear history
```

## Search Performance Optimization

1. **Debouncing**: Delay search while user types (300-500ms)
2. **Caching**: Cache recent search results
3. **Pagination**: Load results in batches (10-20 per page)
4. **Indexing**: Backend uses indexed search for speed
5. **Lazy Loading**: Load images as user scrolls

## Mobile Search Experience

**Mobile-specific features:**
- Full-width search input
- Larger touch targets for filters
- Vertical result layout
- Simplified filtering options
- Search bar sticky at top

**Files:**
- `frontend/css/responsive/mobile-layout.css`
- `frontend/css/mobile.css`

## Event Handling

The search responds to:
- **Input event**: Real-time character input
- **Click event**: Filter selection, result selection
- **Scroll event**: Infinite scroll for more results
- **Enter key**: Submit search query
- **Escape key**: Close search modal

## Search Result Types

```
Songs:
├── Title
├── Artist name
├── Album
├── Duration
└── Play button

Artists:
├── Artist name
├── Profile picture
├── Follower count
└── Follow button

Playlists:
├── Playlist name
├── Creator name
├── Track count
└── Play button
```

## API Endpoint

**Backend API:**
```
GET /api/search?q=query&type=all&limit=20&offset=0
GET /api/search?q=query&type=songs
GET /api/search?q=query&type=artists
GET /api/search?q=query&type=playlists
```

## Search State Management

```
Search State:
├── query (current search term)
├── results (array of results)
├── loading (boolean)
├── error (error message)
├── filters (active filters)
├── currentPage (pagination)
└── totalResults (total count)
```

## Browser Compatibility

- Works on all modern browsers
- Mobile browser compatible
- Fallback for no JavaScript support

## Future Enhancements

- [ ] Fuzzy search matching (typo tolerance)
- [ ] Voice search input
- [ ] Search analytics (trending searches)
- [ ] Saved search filters
- [ ] Search result bookmarking
- [ ] Advanced query syntax (AND, OR, NOT)
- [ ] Search refinement suggestions
