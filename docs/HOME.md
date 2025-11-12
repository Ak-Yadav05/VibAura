# Home Page Documentation

## Overview
The Home Page is the landing and main dashboard of VibAura. It displays featured content, recently played songs, popular playlists, and recommendations to users upon opening the application. It serves as the central hub for discovering music and accessing key features.

## Key Features

### 1. **Featured Content Section**
- Showcase trending songs
- Highlight new releases
- Display featured artists
- Rotate featured playlists

### 2. **Recently Played**
- Show last played songs
- Quick access to favorite tracks
- Recent artists browsed
- Resume playback functionality

### 3. **Recommendations**
- Suggested songs based on listening history
- Related artists to favorites
- Curated playlists
- Personalized content

### 4. **Popular/Trending**
- Most played songs this week
- Top artists trending
- Popular playlists
- Charts and rankings

### 5. **Quick Actions**
- Start playing recommended song
- Browse featured playlist
- View artist page
- Search songs

## Architecture

```
┌──────────────────────────────────────┐
│    Home Page Component               │
│    (Home section on main app)        │
└────────────┬─────────────────────────┘
             │
      ┌──────┴──────┐
      ↓             ↓
┌──────────┐  ┌──────────────┐
│ Data     │  │ Renderer     │
│ Loader   │  │ (Page Layout)│
│ (fetch)  │  │              │
└──────┬───┘  └──────┬───────┘
      │             │
      └──────┬──────┘
             ↓
┌──────────────────────────────────────┐
│    Component Builder                 │
│    (Section components)              │
│    - FeaturedSection                 │
│    - RecentlyPlayedSection           │
│    - RecommendationsSection          │
│    - TrendingSection                 │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    DOM Rendering                     │
│    (Display to user)                 │
└──────────────────────────────────────┘
```

## Component Structure

```
Home Page Files:
├── models/homePageSection.js   # Home page section data model
├── frontend/scripts/ui/
│   ├── pageRenderer.js         # Home page renderer
│   ├── componentBuilder.js     # Build sections
│   └── scrollController.js     # Infinite scroll
├── frontend/css/views/content.css
├── frontend/css/components/
│   └── header.css              # Top bar styling
└── frontend/public/index.html  # Home page HTML
```

## Home Page Workflow

### 1. Home Page Load
```
User opens VibAura (or clicks Home)
    ↓
Router navigates to /
    ↓
pageRenderer loads home page
    ↓
Fetch home page data
    ├── Featured songs
    ├── Recently played
    ├── Recommendations
    └── Trending content
    ↓
Build page sections
    ↓
Render to DOM
    ↓
Load images (lazy loading)
    ↓
Page interactive
```

### 2. Data Fetching
```
Home page initialization
    ↓
homePageSection.js provides structure
    ↓
Fetch from backend or database
    ├── Get featured playlists
    ├── Get trending songs
    ├── Get user's recent activity
    └── Get recommendations
    ↓
Process data
    ↓
Organize into sections
    ↓
Pass to renderer
```

### 3. Section Rendering
```
Featured Section:
├── Featured playlist 1
├── Featured playlist 2
└── Featured playlist 3

Recently Played Section:
├── Song 1 (with play button)
├── Song 2
└── Song 3

Recommendations Section:
├── Recommended song 1
├── Recommended song 2
└── Recommended song 3

Trending Section:
├── #1 Trending song
├── #2 Trending song
└── #3 Trending song
```

### 4. User Interaction
```
User sees home page
    ↓
Click featured playlist
    ↓
Navigate to /playlist/:id
    ↓
Playlist detail page loads
    OR
User clicks song play button
    ↓
Song starts playing
    ↓
Player updates
```

## User Interaction Flow

```
┌──────────────────────────────────────┐
│      Home Page Loads                 │
│  • Header with search                │
│  • Multiple content sections         │
│  • Scroll to view all content        │
└────────────┬─────────────────────────┘
             │ User interacts
             ├─→ Click featured item
             ├─→ Click play button
             ├─→ Scroll down for more
             ├─→ Search from header
             └─→ Click artist link
             │
             ↓
┌──────────────────────────────────────┐
│      Navigate to Detail Page         │
│           OR                         │
│      Play Song / Scroll Content      │
└──────────────────────────────────────┘
```

## Home Page Sections

### 1. Featured Section
```
┌────────────────────────────────────┐
│         FEATURED                   │
├────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌────────┐│
│ │Playlist │ │Playlist │ │Playlist││
│ │Cover    │ │Cover    │ │Cover   ││
│ │Title    │ │Title    │ │Title   ││
│ │Creator  │ │Creator  │ │Creator ││
│ └─────────┘ └─────────┘ └────────┘│
└────────────────────────────────────┘
```

### 2. Recently Played Section
```
┌────────────────────────────────────┐
│      RECENTLY PLAYED                │
├────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ 🎵 Song Title        Artist      ││
│ │ [▶]                              ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 🎵 Song Title        Artist      ││
│ │ [▶]                              ││
│ └─────────────────────────────────┘│
└────────────────────────────────────┘
```

### 3. Recommendations Section
```
┌────────────────────────────────────┐
│      RECOMMENDED FOR YOU             │
├────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌────────┐│
│ │Song     │ │Song     │ │Song    ││
│ │Cover    │ │Cover    │ │Cover   ││
│ │Title    │ │Title    │ │Title   ││
│ │Artist   │ │Artist   │ │Artist  ││
│ │[▶] [♥]  │ │[▶] [♥]  │ │[▶] [♥]││
│ └─────────┘ └─────────┘ └────────┘│
└────────────────────────────────────┘
```

