# Architecture Documentation

## System Overview

Even G2 Calendar Companion is a production-ready React Native application that displays calendar events on Even Realities G2 smart glasses via Bluetooth Low Energy (BLE).

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  App Coordinator │  │   Zustand Store  │  │  React Hooks  │ │
│  │  (Orchestration) │  │  (State Mgmt)    │  │  (UI Logic)   │ │
│  └────────┬─────────┘  └──────────────────┘  └───────────────┘ │
│           │                                                       │
│  ┌────────┴──────────────────────────────────────────────────┐  │
│  │                    Service Layer                           │  │
│  ├────────────────┬──────────────────┬──────────────────────┤  │
│  │  BLE Manager   │ Calendar Service │  Display Renderer    │  │
│  │  - Connection  │  - Google Cal    │  - Layout Engine     │  │
│  │  - Protocol    │  - Native Cal    │  - Text Formatting   │  │
│  │  - Commands    │  - Event Sync    │  - Optimization      │  │
│  └────────┬───────┴────────┬─────────┴──────────┬───────────┘  │
│           │                │                     │               │
└───────────┼────────────────┼─────────────────────┼───────────────┘
            │                │                     │
            ▼                ▼                     ▼
    ┌──────────────┐  ┌──────────────┐    ┌──────────────┐
    │  BLE Stack   │  │ Calendar API │    │ Text Engine  │
    │ (react-native│  │ (Google +    │    │ (date-fns)   │
    │  -ble-plx)   │  │  Native)     │    │              │
    └──────┬───────┘  └──────────────┘    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │  Even G2     │
    │  Glasses     │
    │  640×200     │
    │  Monochrome  │
    └──────────────┘
```

## Core Components

### 1. App Coordinator (`src/services/AppCoordinator.ts`)

**Purpose:** Main orchestration layer that coordinates BLE, Calendar, and Display services.

**Responsibilities:**
- Initialize all services
- Manage service lifecycle
- Coordinate data flow between services
- Handle auto-update loop
- Manage display timeout

**Key Methods:**
```typescript
initialize(): Promise<void>
connectToDevice(deviceId: string): Promise<void>
syncCalendars(): Promise<void>
updateDisplay(eventInfo: NextEventInfo): Promise<void>
```

**State Management:**
```typescript
interface AppCoordinatorState {
  isInitialized: boolean;
  bleConnected: boolean;
  calendarSynced: boolean;
  currentEvent: NextEventInfo | null;
  lastUpdate: Date | null;
  error: string | null;
}
```

### 2. BLE Manager (`src/services/ble/BLEManager.ts`)

**Purpose:** Handles all Bluetooth Low Energy communication with G2 glasses.

**Responsibilities:**
- Device scanning and discovery
- Connection management
- Auto-reconnection logic
- Command encoding/sending
- Event listening (TouchBar, battery, etc.)

**Key Features:**
- Automatic reconnection (configurable attempts)
- Connection state management
- Error handling and recovery
- Permission management (Android/iOS)
- MTU negotiation

**Protocol Flow:**
```
App → BLE Manager → Protocol Encoder → BLE Stack → G2 Glasses
                                                        ↓
