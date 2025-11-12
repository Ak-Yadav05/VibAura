# Theme Management Documentation

## Overview
The Theme Management feature enables users to customize the visual appearance of VibAura with different color schemes. It provides light and dark themes with the ability to switch between them seamlessly and persist user preference.

## Key Features

### 1. **Multiple Themes**
- Light theme (bright colors, white background)
- Dark theme (dark colors, dark background)
- System preference detection
- Custom theme support (future)

### 2. **Theme Switching**
- One-click theme toggle
- Smooth transitions between themes
- Instant UI update across entire app
- No page reload required

### 3. **Preference Persistence**
- Save user's theme choice
- Restore on next visit
- LocalStorage for client-side persistence
- Auto-apply saved theme on app load

### 4. **System Detection**
- Detect OS dark mode preference
- Auto-apply matching theme
- Override with manual selection
- Respect user's system settings

### 5. **Visual Consistency**
- Consistent colors across all pages
- Accessible color contrast in both themes
- Smooth theme transitions
- No layout changes with theme switch

## Architecture

```
┌──────────────────────────────────────┐
│      Theme Manager (UI)              │
│   (themeManager.js)                  │
│   - Toggle button in header           │
│   - Theme preference selector         │
└────────────┬─────────────────────────┘
             │ Theme change request
             ↓
┌──────────────────────────────────────┐
│      Theme Controller                │
│   (JavaScript logic)                 │
│   - Apply theme to DOM               │
│   - Update CSS variables             │
│   - Save preference                  │
└────────────┬─────────────────────────┘
             │ Update appearance
             ↓
┌──────────────────────────────────────┐
│      CSS Theme Styles                │
│   - Light theme colors               │
│   - Dark theme colors                │
│   - CSS custom properties            │
└────────────┬─────────────────────────┘
             │ Apply styles
             ↓
┌──────────────────────────────────────┐
│      Browser Rendering               │
│   (Visual output)                    │
└──────────────────────────────────────┘
```

## Component Structure

```
Theme Management Files:
├── frontend/scripts/ui/themeManager.js  # Main theme controller
├── frontend/css/base/base.css           # CSS custom properties
├── frontend/css/desktop.css             # Desktop theme styles
├── frontend/css/mobile.css              # Mobile theme styles
└── frontend/public/index.html           # Theme attribute on body
```

## Theme Workflow

### 1. App Initialization
```
VibAura loads
    ↓
Check for saved theme preference (localStorage)
    ↓
If found → Apply saved theme
    ↓
If not found → Detect system preference
    ↓
Apply detected/default theme
    ↓
Set theme attribute on document
    ↓
Load appropriate CSS variables
    ↓
App displays with theme
```

### 2. User Toggles Theme
```
User clicks theme toggle button
    ↓
themeManager detects click event
    ↓
Determine new theme (opposite of current)
    ↓
Update document attribute (data-theme)
    ↓
CSS custom properties apply new colors
    ↓
All elements update instantly
    ↓
Save new theme to localStorage
    ↓
Show visual feedback (animation)
```

### 3. System Preference Detection
```
App starts for first time
    ↓
Check localStorage for theme
    ↓
If no saved preference → Check system
    ↓
Use window.matchMedia('(prefers-color-scheme: dark)')
    ↓
System is in dark mode? → Apply dark theme
    ↓
System is in light mode? → Apply light theme
    ↓
Listen for system preference changes
    ↓
Auto-update if system preference changes
```

### 4. Manual Theme Override
```
User opens theme preferences
    ↓
Select desired theme (light/dark)
    ↓
Save preference to localStorage
    ↓
Apply theme immediately
    ↓
Stop listening to system preference
    ↓
Use user's manual choice going forward
```

## User Interaction Flow

```
┌──────────────────────────────────────┐
│    App Loads                         │
│    (Check saved theme)               │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    Display with Applied Theme        │
│    • Light: bright colors            │
│    • Dark: dark colors               │
└────────────┬─────────────────────────┘
             │ User interacts
             ├─→ Click theme toggle
             ├─→ Select from menu
             └─→ Open preferences
             │
             ↓
┌──────────────────────────────────────┐
│    Update Theme                      │
│    • Change colors instantly         │
│    • Animate transition              │
│    • Save preference                 │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│    New Theme Applied                 │
│    • All UI updated                  │
│    • Preference saved                │
│    • Ready for next interaction      │
└──────────────────────────────────────┘
```

## Theme Structure

### Light Theme Colors
```
Primary Colors:
├── Background: #FFFFFF (white)
├── Text: #1a1a1a (dark gray)
├── Accent: #667eea (purple)
└── Secondary: #764ba2 (dark purple)

Component Colors:
├── Header background: #FFFFFF
├── Header text: #1a1a1a
├── Player background: Linear gradient
├── Button background: #667eea
└── Border color: #E0E0E0

Status Colors:
├── Success: #4CAF50 (green)
├── Error: #f44336 (red)
├── Warning: #FF9800 (orange)
└── Info: #2196F3 (blue)
```