### 4. Trending Section
```
┌────────────────────────────────────┐
│         TRENDING NOW                 │
├────────────────────────────────────┤
│ 1. Song Title    - Artist Name      │
│    [▶] [♥] · Duration              │
│ ────────────────────────────────────│
│ 2. Song Title    - Artist Name      │
│    [▶] [♥] · Duration              │
│ ────────────────────────────────────│
│ 3. Song Title    - Artist Name      │
│    [▶] [♥] · Duration              │
└────────────────────────────────────┘
```

## HomePageSection Model

### Data Structure
```
HomePageSection:
├── id (unique identifier)
├── title (string) - "Featured", "Recently Played"
├── type (string) - "featured" | "recent" | "recommended" | "trending"
├── items (array) - Array of content items
│   ├── Songs
│   ├── Artists
│   ├── Playlists
│   └── Or mixed
├── displayMode (string) - "grid" | "list" | "carousel"
├── limit (number) - How many items to show
└── order (number) - Display order on page
```

### Item Structure
```
Section Item:
├── id (unique identifier)
├── type (string) - "song" | "artist" | "playlist"
├── title (string)
├── subtitle (string) - Artist or creator name
├── thumbnail (image URL)
├── duration (for songs)
├── followerCount (for artists/playlists)
├── playCount (for trending)
└── actionButtons (play, add to favorites, etc)
```

## Page Layout

### Desktop Layout
```
┌──────────────────────────────────────────────────────┐
│               Header / Navigation                     │
├─────────────────┬──────────────────────┬──────────────┤
│                 │                      │              │
│   Sidebar       │   Main Content       │  Queue View  │
│   Navigation    │   (Home Sections)    │  (Right)     │
│                 │                      │              │
│                 │  • Featured          │              │
│                 │  • Recently Played   │              │
│                 │  • Recommendations   │              │
│                 │  • Trending          │              │
│                 │                      │              │
├─────────────────┴──────────────────────┴──────────────┤
│               Music Player (Bottom)                    │
└──────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────┐
│     Header           │
├──────────────────────┤
│                      │
│   Main Content       │
│   (Single Column)    │
│                      │
│  • Featured          │
│  • Recently Played   │
│  • Recommendations   │
│  • Trending          │
│                      │
├──────────────────────┤
│  Bottom Navigation   │
│  (Fixed Tabs)        │
├──────────────────────┤
│  Music Player        │
│  (Compact)           │
└──────────────────────┘
```

## Infinite Scroll / Load More

### Scroll Behavior
```
User scrolls down to bottom of page
    ↓
Trigger load more event
    ↓
Fetch more items from API
    ↓
Append to current section
    ↓
Animate new items
    ↓
Update scroll position
    ↓
Ready for more scrolling
```

### Pagination
```
Display sections with 10-20 items
    ↓
Show "Load More" button
    ↓
User scrolls or clicks button
    ↓
Fetch next batch
    ↓
Add to page
    ↓
Continue scrolling
```

## Image Optimization

### Lazy Loading
```
Home page loads
    ↓
Don't load all images immediately
    ↓
As user scrolls, load visible images
    ↓
Off-screen images load when needed
    ↓
Improves page load performance
```

### Responsive Images
```
Mobile: Small image sizes (300x300px)
Tablet: Medium image sizes (400x400px)
Desktop: Large image sizes (500x500px)

Bandwidth saved on mobile!
```

## Performance Optimization

1. **Data Caching**: Cache home page data for 5-10 minutes
2. **Image Optimization**: Use optimized, compressed images
3. **Lazy Loading**: Load images and content on demand
4. **Code Splitting**: Load home page specific code
5. **Preload Critical Resources**: Preload essential data

## Mobile Home Experience

**Mobile-specific features:**
- Single column layout
- Full-width sections
- Larger touch targets
- Bottom navigation visible
- Simplified featured display
- Swipe-able carousels

**Files:**
- `frontend/css/responsive/mobile-layout.css`
- `frontend/scripts/mobile/mobile.js`

## Event Handling

Home page responds to:
- **Click events**: Featured items, play buttons, artist links
- **Scroll events**: Infinite scroll for more content
- **Touch events**: Swipe on carousel (mobile)
- **Load events**: Images loaded, data fetched

## State Management

```
Home Page State:
├── featuredItems (array)
├── recentlyPlayedItems (array)
├── recommendedItems (array)
├── trendingItems (array)
├── loading (boolean)
├── error (error message)
├── pageNumber (for pagination)
└── totalItems (count)
```

## Analytics & Tracking

**Track user interactions:**
- Featured item clicks
- Play button clicks
- Playlist opens
- Artist profile visits
- Search from home

## Error Handling

### Data Load Failure
```
Fetch home page data
    ↓ Failed
Show loading error message
    ↓
Provide "Retry" button
    ↓
Show cached data if available
```

### Image Load Failure
```
Image fails to load
    ↓
Show placeholder/fallback image
    ↓
Display "?" or generic icon
    ↓
Content still readable
```

## Browser Compatibility

- All modern browsers
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design support
- JavaScript enabled required

## Testing Home Page

**Test scenarios:**
```
1. Home page loads
   → All sections display correctly
   
2. Featured items clickable
   → Navigate to detail page
   
3. Play buttons work
   → Song plays in player
   
4. Scroll infinite
   → More content loads
   
5. Mobile view
   → Single column layout
   
6. Images load
   → Lazy loading works
```

## Future Enhancements

- [ ] Personalized recommendations
- [ ] User preferences in featured
- [ ] Scheduled featured rotations
- [ ] A/B testing different layouts
- [ ] Social sharing of featured
- [ ] User-created featured sections
- [ ] Offline support with cached data
- [ ] Home page customization by user
- [ ] Weather-based mood recommendations
- [ ] Time-based personalization (morning/evening)
