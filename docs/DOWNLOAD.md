# Song Download & Processing Documentation (SpotSync)

## Overview
SpotSync is a Python-based module that handles downloading songs from external sources (Spotify, YouTube, etc.) and processing them for local storage. It automates the entire workflow from source to playable audio file.

## Key Features

### 1. **Song Download**
- Download songs from Spotify links
- Download from YouTube links
- Download from other music sources
- Batch download capability
- Resume interrupted downloads

### 2. **Audio Processing**
- Convert audio to MP3 format
- Normalize audio levels
- Trim silence from beginning/end
- Optimize audio quality
- Extract metadata (artist, title, album)

### 3. **Error Handling & Retry**
- Automatic retry on download failure
- Exponential backoff strategy
- Graceful error recovery
- Detailed error logging
- Fallback options

### 4. **Configuration Management**
- API credentials configuration
- Quality/format settings
- Output directory configuration
- Logging preferences
- Timeout settings

### 5. **Progress Monitoring**
- Track download progress
- Monitor conversion progress
- Log all operations
- Generate reports
- Track success/failure statistics

## Architecture

```
┌──────────────────────────┐
│   Frontend Trigger       │  <- User initiates download
│   (Search/Library UI)    │
└────────────┬─────────────┘
             │ Send download request
             ↓
┌──────────────────────────┐
│   Backend API            │  <- Receive & validate request
│   (Express route)        │
└────────────┬─────────────┘
             │ Forward to SpotSync
             ↓
┌──────────────────────────┐
│   SpotSync Manager       │  <- Orchestrate download
│   (download.py)          │
└────────────┬─────────────┘
             │
      ┌──────┴──────┐
      ↓             ↓
┌──────────┐  ┌──────────────┐
│ Downloader   │ │ Processor      │
│ (fetch audio)│  │ (convert audio)│
└──────┬───┘  └──────┬───────┘
      │             │
      └──────┬──────┘
             ↓
┌──────────────────────────┐
│   File Storage           │  <- Save processed audio
│   (downloaded-songs/)    │
└────────────┬─────────────┘
             │ Store metadata
             ↓
┌──────────────────────────┐
│   Database               │  <- Update library
│   (Song models)          │
└──────────────────────────┘
```

## Component Structure

```
SpotSync Files:
├── config.py           # Configuration management
├── download.py         # Download functionality
├── process.py          # Audio processing
├── logger.py           # Logging system
├── retry_utils.py      # Retry logic & error handling
├── requirements.txt    # Python dependencies
├── .env                # Environment variables
└── downloaded-songs/
    └── all-songs/      # Downloaded audio files
```

## SpotSync Workflow

### 1. Download Initiation
```
User searches for song in VibAura
    ↓
User clicks "Download" button
    ↓
Frontend sends download request to backend
    ↓
Backend validates song info
    ↓
Creates SpotSync download task
    ↓
Queues download job
```

### 2. Download Process
```
SpotSync receives download task
    ↓
Extract song details (title, artist, etc)
    ↓
Search for song on download source
    ↓
Download audio stream
    ↓
If error → Retry (up to 3 times)
    ↓
Audio downloaded successfully
```

### 3. Audio Processing
```
Downloaded audio received
    ↓
Detect audio format
    ↓
Convert to MP3 (if needed)
    ↓
Normalize audio levels
    ↓
Trim silence
    ↓
Extract metadata (artist, album, etc)
    ↓
Add album art if available
    ↓
Processed audio ready
```

### 4. Storage & Registration
```
Processed audio file saved
    ↓
Save to downloaded-songs/all-songs/
    ↓
Create metadata record
    ↓
Add entry to database
    ↓
Update library model
    ↓
Frontend notified of success
    ↓
User can now play downloaded song
```

### 5. User Notification
```
Download & processing complete
    ↓
Send notification to frontend
    ↓
Update UI with download status
    ↓
Display success message
    ↓
Add song to user's library
    ↓
Show "Downloaded" badge next to song
```

## Download Process Flow

```
┌─────────────────────────────────────┐
│    User Clicks "Download"           │
│    (From search or library)         │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│    SpotSync Job Created             │
│    (Added to queue)                 │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│    Download Manager Processes Job   │
│    • Search source                  │
│    • Fetch audio stream             │
│    • Handle errors/retry            │
└────────────┬────────────────────────┘
             │ Success?
        ┌────┴────┐
        │         │
       Yes        No
        │         │
        ↓         ↓
     Process   Retry Logic
      Audio    (Max 3x)
        │         │
        └────┬────┘
             │
             ↓
┌─────────────────────────────────────┐
│    Audio Processor                  │
│    • Convert format                 │
│    • Normalize audio                │
│    • Extract metadata               │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│    Save to File System              │
│    (downloaded-songs/all-songs/)    │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│    Update Database                  │
│    (Add song to library)            │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│    Notify User                      │
│    (Success message)                │
└─────────────────────────────────────┘
```