### Dark Theme Colors
```
Primary Colors:
├── Background: #121212 (dark)
├── Text: #FFFFFF (white)
├── Accent: #667eea (purple)
└── Secondary: #764ba2 (dark purple)

Component Colors:
├── Header background: #1a1a1a
├── Header text: #FFFFFF
├── Player background: Linear gradient (darkened)
├── Button background: #667eea
└── Border color: #333333

Status Colors:
├── Success: #66BB6A (lighter green)
├── Error: #EF5350 (lighter red)
├── Warning: #FFA726 (lighter orange)
└── Info: #42A5F5 (lighter blue)
```

## CSS Custom Properties (Variables)

### Light Theme
```css
:root[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --border-color: #E0E0E0;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### Dark Theme
```css
:root[data-theme="dark"] {
  --bg-primary: #121212;
  --bg-secondary: #1a1a1a;
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --border-color: #333333;
  --shadow: 0 2px 8px rgba(0,0,0,0.5);
}
```

### Usage in CSS
```css
.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}
```

## Theme Manager Implementation

### Detection Method
```
1. Check localStorage for saved theme
2. If not saved:
   - Use window.matchMedia('(prefers-color-scheme: dark)')
   - Detect system preference
   - Apply matching theme
3. If saved:
   - Apply saved theme immediately
   - Ignore system preference
```

### Toggle Mechanism
```
1. Get current theme from DOM
2. Determine opposite theme
3. Update data-theme attribute
4. Update CSS variables
5. Save new theme to localStorage
6. Trigger transition animation
```

### Persistence Strategy
```
localStorage.setItem('viberaura-theme', 'dark');

On app load:
const savedTheme = localStorage.getItem('viberaura-theme');
if (savedTheme) applyTheme(savedTheme);
```

## Transition & Animation

### Smooth Theme Transition
```
CSS:
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}

Result:
- Colors smoothly fade to new theme
- No jarring visual changes
- Professional appearance
- User appreciates the polish
```

### Transition Duration
```
Fast transitions: 200ms (subtle, responsive)
Medium transitions: 300ms (noticeable, smooth)
Slow transitions: 500ms (dramatic effects)

Recommended for theme: 300ms-400ms
```

## System Preference Integration

### Detect System Dark Mode
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) {
  applyTheme('dark');
} else {
  applyTheme('light');
}
```

### Listen for System Changes
```javascript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (e.matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
});
```

## Mobile Theme Experience

**Mobile Features:**
- Toggle button in header
- Responsive theme menu
- Touch-friendly toggle
- Instant apply on selection
- No modal dialogs

**Files:**
- `frontend/css/responsive/mobile-header.css`
- `frontend/scripts/mobile/mobile.js`

## Theme Data Storage

```
LocalStorage Key: 'vibaura-theme'
LocalStorage Value: 'light' | 'dark'

Session Data:
├── Current theme
├── Preference type (manual | system)
└── Last updated timestamp
```

## Accessibility Considerations

### WCAG Contrast Requirements
```
Light Theme:
├── Text on background: 4.5:1 contrast (AA)
├── Large text: 3:1 contrast (AA)
└── Buttons/controls: 3:1 contrast (AA)

Dark Theme:
├── Text on background: 4.5:1 contrast (AA)
├── Large text: 3:1 contrast (AA)
└── Buttons/controls: 3:1 contrast (AA)

Both themes meet WCAG AA standards
```

### Prefers Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

## Browser Compatibility

- All modern browsers support CSS custom properties
- LocalStorage supported on all browsers
- window.matchMedia() supported on modern browsers
- Fallback: default to light theme if no support

## Performance Optimization

1. **CSS Variables**: Instant color changes without repainting all elements
2. **No DOM Changes**: Only CSS properties update
3. **Minimal JS Execution**: Simple attribute updates
4. **Cached Preference**: No server request needed

## Event Handling

The theme system responds to:
- **Click events**: Theme toggle button
- **Change events**: Theme selection dropdown
- **System preference changes**: matchMedia listener
- **App load**: Initialize from localStorage

## Theme Testing

**Test Scenarios:**
```
1. First visit (no saved theme)
   → System preference auto-applied
   
2. Toggle theme
   → Saves preference
   
3. Reload page
   → Loads saved preference
   
4. Change system preference
   → Auto-update if manual not saved
   
5. All components visible and readable in both themes
   → Color contrast verified
```

## Future Enhancements

- [ ] Additional themes (sepia, high contrast)
- [ ] Custom color picker
- [ ] Per-component theme customization
- [ ] Theme scheduler (auto-switch by time)
- [ ] Gradient theme options
- [ ] Animated theme transitions
- [ ] Theme preview before applying
