# Music Player Documentation

## Overview
The Music Player is the core feature of VibAura that handles audio playback, controls, and state management. It provides users with a seamless experience for playing, pausing, skipping, and controlling volume.

## Key Features

### 1. **Playback Controls**
- Play and pause audio
- Next/Previous track navigation
- Progress seeking (jump to any point in track)
- Volume control (0-100%)

### 2. **Playlist Management**
- Load multiple songs into queue
- Navigate through playlist
- Track current playing song
- Manage song order

### 3. **Player Information Display**
- Show current song title and artist
- Display current time and total duration
- Visual progress bar
- Volume level indicator

### 4. **State Management**
- Maintain current playback state
- Store playlist queue
- Track playback position
- Remember volume level

## Architecture

The Music Player uses a **3-layer architecture**:

```
┌──────────────────────────┐
│   playerDOM              │  <- Handles UI rendering
│   (Display Layer)        │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ playerController         │  <- Handles logic
│ (Business Logic Layer)   │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│ playerState              │  <- Stores data
│ (Data Layer)             │
└──────────────────────────┘
```

### Layer Responsibilities

- **playerState.js**: Stores current song, playlist, playback status, volume
- **playerController.js**: Processes user actions (play, pause, skip, volume)
- **playerDOM.js**: Updates UI elements based on state changes

## Workflow Diagrams

### 1. Player Initialization
```
App Loads
    ↓
Initialize playerState (empty playlist, paused)
    ↓
Initialize playerDOM (render player UI)
    ↓
Initialize playerController (link state & DOM)
    ↓
Attach event listeners to controls
    ↓
Player Ready
```

### 2. Playing a Song
```
User clicks PLAY button
    ↓
playerController.play()
    ↓
Check if song exists in playerState
    ↓
Audio element starts playing
    ↓
playerState.isPlaying = true
    ↓
playerDOM updates play button UI
    ↓
Progress bar updates in real-time
```

### 3. Skipping to Next Track
```
User clicks NEXT button
    ↓
playerController.nextTrack()
    ↓
Increment currentIndex in playerState
    ↓
Check if index is within playlist bounds
    ↓
Update playerState.currentSong
    ↓
Update audio source URL
    ↓
playerDOM displays new song info
    ↓
Auto-play or resume playback
```

### 4. Volume Control
```
User adjusts volume slider
    ↓
playerController.setVolume(value)
    ↓
Update playerState.volume
    ↓
Apply volume to audio element
    ↓
playerDOM updates volume display
```

### 5. Progress Seeking
```
User clicks on progress bar
    ↓
playerController.seek(time)
    ↓
Update playerState.currentTime
    ↓
Set audio.currentTime
    ↓
playerDOM updates progress bar position
```

## User Interactions Flow

```
┌─────────────────────────────────────────────────────────┐
│              User Interface / Controls                   │
│  Play | Pause | Next | Prev | Volume | Progress Bar    │
└────────────────────┬────────────────────────────────────┘
                     │ User clicks/interacts
                     ↓
         ┌───────────────────────────┐
         │  playerController         │
         │  (Validates & processes)  │
         └───────────┬───────────────┘
                     │ Updates
                     ↓
         ┌───────────────────────────┐
         │  playerState              │
         │  (Stores new state)       │
         └───────────┬───────────────┘
                     │ State changed
                     ↓
         ┌───────────────────────────┐
         │  playerDOM                │
         │  (Re-renders UI)          │
         └───────────────────────────┘
                     │ Visual update
                     ↓
         ┌───────────────────────────┐
         │  User sees changes        │
         │  on screen                │
         └───────────────────────────┘
```

## Mobile Responsiveness

**Mobile-specific optimizations:**
- Touch-friendly button sizes (min 44x44px)
- Vertical layout for better mobile viewing
- Simplified controls for small screens
- Swipe gesture support for next/previous

**Files:**
- `frontend/css/responsive/mobile-player.css`
- `frontend/scripts/mobile/mobile.js`

## Component Structure

```
frontend/scripts/player/
├── playerState.js      # Manages: song queue, current song, play status, volume
├── playerController.js # Handles: play/pause, next/prev, seek, volume
└── playerDOM.js        # Updates: display elements, progress bar, song info
```

## Event Handling

The player responds to:
- **Click events**: Play, pause, next, previous buttons
- **Change events**: Volume slider, progress bar
- **Audio events**: Play, pause, ended, timeupdate, loadedmetadata
- **Keyboard events**: Space for play/pause (optional)

## State Lifecycle

```
Initial State (empty)
    ↓
Load Playlist (songs added)
    ↓
Select Song (current song set)
    ↓
Play (isPlaying = true)
    ↓
Update Progress (currentTime increases)
    ↓
Song Ends (next song auto-loads or stop)
    ↓
Ready for next action
```

## Browser Compatibility

- HTML5 Audio API support required
- Works on: Chrome, Firefox, Safari, Edge
- Mobile browsers: iOS Safari, Chrome Mobile, Firefox Mobile

## Performance Optimization

1. **Lazy Loading**: Load next track metadata while current plays
2. **Smooth Updates**: Use requestAnimationFrame for progress updates
3. **Event Throttling**: Limit frequent seek/volume updates
4. **Memory Management**: Unload previous tracks from memory

## Future Features

- [ ] Shuffle mode
- [ ] Repeat modes (all, one)
- [ ] Queue management UI
- [ ] Equalizer controls
- [ ] Playback speed adjustment
- [ ] Lyrics synchronized display
- [ ] Keyboard shortcuts