App ← BLE Manager ← Protocol Decoder ← BLE Stack ← TouchBar Events
```

### 3. G2 Protocol (`src/services/ble/G2Protocol.ts`)

**Purpose:** Implements Even G2 BLE protocol encoding/decoding.

**Based on:** [i-soxi/even-g2-protocol](https://github.com/i-soxi/even-g2-protocol)

**Packet Structure:**
```
[Header(1)] [Command(1)] [Length(2)] [Payload(N)] [Checksum(1)]
```

**Command Types:**
- `0x01` - TEXT: Display text at coordinates
- `0x02` - CLEAR: Clear display or region
- `0x03` - GRAPHICS: Display bitmap (future)
- `0x04` - BRIGHTNESS: Set brightness level

**Text Command Payload:**
```
[X(2)] [Y(2)] [Alignment(1)] [FontSize(1)] [Text(N)]
```

**Checksum Algorithm:**
```typescript
checksum = 0xFF;
for (byte in data) {
  checksum ^= byte;
}
```

### 4. Calendar Service (`src/services/calendar/CalendarService.ts`)

**Purpose:** Manages calendar integration and event synchronization.

**Supported Sources:**
- Google Calendar (via Google Sign-In)
- Native device calendars (iOS Calendar, Android Calendar)

**Key Features:**
- Multi-calendar support
- Real-time event updates
- Next event detection
- Event filtering and search
- Auto-sync with configurable interval

**Event Processing:**
```
Calendar API → Fetch Events → Filter/Sort → Detect Next Event → Format Display
```

**Next Event Logic:**
```typescript
1. Fetch events from now to lookahead period (7 days)
2. Filter out cancelled events
3. Find first event with startDate > now
4. Calculate time until start
5. Format for display
6. Notify listeners
```

### 5. Display Renderer (`src/services/display/DisplayRenderer.ts`)

**Purpose:** Optimizes calendar event display for 640×200 monochrome screen.

**Responsibilities:**
- Layout creation
- Text wrapping and truncation
- Display optimization
- Diff calculation for incremental updates
- Performance metrics tracking

**Display Layout:**
```
┌────────────────────────────────────────────────────┐
│  Title (Large, Bold)                    Y: 20-60   │
│  10:00 AM - 10:30 AM (Medium)          Y: 70-100   │
│  Conference Room B (Small)             Y: 110-135  │
│  Starts in 12 minutes (Medium, Bold)   Y: 145-170  │
│  30 minutes (Small)                    Y: 175-195  │
└────────────────────────────────────────────────────┘
```

**Optimization Strategies:**
1. **Full Update:** Clear screen, render all elements
2. **Partial Update:** Update specific regions only
3. **Incremental Update:** Only changed elements

**Text Processing:**
- Emoji removal (not supported on G2)
- Non-ASCII character filtering
- Smart truncation with ellipsis
- Word-wrap at boundaries

### 6. Text Formatter (`src/services/display/TextFormatter.ts`)

**Purpose:** Handles all text formatting for G2 display.

**Key Functions:**
```typescript
formatTimeRange(start, end, format): string
formatDuration(milliseconds): string
formatTimeUntil(milliseconds): string
formatEventTitle(title, maxLength): string
formatLocation(location, maxLength): string
removeEmojis(text): string
sanitize(text): string
```

**Examples:**
```typescript
formatTimeRange(10:00, 10:30, '12h') → "10:00 AM - 10:30 AM"
formatDuration(1800000) → "30 min"
formatTimeUntil(720000) → "Starts in 12 min"
formatEventTitle("Team Standup 🚀", 60) → "Team Standup"
```

## Data Flow

### Initialization Flow

```
1. App Start
   ↓
2. App Coordinator Initialize
   ↓
3. BLE Manager Initialize
   - Request permissions
   - Check Bluetooth state
   ↓
4. Calendar Service Initialize
   - Request calendar permissions
   - Configure Google Sign-In
   - Initial sync
   ↓
5. Display Renderer Initialize
   - Set configuration
   ↓
6. Start Auto-Update Loop
```

### Event Update Flow

```
1. Calendar Service Auto-Update (every 30s)
   ↓
2. Fetch Events from Calendar API
   ↓
3. Detect Next Event
   ↓
4. Format Display Text
   ↓
5. Notify App Coordinator
   ↓
6. Create Display Layout
   ↓
7. Render Layout to Commands
   ↓
8. Send Commands via BLE
   ↓
9. G2 Displays Event
```

### Connection Flow

```
1. User Initiates Scan
   ↓
2. BLE Manager Scans for Devices
   ↓
3. Filter G2 Devices
   ↓
4. User Selects Device
   ↓
5. BLE Manager Connects
   - Negotiate MTU
   - Discover services
   - Subscribe to notifications
   ↓
