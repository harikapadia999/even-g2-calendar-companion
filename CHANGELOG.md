# Changelog

All notable changes to Even G2 Calendar Companion will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-12

### Added

#### Core Features
- **BLE Communication** - Complete Bluetooth Low Energy implementation for Even G2
  - Device scanning and discovery
  - Connection management with auto-reconnect
  - Protocol encoder/decoder based on reverse-engineered specs
  - TouchBar event listening
  - Battery level monitoring
  - Firmware version detection

- **Calendar Integration** - Multi-source calendar support
  - Google Calendar API integration
  - Native device calendar support (iOS Calendar, Android Calendar)
  - Real-time event synchronization
  - Next event detection algorithm
  - Multi-calendar selection
  - Event filtering and search

- **Display Rendering** - Optimized for 640×200 monochrome display
  - Smart text formatting and truncation
  - Layout engine for calendar events
  - Emoji removal and text sanitization
  - Incremental display updates
  - Performance metrics tracking
  - Display timeout management

- **App Coordinator** - Main orchestration layer
  - Service lifecycle management
  - Auto-update loop (30s interval)
  - Error handling and recovery
  - State management

#### User Interface
- Device scanning and pairing UI
- Next event display card
- Connection status indicator
- Calendar sync controls
- Error notifications
- Loading states

#### Documentation
- Comprehensive README with features and setup
- Architecture documentation (ARCHITECTURE.md)
- BLE protocol specification (BLE_PROTOCOL.md)
- Setup guide (SETUP.md)
- Contributing guidelines (CONTRIBUTING.md)
- Code comments and JSDoc

#### Developer Experience
- TypeScript throughout
- Strict type checking
- Modular architecture
- Singleton service pattern
- Event-driven communication
- Environment configuration
- Example .env file

### Technical Details

#### BLE Protocol
- Packet structure: Header(1) + Command(1) + Length(2) + Payload(N) + Checksum(1)
- Commands: TEXT, CLEAR, GRAPHICS, BRIGHTNESS
- XOR checksum validation
- MTU negotiation (512 bytes)
- Service/Characteristic UUIDs documented

#### Calendar Service
- 30-second sync interval (configurable)
- 7-day lookahead window
- Event caching
- Timezone handling
- All-day event support
- Recurring event support

#### Display Optimization
- Text wrapping at word boundaries
- Smart truncation with ellipsis
- Diff-based updates
- Region-specific clearing
- Font size optimization (14-32px)
- Layout presets for calendar events

#### Performance
- BLE command latency: <100ms
- Full display update: ~500ms
- Incremental update: ~200ms
- Calendar sync: <500ms
- Battery impact: ~2-3% per hour (phone)

### Dependencies

#### Core
- react-native: 0.73.2
- react: 18.2.0
- typescript: 5.3.3

#### BLE
- react-native-ble-plx: 3.1.2

#### Calendar
- @react-native-google-signin/google-signin: 11.0.0
- react-native-calendar-events: 2.2.0

#### State & Utils
- zustand: 4.5.0
- date-fns: 3.3.1
- react-native-permissions: 4.1.0

### Platform Support
- iOS 13+
- Android 8+ (API Level 26+)
- Even Realities G2 smart glasses

### Known Limitations
- Monochrome display only (no color)
- 20Hz refresh rate (no smooth animations)
- BLE bandwidth ~100-200 kbps
- No command acknowledgments from G2
- Protocol may change with firmware updates

### Security & Privacy
- Local-only calendar processing
- Direct BLE communication (no cloud)
- Minimal permissions requested
- No analytics or tracking
- Secure credential storage

## [Unreleased]

### Planned Features
- [ ] Multiple event preview (next 3 events)
- [ ] Custom event filters
- [ ] Meeting join links (Zoom, Meet, Teams)
- [ ] Event reminders with haptic feedback
- [ ] Full day schedule view
- [ ] Voice notes to calendar
- [ ] Offline mode with event caching
- [ ] Battery optimization (adaptive sync)
- [ ] Graphics support (icons, QR codes)
- [ ] Multi-language support (i18n)
- [ ] Accessibility features

### Planned Improvements
- [ ] Unit test coverage >80%
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance profiling
- [ ] Memory optimization
- [ ] Better error messages
- [ ] Onboarding tutorial
- [ ] Settings screen
- [ ] Dark mode support

## Version History

### Version Numbering

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### Release Schedule

- **Patch releases:** As needed for critical bugs
- **Minor releases:** Monthly for new features
- **Major releases:** Quarterly for significant changes

## Migration Guides

### Upgrading to 1.0.0

This is the initial release. No migration needed.

## Deprecation Notices

None currently.

## Breaking Changes

None currently.

## Contributors

- **Hari Kapadia** ([@harikapadia999](https://github.com/harikapadia999)) - Initial development

## Acknowledgments

- [i-soxi/even-g2-protocol](https://github.com/i-soxi/even-g2-protocol) - Reverse-engineered G2 BLE protocol
- Even Realities - For building amazing AR glasses
- React Native community - For excellent tooling and libraries

## Support

- **Issues:** [GitHub Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- **Discussions:** [GitHub Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- **Email:** harikapadia99@gmail.com

---

**Note:** This project is unofficial and not affiliated with Even Realities. The BLE protocol is reverse-engineered and may change with firmware updates.
