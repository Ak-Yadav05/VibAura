# Routing & Navigation Documentation

## Overview
The Routing & Navigation feature handles the flow between different pages and sections of VibAura without requiring full page reloads. It provides seamless single-page application (SPA) experience with browser history management.

## Key Features

### 1. **Client-Side Routing**
- Single-page application architecture
- No full page reloads
- Fast navigation between pages
- Smooth transitions

### 2. **URL Management**
- Update browser URL without reload
- Browser back/forward button support
- Bookmarkable routes
- Clean, user-friendly URLs

### 3. **Multiple Navigation Types**
- Header navigation menu
- Side navigation bar
- Bottom tab bar (mobile)
- Breadcrumb navigation
- Direct URL access

### 4. **Route Protection**
- Prevent navigation without login (future)
- Handle 404 not found routes
- Error page handling
- Redirect to appropriate page

### 5. **Navigation State**
- Active route highlighting
- Breadcrumb updates
- Page title updates
- Scroll position management

## Architecture

```
┌──────────────────────────────────────┐
│    User Interaction                  │
│  (Click link, enter URL, back button)│
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    Router (router.js)                │
│    - Parse URL                       │
│    - Match route pattern             │
│    - Determine page component        │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    Page Renderer                     │
│    (pageRenderer.js)                 │
│    - Load page component             │
│    - Update DOM                      │
│    - Apply transitions               │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    Component Builder                 │
│    (componentBuilder.js)             │
│    - Build page sections             │
│    - Render UI elements              │
│    - Apply styles                    │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    Browser Display                   │
│    (Visual output)                   │
└──────────────────────────────────────┘
```

## Component Structure

```
Routing & Navigation Files:
├── frontend/scripts/core/router.js      # Main router logic
├── frontend/scripts/core/app.js         # App initialization
├── frontend/scripts/ui/pageRenderer.js  # Page rendering
├── frontend/scripts/ui/componentBuilder.js # Component creation
└── frontend/public/index.html           # Entry point
```

## Route Structure

### Available Routes
```
/                          # Home page
/search                    # Search page
/search?q=query           # Search with query
/library                  # Music library
/library/songs            # All songs
/library/artists          # All artists
/library/playlists        # All playlists
/library/favorites        # Favorite songs
/library/recently-played  # Recently played
/playlist/:id             # Specific playlist
/artist/:id               # Specific artist
/song/:id                 # Specific song details
/settings                 # Settings (future)
/404                      # Not found page
```

## Navigation Workflow

### 1. Link Click Navigation
```
User clicks navigation link
    ↓
Event listener captures click
    ↓
Prevent default link behavior
    ↓
Extract route from href
    ↓
Pass to router
    ↓
Router matches route pattern
    ↓
Render appropriate page
    ↓
Update browser URL
    ↓
Update page title
    ↓
Display page with transition
```

### 2. Direct URL Navigation
```
User types URL in address bar
    ↓
Browser loads page
    ↓
app.js initializes
    ↓
Extract current URL
    ↓
router.matchRoute(current URL)
    ↓
Determine matching route
    ↓
Load appropriate page component
    ↓
Render page content
    ↓
Page displays
```

### 3. Browser Back/Forward Button
```
User clicks browser back button
    ↓
popstate event triggered
    ↓
Extract URL from browser history
    ↓
Router matches route
    ↓
Load previous page component
    ↓
Page renders
    ↓
User sees previous page
```

### 4. Search to Result Navigation
```
User submits search query
    ↓
Search results load
    ↓
User clicks song result
    ↓
Navigate to /song/:id
    ↓
Song detail page renders
    ↓
Display song info & player
```

## User Interaction Flow

```
┌──────────────────────────────────────┐
│    Current Page (Home)               │
│  • Header with navigation            │
│  • Navigation links                  │
│  • Content area                      │
└────────────┬─────────────────────────┘
             │ User clicks link
             ↓
         Navigation event
             │
             ↓
┌──────────────────────────────────────┐
│    Router determines new route       │
│  • Find matching component           │
│  • Load component                    │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    Page Transition                   │
│  • Fade out old content              │
│  • Load new page                     │
│  • Fade in new content               │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    New Page Displayed (Library)      │
│  • URL updated                       │
│  • Navigation highlighted            │
│  • Page fully rendered               │
│  • Ready for user interaction        │
└──────────────────────────────────────┘
```

## Route Matching Logic

### Router Pattern Matching
```
Route patterns:
├── /                      → Home component
├── /search                → Search component
├── /library               → Library component
├── /playlist/:id          → PlaylistDetail(id)
├── /artist/:id            → ArtistDetail(id)
├── /song/:id              → SongDetail(id)
└── *                      → 404 component

Parameter extraction:
/playlist/123
  ↓
Route: /playlist/:id
  ↓
Parameters: { id: '123' }
  ↓
Render PlaylistDetail with id=123
```

## Navigation Menu Structure

### Header Navigation (Desktop)
```
┌────────────────────────────────┐
│  Logo  | Home | Search | More ↓ │
└────────────────────────────────┘
           Dropdown:
           ├── Library
           ├── Playlists
           └── Settings
```

### Side Navigation (Desktop)
```
┌───────────────────┐
│ VibAura Logo      │
│ ────────────────  │
│ • Home            │
│ • Search          │
│ • Library         │
│ • Playlists       │
│ • Favorites       │
│ • Recently Played │
│ • Settings        │
└───────────────────┘
```