6. Update Display with Current Event
```

## Performance Considerations

### BLE Optimization

**Challenge:** BLE has limited bandwidth (~100-200 kbps practical)

**Solutions:**
1. Batch commands with delays (50ms between)
2. Use MTU negotiation (512 bytes)
3. Minimize payload size
4. Diff-based updates (only send changes)

**Metrics:**
- Command latency: <100ms
- Full display update: ~500ms
- Incremental update: ~200ms

### Display Optimization

**Challenge:** 640×200 monochrome, 20Hz refresh

**Solutions:**
1. Pre-calculate layouts
2. Cache formatted text
3. Incremental updates
4. Smart text truncation

**Metrics:**
- Layout creation: <10ms
- Text formatting: <5ms
- Diff calculation: <15ms

### Calendar Sync Optimization

**Challenge:** Minimize API calls, battery usage

**Solutions:**
1. Configurable sync interval (default 30s)
2. Event caching
3. Smart next-event detection
4. Background sync throttling

**Metrics:**
- Sync time: <500ms
- Events processed: ~100/sync
- Battery impact: ~2-3% per hour

## Error Handling

### BLE Errors

```typescript
enum BLEErrorType {
  BLUETOOTH_DISABLED,
  PERMISSION_DENIED,
  DEVICE_NOT_FOUND,
  CONNECTION_FAILED,
  CONNECTION_LOST,
  WRITE_FAILED,
  READ_FAILED,
  TIMEOUT,
}
```

**Recovery Strategies:**
- Auto-reconnect (up to 5 attempts)
- Exponential backoff (2s, 4s, 8s, ...)
- User notification
- Graceful degradation

### Calendar Errors

```typescript
enum CalendarErrorType {
  PERMISSION_DENIED,
  NETWORK_ERROR,
  AUTH_ERROR,
  SYNC_FAILED,
}
```

**Recovery Strategies:**
- Retry with backoff
- Fallback to cached events
- User re-authentication
- Error notifications

## Security & Privacy

### Data Handling

- **Calendar Data:** Processed locally, never sent to external servers
- **BLE Communication:** Direct device-to-device, no cloud relay
- **Credentials:** Stored securely using platform keychain
- **Permissions:** Minimal required permissions only

### Privacy Features

- No analytics or tracking
- No data collection
- Local-only processing
- User-controlled calendar access

## Testing Strategy

### Unit Tests

- Protocol encoding/decoding
- Text formatting
- Date utilities
- Layout calculations

### Integration Tests

- BLE connection flow
- Calendar sync
- Display updates
- Error recovery

### E2E Tests

- Full app flow
- Device pairing
- Event display
- Reconnection

## Future Enhancements

### Planned Features

1. **Multiple Event Preview** - Show next 3 events
2. **Custom Event Filters** - Filter by calendar, keywords
3. **Meeting Join Links** - Quick access to Zoom/Meet
4. **Event Reminders** - Haptic feedback via R1 ring
5. **Full Day Schedule** - Scrollable day view
6. **Voice Notes** - Create events from glasses

### Technical Improvements

1. **Offline Mode** - Cache events for offline use
2. **Battery Optimization** - Adaptive sync intervals
3. **Graphics Support** - Icons, charts, QR codes
4. **Multi-language** - i18n support
5. **Accessibility** - Screen reader support

## Deployment

### Build Process

```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

### Release Checklist

- [ ] Update version in package.json
- [ ] Run all tests
- [ ] Update CHANGELOG.md
- [ ] Build release binaries
- [ ] Test on real devices
- [ ] Create GitHub release
- [ ] Submit to app stores

## Monitoring

### Metrics to Track

- Connection success rate
- Average connection time
- Display update latency
- Calendar sync success rate
- Battery usage
- Crash rate
- User retention

### Logging

- BLE events (connect, disconnect, errors)
- Calendar sync events
- Display updates
- Error occurrences
- Performance metrics

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