## Configuration Files

### config.py
```
Handles:
├── API credentials (Spotify, YouTube)
├── Download source preferences
├── Audio quality settings
├── Output directory paths
├── Timeout values
└── Processing parameters
```

### .env File
```
Contains:
├── SPOTIFY_CLIENT_ID
├── SPOTIFY_CLIENT_SECRET
├── YOUTUBE_API_KEY
├── OUTPUT_DIR
├── DOWNLOAD_QUALITY
└── MAX_RETRIES
```

## Retry & Error Handling

### retry_utils.py Features

**Retry Strategy:**
- Maximum 3 retry attempts
- Exponential backoff (1s, 2s, 4s)
- Handles network timeouts
- Handles API errors
- Graceful degradation

**Error Types Handled:**
```
├── Network errors (connection timeout)
├── API errors (rate limit, invalid credentials)
├── File errors (write permission, disk space)
├── Audio errors (corrupted file, unsupported format)
└── Metadata errors (unable to extract info)
```

**Retry Flow:**
```
Attempt 1
    ↓ Failed
Attempt 2 (Wait 1 second)
    ↓ Failed
Attempt 3 (Wait 2 seconds)
    ↓ Failed
Report error to user
```

## Logging System

### logger.py Features

**Log Levels:**
- DEBUG: Detailed download progress
- INFO: Successful operations
- WARNING: Non-critical errors
- ERROR: Download failures
- CRITICAL: System failures

**Logged Information:**
```
├── Download start/end times
├── File sizes
├── Processing duration
├── Success/failure status
├── Retry attempts
├── Error messages
└── Performance metrics
```

## Audio Processing Details

### Supported Input Formats
- MP3
- WAV
- M4A
- FLAC
- OGG

### Output Format
- MP3 (192kbps or configurable)

### Processing Steps

**1. Format Conversion**
```
Original audio format (any)
    ↓
Convert to MP3
    ↓
Apply specified bitrate
    ↓
Output: Converted MP3 file
```

**2. Audio Normalization**
```
Analyze audio levels
    ↓
Calculate normalization factor
    ↓
Apply volume adjustment
    ↓
Prevent clipping/distortion
```

**3. Metadata Extraction**
```
Read audio file tags
    ↓
Extract:
├── Title
├── Artist
├── Album
├── Duration
├── Genre
└── Album art (if present)
```

## Performance Optimization

1. **Parallel Processing**: Download & process multiple songs simultaneously
2. **Quality Levels**: User can choose quality (128kbps, 192kbps, 320kbps)
3. **Caching**: Cache converted files to avoid re-processing
4. **Resume Capability**: Resume interrupted downloads from checkpoint
5. **Background Processing**: Downloads happen in background thread

## Storage Management

**Directory Structure:**
```
downloaded-songs/
└── all-songs/
    ├── song1.mp3
    ├── song2.mp3
    ├── song3.mp3
    └── ...more songs
```

**Metadata Storage:**
```
Database entries contain:
├── Song file path
├── Download date
├── Source (Spotify, YouTube, etc)
├── Processing duration
├── File size
└── Audio quality used
```

## Integration with VibAura

**Backend Integration:**
- Express route receives download requests
- Validates song information
- Creates SpotSync task
- Returns job ID to frontend

**Frontend Integration:**
- Download button in search results
- Download button in library
- Progress indicator during download
- Completion notification
- "Downloaded" badge display

## Dependencies

**Python Packages:**
```
requirements.txt contains:
├── spotdl         # Download from Spotify
├── yt-dlp         # Download from YouTube
├── pydub          # Audio processing
├── mutagen        # Metadata handling
└── requests       # HTTP requests
```

## Browser/Platform Compatibility

- Works on Windows, macOS, Linux
- Requires Python 3.8+
- Internet connection required
- Sufficient disk space needed

## Future Enhancements

- [ ] Direct streaming without download
- [ ] Selective quality per download
- [ ] Download queue management UI
- [ ] Scheduled downloads
- [ ] Playlist bulk download
- [ ] Album download with metadata
- [ ] Download verification/integrity check
- [ ] Cloud backup of downloads
- [ ] Download pause/resume UI