### Bottom Tab Navigation (Mobile)
```
┌────────────────────────┐
│ Home | Search | Library│
│ ────────────────────── │
│                        │
│   Current Page         │
│      Content           │
│                        │
└────────────────────────┘
```

## Page Rendering Flow

### Page Load Process
```
1. Route matched
   ↓
2. Get page component
   ↓
3. Pre-load data (if needed)
   ↓
4. Build page structure
   ↓
5. Apply styling
   ↓
6. Add event listeners
   ↓
7. Display with animation
   ↓
8. Page interactive
```

### Page Unload Process
```
1. New route triggered
   ↓
2. Fade out current page
   ↓
3. Remove event listeners
   ↓
4. Clean up state
   ↓
5. Clear old DOM
   ↓
6. Begin loading new page
```

## URL Structure & Parameters

### Route Parameters
```
/library/playlists/:id
  → id parameter captured
  → Used to load specific playlist
  → Passed to component

/search?q=drake&type=songs
  → Query parameters extracted
  → q = search query
  → type = filter category
  → Pass to search component
```

### Bookmarkable Routes
```
User finds song detail page
  ↓
URL: /song/abc123
  ↓
User bookmarks page
  ↓
User visits bookmark later
  ↓
App loads song detail for abc123
  ↓
Same page renders
```

## Browser History Management

### History API Usage
```
window.history.pushState(state, title, url)
  ├── Adds entry to browser history
  ├── Updates address bar
  └── Enables back button

window.history.replaceState(state, title, url)
  ├── Replaces current history entry
  ├── No new history entry
  └── Back button skips this page

popstate event
  ├── Triggered by back/forward button
  ├── Contains previous state
  └── Re-renders previous page
```

### History Stack
```
Initial: /
↓ (user navigates)
/search
↓ (user navigates)
/library
↓ (user navigates)
/song/123

Current: /song/123

Back button: → /library
Back button: → /search
Back button: → /
```

## Active Route Highlighting

### Navigation Highlight Logic
```
Compare current URL with link href
  ↓
If match → Add 'active' class
  ↓
If no match → Remove 'active' class
  ↓
Update highlight on every navigation

Visual result:
Active link: Highlighted in different color/style
Other links: Normal appearance
```

## Page Title & Meta Updates

### Dynamic Page Title
```
/ → VibAura - Music Player
/search → Search Results - VibAura
/library → My Library - VibAura
/song/:id → Song Title - VibAura

Update on route change:
document.title = pageTitle
```

### Breadcrumb Updates
```
/library/playlists/123
  ↓
Breadcrumb:
Home > Library > Playlists > Playlist Name
  ↓
Click any level to navigate there
```

## Mobile Navigation Experience

**Mobile-specific features:**
- Bottom tab bar fixed at bottom
- Swipe to navigate (optional)
- Hamburger menu for additional options
- Back button behavior follows OS standards
- No redundant menus

**Files:**
- `frontend/css/responsive/mobile-nav.css`
- `frontend/scripts/mobile/mobile.js`

## Event Handling

Navigation responds to:
- **Click events**: Navigation links
- **Popstate event**: Browser back/forward
- **Hashchange event**: URL fragment changes (optional)
- **Input event**: Search query changes
- **Touch events**: Mobile swipe navigation

## Route Configuration

### Route Definition Object
```
const routes = [
  {
    path: '/',
    component: HomePage,
    title: 'Home'
  },
  {
    path: '/search',
    component: SearchPage,
    title: 'Search'
  },
  {
    path: '/library',
    component: LibraryPage,
    title: 'Library'
  },
  {
    path: '/song/:id',
    component: SongDetail,
    title: 'Song Details'
  }
];
```

## Scroll Position Management

### Scroll Behavior
```
On navigation:
1. Save current scroll position
2. Navigate to new page
3. Reset scroll to top
   OR
   Restore previous scroll position

Options:
├── Always scroll to top (default)
├── Restore previous position
└── Scroll to element
```

## Error Handling

### 404 Not Found Route
```
User enters invalid URL
  ↓
Router finds no matching route
  ↓
Render 404 page
  ↓
Display error message
  ↓
Provide links to main pages
```

### Error Fallback
```
Component fails to load
  ↓
Display error message
  ↓
Offer reload option
  ↓
Provide navigation links
```

## Performance Optimization

1. **Route Lazy Loading**: Load components on demand
2. **Component Caching**: Cache rendered components
3. **Preload**: Preload next likely route
4. **Code Splitting**: Split code by route

## Browser Compatibility

- All modern browsers support History API
- Works on mobile browsers
- Fallback to hash-based routing if needed

## Testing Routes

**Test scenarios:**
```
1. Click each navigation link
   → Correct page loads
   → URL updates
   → Active link highlights
   
2. Type URL directly
   → Correct page loads
   
3. Browser back/forward
   → Previous/next page loads
   
4. Bookmark page
   → Page loads when revisited
   
5. Invalid URL
   → 404 page displayed
```

## Future Enhancements

- [ ] Lazy component loading
- [ ] Route-based code splitting
- [ ] Page transition animations
- [ ] Nested routing
- [ ] Route guards/protection
- [ ] Analytics tracking per route
- [ ] Route parameters validation
