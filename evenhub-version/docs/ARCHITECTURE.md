# Architecture Documentation - Calendar Companion (Even Hub SDK)

**Deep dive into the technical architecture and design decisions**

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Design](#component-design)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Display System](#display-system)
7. [Event Handling](#event-handling)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

---

## Overview

### Design Philosophy

Calendar Companion is built on these principles:

1. **Simplicity** - Do one thing well: show next calendar event
2. **Reliability** - Handle errors gracefully, never crash
3. **Performance** - Minimize battery drain, optimize updates
4. **User Experience** - Clean display, intuitive controls
5. **Maintainability** - Clear code structure, comprehensive types

### Technology Choices

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **TypeScript** | Type safety | Catch errors at compile time |
| **Vite** | Build tool | Fast dev server, optimized builds |
| **Even Hub SDK** | G2 integration | Official support, high-level API |
| **Google Calendar API** | Data source | Widely used, well-documented |
| **date-fns** | Date handling | Lightweight, tree-shakeable |
| **Custom Store** | State management | Simple, no external dependencies |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Web App)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Calendar   │  │    Store     │  │   Display    │      │
│  │   Service    │  │  (State Mgmt)│  │   Composer   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                          │                                   │
│                 ┌────────┴────────┐                         │
│                 │  Even Hub Bridge │                         │
│                 └────────┬────────┘                         │
└──────────────────────────┼──────────────────────────────────┘
                           │ Even Hub SDK
                           ▼
                ┌──────────────────────┐
                │   Even Hub App       │
                │   (Phone)            │
                └──────────┬───────────┘
                           │ Bluetooth LE
                           ▼
                ┌──────────────────────┐
                │   Even G2 Glasses    │
                │   640×350 @ 60Hz     │
                └──────────────────────┘
```

### Component Layers

**Layer 1: Services** (External Integration)
- `CalendarService` - Google Calendar API
- `EvenHubBridge` - Even Hub SDK wrapper

**Layer 2: State** (Application Logic)
- `Store` - State management
- `EventMapper` - Input handling

**Layer 3: Presentation** (Display Logic)
- `DisplayComposer` - Layout and formatting
- `FormatUtils` - Text formatting

**Layer 4: Application** (Orchestration)
- `App` - Main application coordinator
- `Main` - Entry point

---

## Component Design

### CalendarService

**Purpose:** Fetch calendar events from Google Calendar

**Responsibilities:**
- Initialize Google Calendar API
- Handle OAuth 2.0 authentication
- Fetch upcoming events
- Parse Google event format to our format

**Key Methods:**
```typescript
class CalendarService {
  async init(): Promise<void>
  async signIn(): Promise<void>
  async getUpcomingEvents(maxResults: number): Promise<CalendarEvent[]>
  async getNextEvent(): Promise<CalendarEvent | null>
  signOut(): void
}
```

**Design Decisions:**
- Uses gapi and gis libraries (loaded dynamically)
- Handles token refresh automatically
- Converts Google format to our CalendarEvent type
- Supports only primary calendar (simplicity)

### EvenHubBridge

**Purpose:** Communicate with Even Hub SDK

**Responsibilities:**
- Initialize Even Hub SDK
- Setup display containers
- Update text and images
- Handle SDK events
- Manage image queue

**Key Methods:**
```typescript
class EvenHubBridge {
  async init(): Promise<void>
  async setupPage(container: CreateStartUpPageContainer): Promise<boolean>
  async updateText(id: number, name: string, content: string): Promise<boolean>
  async updateImage(data: ImageRawDataUpdate): Promise<void>
  subscribeEvents(handler: EvenHubEventHandler): () => void
  async shutdown(): Promise<void>
}
```

**Design Decisions:**
- Wraps SDK for easier testing and error handling
- Queues images for serial sending (SDK requirement)
- Provides status methods for debugging
- Graceful degradation when SDK unavailable

### Store

**Purpose:** Manage application state

**Responsibilities:**
- Hold current state
- Process actions
- Notify subscribers of changes
- Implement reducer pattern

**State Structure:**
```typescript
interface AppState {
  phase: AppPhase                    // Current app phase
  nextEvent: CalendarEvent | null    // Next upcoming event
  upcomingEvents: CalendarEvent[]    // All upcoming events
  syncStatus: CalendarSyncStatus     // Sync state
  settings: CalendarSettings         // User settings
  selectedEventIndex: number         // UI state
  menuSelectedIndex: number          // UI state
  showDebugInfo: boolean             // Debug flag
  error: string | null               // Error state
  lastUpdateTime: Date | null        // Last sync time
  appStartTime: Date                 // App start time
}
```

**Design Decisions:**
- Redux-like pattern (familiar, predictable)
- Immutable state updates
- Synchronous reducer (simple, testable)
- No middleware (keep it simple)

### DisplayComposer

**Purpose:** Format calendar data for G2 display

**Responsibilities:**
- Create container configurations
- Format text for display
- Handle different app phases
- Optimize for monochrome display

**Layout Strategy:**
```
┌─────────────────────────────────────────────────┐
│  Branding (200×24)                              │
├─────────────────────────┬───────────────────────┤
│ Text Area (376×288)     │ Image Area (200×200)  │
│                         │                       │
│ ╔═══════════════════╗   │                       │
│ ║   NEXT EVENT      ║   │                       │
│ ╚═══════════════════╝   │                       │
│                         │                       │
│ Event Title             │                       │
│                         │                       │
│ ⏰ Time Range           │                       │
│ 📍 Location             │                       │
│                         │                       │
│ ⏳ Time Until           │                       │
│ ⌛ Duration             │                       │
│                         │                       │
│ ━━━━━━━━━━━━━━━━━━━━━  │                       │
│ Updated: 2:30 PM        │                       │
└─────────────────────────┴───────────────────────┘
```

**Design Decisions:**
- Left side for text (more space)
- Right side for optional graphics
- Top center for branding
- ASCII art for visual hierarchy
- Truncate text to fit display
- Remove emojis (monochrome display)

### EventMapper

**Purpose:** Map SDK events to application actions

**Responsibilities:**
- Handle scroll events
- Handle tap events
- Handle double-tap events
- Implement tap cooldown
- Context-aware mapping

**Event Mapping:**
```typescript
// Idle Phase
Scroll Down → Open Menu
Tap → Refresh
Double-Tap → Open Menu

// Menu Phase
Scroll Up/Down → Navigate
Tap → Select
Double-Tap → Back

// Settings Phase
Scroll Up/Down → Navigate
Tap → Toggle Setting
Double-Tap → Back
```

**Design Decisions:**
- Tap cooldown prevents accidental inputs
- Longer cooldown in menu (500ms vs 300ms)
- Context-aware (different behavior per phase)
- Extensible for future gestures

---

## Data Flow

### Initialization Flow

```
1. main.ts
   ↓
2. app.ts → initApp()
   ↓
3. Create Store
   ↓
4. Initialize EvenHubBridge
   ↓
5. Initialize CalendarService
   ↓
6. Sign in to Google Calendar
   ↓
7. Setup Even Hub page
   ↓
8. Subscribe to events
   ↓
9. Initial calendar sync
   ↓
10. Start auto-sync interval
    ↓
11. Dispatch INIT_SUCCESS
```

### Sync Flow

```
1. Timer triggers OR user taps refresh
   ↓
2. Dispatch SYNC_START
   ↓
3. Store updates phase to 'syncing'
   ↓
4. Display shows "Syncing..."
   ↓
5. CalendarService.getUpcomingEvents()
   ↓
6. Google Calendar API request
   ↓
7. Parse events
   ↓
8. Dispatch SYNC_SUCCESS with events
   ↓
9. Store updates:
   - upcomingEvents
   - nextEvent (first upcoming)
   - syncStatus
   - lastUpdateTime
   ↓
10. Display updates with new event
```

### User Input Flow

```
1. User scrolls/taps on G2
   ↓
2. Even Hub SDK emits event
   ↓
3. EvenHubBridge receives event
   ↓
4. EventMapper maps to action
   ↓
5. Store.dispatch(action)
   ↓
6. Reducer processes action
   ↓
7. State updates
   ↓
8. Subscribers notified
   ↓
9. App handles state change
   ↓
10. Display updates
```

### Display Update Flow

```
1. State changes
   ↓
2. Store notifies subscribers
   ↓
3. App.handleStateChange()
   ↓
4. Check if display needs update
   ↓
5. DisplayComposer.formatDisplayText()
   ↓
6. EvenHubBridge.updateText()
   ↓
7. Even Hub SDK sends to glasses
   ↓
8. G2 display updates
```

---

## State Management

### State Phases

```typescript
type AppPhase = 
  | 'loading'      // Initial load
  | 'idle'         // Normal operation
  | 'syncing'      // Fetching events
  | 'error'        // Error occurred
  | 'menu'         // Menu open
  | 'settings'     // Settings open
  | 'eventDetails' // Event details view
```

### Phase Transitions

```
loading → idle (init success)
loading → error (init failed)

idle → syncing (refresh triggered)
idle → menu (double-tap or scroll down)
idle → error (sync failed)

syncing → idle (sync success)
syncing → error (sync failed)

menu → idle (back or select exit)
menu → settings (select settings)
menu → eventDetails (select view all)

settings → idle (back)
eventDetails → idle (back)

error → idle (clear error)
```

### Action Types

```typescript
// Initialization
INIT_SUCCESS
INIT_ERROR

// Sync
SYNC_START
SYNC_SUCCESS
SYNC_ERROR

// Navigation
NAVIGATE_UP
NAVIGATE_DOWN
SELECT
BACK

// Menu
OPEN_MENU
CLOSE_MENU

// Settings
OPEN_SETTINGS
CLOSE_SETTINGS
UPDATE_SETTING

// Misc
TOGGLE_DEBUG
CLEAR_ERROR
REFRESH
UPDATE_NEXT_EVENT
```

---

## Display System

### Container System

Even Hub SDK uses containers for layout:

```typescript
// Text Container
{
  xPosition: 0,
  yPosition: 0,
  width: 376,
  height: 288,
  containerID: 1,
  containerName: 'calendar-display',
  content: '...',
  isEventCapture: 1  // Receives events
}

// Image Container
{
  xPosition: 376,
  yPosition: 44,
  width: 200,
  height: 200,
  containerID: 2,
  containerName: 'calendar-icon'
}
```

### Text Formatting

**Challenges:**
- Monochrome display (no colors)
- Limited space (376px width)
- No custom fonts
- ASCII-only characters

**Solutions:**
- Use ASCII art for visual hierarchy
- Truncate long text with ellipsis
- Remove emojis and special characters
- Use symbols (⏰📍⏳⌛) sparingly
- Clear section separators (━━━)

### Display Optimization

**Techniques:**
1. **Debouncing** - Coalesce rapid state changes
2. **Dirty Checking** - Only update when content changes
3. **Lazy Updates** - Skip updates during transitions
4. **Text Caching** - Reuse formatted strings

---

## Event Handling

### Input Events

Even Hub SDK provides:
- `scroll` - R1 ring rotation or touchpad swipe
- `tap` - Single tap
- `double_tap` - Double tap

### Tap Cooldown

Prevents accidental double inputs:

```typescript
let lastTapTime = 0
const TAP_COOLDOWN_MS = 300
const TAP_COOLDOWN_MENU_MS = 500

if (now - lastTapTime < cooldown) {
  return null  // Ignore tap
}
lastTapTime = now
```

### Context-Aware Mapping

Same gesture, different action based on phase:

```typescript
function handleDoubleTap(state: AppState) {
  switch (state.phase) {
    case 'idle':
      return { type: 'OPEN_MENU' }
    case 'menu':
    case 'settings':
      return { type: 'BACK' }
    case 'error':
      return { type: 'CLEAR_ERROR' }
  }
}
```

---

## Error Handling

### Error Categories

1. **Initialization Errors**
   - Even Hub SDK not available
   - Google Calendar API failed
   - Network issues

2. **Runtime Errors**
   - Sync failures
   - API rate limits
   - Network timeouts

3. **User Errors**
   - Invalid credentials
   - Permission denied
   - No calendar access

### Error Recovery

```typescript
try {
  await syncCalendar()
} catch (err) {
  console.error('Sync failed:', err)
  store.dispatch({ 
    type: 'SYNC_ERROR', 
    error: err.message 
  })
  // Display error screen
  // User can retry with tap
}
```

### Graceful Degradation

- SDK unavailable → Show error, allow browser testing
- Sync failed → Show last known event
- No events → Show "No upcoming events"
- Network offline → Use cached data (future feature)

---

## Performance Optimization

### Battery Optimization

**Strategies:**
1. **Efficient Sync** - Only fetch when needed
2. **Debounced Updates** - Batch display updates
3. **Lazy Rendering** - Skip unnecessary renders
4. **Smart Intervals** - Adjust sync frequency

**Estimated Battery Usage:**
- Sync every 30s: ~2-3% per hour (phone)
- Display updates: Minimal (handled by Even Hub)
- Total: ~5-6% per hour combined

### Network Optimization

**Strategies:**
1. **Minimal Requests** - Fetch only upcoming events
2. **Request Caching** - Use Calendar API caching
3. **Batch Operations** - Combine multiple updates
4. **Compression** - Gzip responses (automatic)

### Memory Optimization

**Strategies:**
1. **Limited Event Storage** - Max 10 events
2. **String Interning** - Reuse common strings
3. **Cleanup** - Remove old event listeners
4. **Lazy Loading** - Load libraries on demand

---

## Security Considerations

### OAuth 2.0 Security

**Best Practices:**
- Use HTTPS in production
- Validate redirect URIs
- Implement CSRF protection
- Rotate API keys regularly
- Limit OAuth scopes

### Data Privacy

**Principles:**
- Minimal data collection
- No event data stored locally
- No analytics or tracking
- Calendar data stays in memory
- Clear data on sign-out

### API Key Protection

**Measures:**
- Environment variables (not in code)
- Restrict API key to Calendar API only
- Add HTTP referrer restrictions
- Monitor API usage
- Revoke compromised keys immediately

---

## Future Enhancements

### Planned Features

1. **Offline Mode**
   - Cache events locally
   - IndexedDB storage
   - Sync when online

2. **Multiple Calendars**
   - Support multiple Google accounts
   - Calendar selection in settings
   - Merged event view

3. **Notifications**
   - Event reminders
   - Upcoming event alerts
   - Custom notification times

4. **Advanced Display**
   - Custom themes
   - Layout options
   - Image/icon support

5. **Voice Commands**
   - "Show next event"
   - "Refresh calendar"
   - "Open settings"

---

## Conclusion

Calendar Companion demonstrates:
- Clean architecture with clear separation of concerns
- Effective use of Even Hub SDK
- Robust error handling and recovery
- Performance-optimized design
- Security-conscious implementation

The architecture is designed to be:
- **Maintainable** - Clear code structure
- **Extensible** - Easy to add features
- **Testable** - Isolated components
- **Reliable** - Comprehensive error handling
- **Performant** - Optimized for battery and network

---

**Questions or suggestions?**

Open an issue or discussion on GitHub!
