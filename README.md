# Even G2 Calendar Companion 📅

**Production-ready architecture for Even Realities G2 smart glasses calendar integration**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.73-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6.svg)
![Status](https://img.shields.io/badge/status-architecture--complete-yellow.svg)

## ⚠️ IMPORTANT: Project Status

### What This Repository Contains

This is a **complete, production-grade ARCHITECTURE** for building a G2 calendar app, NOT a ready-to-run application.

**✅ What's Complete:**
- Full TypeScript architecture and type definitions
- BLE protocol implementation (encoder/decoder logic)
- Calendar service integration patterns
- Display rendering algorithms (optimized for 640×350)
- App coordinator and service orchestration
- Comprehensive documentation (10,000+ words)
- React Native project configuration files
- iOS/Android setup templates

**❌ What's Missing (You Must Provide):**
- **Real G2 BLE UUIDs** - Placeholders need replacement with actual UUIDs from your G2
- **React Native project initialization** - Run `npx react-native init` first
- **Google Calendar credentials** - Configure OAuth in `.env`
- **Testing on real hardware** - Validate protocol with actual G2 glasses

### Why It's Built This Way

**I don't have G2 hardware**, so I can't:
- Discover actual BLE service/characteristic UUIDs
- Test the protocol implementation
- Validate display commands
- Verify screen dimensions in practice

**What I CAN provide:**
- Enterprise-grade architecture
- Production patterns and best practices
- Complete implementation blueprint
- Comprehensive documentation

Think of this as **architectural drawings for a house** - complete and detailed, but you still need to build it.

## 🎯 Actual G2 Specifications

**CORRECTED SPECS** (from official Even Realities documentation):

- **Resolution:** 640×**350** pixels (NOT 640×200!)
- **Refresh Rate:** **60Hz** (NOT 20Hz!)
- **Brightness:** 1200 nits (auto-adjusting)
- **Display:** Green Micro-LED with waveguides
- **Field of View:** 27.5° binocular
- **Passthrough:** 98% transparency
- **Bluetooth:** BLE 5.4
- **Optical System:** HAO 2.0 (Holistic Adaptive Optics)

## 🚀 Quick Start (For Developers with G2 Hardware)

### Prerequisites

- Node.js 18+
- React Native development environment
- **Even Realities G2 smart glasses** (required!)
- iOS 13+ or Android 8+ device
- nRF Connect app (for UUID discovery)

### Step 1: Clone and Initialize

```bash
git clone https://github.com/harikapadia999/even-g2-calendar-companion.git
cd even-g2-calendar-companion
git checkout complete-rn-project

# Initialize React Native project
npx react-native init EvenG2Calendar --template react-native-template-typescript

# Copy architecture files
cp -r src EvenG2Calendar/
cp -r docs EvenG2Calendar/
cp App.tsx EvenG2Calendar/
cp package.json EvenG2Calendar/
cp tsconfig.json EvenG2Calendar/
cp babel.config.js EvenG2Calendar/
cp metro.config.js EvenG2Calendar/

cd EvenG2Calendar
npm install
```

### Step 2: Discover G2 BLE UUIDs

**CRITICAL:** You MUST discover real UUIDs from your G2 device.

1. **Read the guide:** `docs/G2_BLE_UUID_DISCOVERY.md`
2. **Use nRF Connect app** to scan your G2
3. **Document all service/characteristic UUIDs**
4. **Update** `src/types/ble.types.ts` with real UUIDs

**Example:**
```typescript
// src/types/ble.types.ts
export const G2_UUIDS = {
  DISPLAY_SERVICE: 'YOUR_DISCOVERED_UUID_HERE',
  TEXT_CHARACTERISTIC: 'YOUR_DISCOVERED_UUID_HERE',
  // ... etc
};
```

### Step 3: Configure Google Calendar

```bash
cp .env.example .env
# Edit .env with your Google OAuth credentials
```

Get credentials from: https://console.cloud.google.com

### Step 4: Platform Setup

**iOS:**
```bash
cd ios
pod install
cd ..
```

**Android:**
- Copy `android/app/src/main/AndroidManifest.xml.template` to `AndroidManifest.xml`
- Update with your package name

### Step 5: Run

```bash
# iOS
npm run ios

# Android
npm run android
```

### Step 6: Test and Iterate

1. Connect to your G2 glasses
2. Test basic BLE connection
3. Try simple display commands
4. Validate protocol implementation
5. Iterate based on results

## 📚 Documentation

### Essential Reading

1. **[G2 BLE UUID Discovery](docs/G2_BLE_UUID_DISCOVERY.md)** - How to find real UUIDs
2. **[Setup Guide](docs/SETUP.md)** - Complete installation instructions
3. **[Architecture](docs/ARCHITECTURE.md)** - System design and patterns
4. **[BLE Protocol](docs/BLE_PROTOCOL.md)** - Protocol specification

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
├─────────────────────────────────────────────────────────────┤
│  App Coordinator  │  Calendar Service  │  Display Renderer  │
│  - Orchestration  │  - Google Cal API  │  - 640×350 layout  │
│  - Auto-update    │  - Native Cal      │  - Text formatting │
│  - Error recovery │  - Event sync      │  - Optimization    │
└────────┬──────────┴────────┬───────────┴──────────┬─────────┘
         │                   │                       │
         ▼                   ▼                       ▼
    BLE Manager         Calendar APIs          Text Engine
         │
         ▼
   Even G2 Glasses
   (640×350, 60Hz)
```

## 🔧 What You Need to Complete

### 1. BLE UUIDs (CRITICAL)

**Current:** Placeholder UUIDs that won't work
**Needed:** Real UUIDs from your G2 device

**How to get them:**
- Use nRF Connect app
- Scan your G2 glasses
- Document all services/characteristics
- Update `src/types/ble.types.ts`

**See:** `docs/G2_BLE_UUID_DISCOVERY.md`

### 2. Protocol Validation

**Current:** Protocol implementation based on reverse-engineering patterns
**Needed:** Validation against real G2 hardware

**Test:**
- Connection establishment
- Simple text display
- Clear screen command
- Brightness control

**Iterate:**
- Adjust packet structure if needed
- Verify checksum algorithm
- Test different command types

### 3. Display Optimization

**Current:** Layout optimized for 640×350
**Needed:** Real-world testing and refinement

**Validate:**
- Text readability
- Font sizes
- Layout spacing
- Multi-line wrapping

### 4. Calendar Integration

**Current:** Google Calendar + Native calendar support
**Needed:** OAuth credentials and testing

**Configure:**
- Google Cloud Console project
- OAuth 2.0 credentials
- Calendar API enabled
- Permissions granted

## 🎓 Learning Value

Even if you don't have G2 hardware, this repository is valuable for:

### 1. React Native Architecture Patterns
- Service layer design
- State management
- Error handling
- Performance optimization

### 2. BLE Development
- Protocol design
- Packet encoding/decoding
- Connection management
- Error recovery

### 3. Calendar Integration
- Multi-source calendar support
- OAuth 2.0 authentication
- Event synchronization
- Real-time updates

### 4. Display Optimization
- Constrained display rendering
- Text formatting algorithms
- Layout engines
- Performance metrics

## 🤝 Contributing

### If You Have G2 Hardware

**Your contribution is CRITICAL:**

1. **Discover UUIDs** - Document real G2 BLE UUIDs
2. **Test Protocol** - Validate command structure
3. **Share Findings** - Help the community
4. **Improve Docs** - Add real-world insights

### If You Don't Have G2

**You can still help:**

1. **Code Review** - Improve architecture
2. **Documentation** - Enhance guides
3. **Testing** - Unit/integration tests
4. **Features** - Add new capabilities

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📊 Project Structure

```
even-g2-calendar-companion/
├── src/
│   ├── services/
│   │   ├── ble/
│   │   │   ├── BLEManager.ts          # BLE connection management
│   │   │   └── G2Protocol.ts          # Protocol encoder/decoder
│   │   ├── calendar/
│   │   │   └── CalendarService.ts     # Calendar integration
│   │   ├── display/
│   │   │   ├── DisplayRenderer.ts     # Display optimization
│   │   │   └── TextFormatter.ts       # Text processing
│   │   └── AppCoordinator.ts          # Main orchestration
│   ├── types/
│   │   ├── ble.types.ts               # BLE type definitions
│   │   ├── calendar.types.ts          # Calendar types
│   │   └── display.types.ts           # Display types (640×350)
│   └── utils/
│       └── dateUtils.ts               # Date helpers
├── docs/
│   ├── G2_BLE_UUID_DISCOVERY.md       # UUID discovery guide
│   ├── ARCHITECTURE.md                # System design
│   ├── BLE_PROTOCOL.md                # Protocol spec
│   └── SETUP.md                       # Setup instructions
├── ios/                               # iOS configuration
├── android/                           # Android configuration
├── scripts/
│   └── init-project.sh                # Initialization script
├── App.tsx                            # Main React Native app
├── package.json                       # Dependencies
└── README.md                          # This file
```

## ⚡ Performance Targets

- **BLE Latency:** <100ms command to display
- **Display Update:** ~500ms full refresh
- **Calendar Sync:** <500ms
- **Battery Impact:** ~2-3% per hour (phone)
- **Memory Usage:** ~50MB average

## 🔐 Privacy & Security

- **Local Processing:** Calendar data processed on-device
- **Direct BLE:** No cloud relay for G2 communication
- **Minimal Permissions:** Only necessary access requested
- **No Tracking:** No analytics or data collection

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **i-soxi/even-g2-protocol** - Reverse-engineered G2 protocol
- **rodrigofalvarez/g1-basis-android** - G1 development insights
- **Even Realities** - Amazing AR glasses hardware
- **React Native Community** - Excellent tooling

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- **Discussions:** [GitHub Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- **Email:** harikapadia99@gmail.com

## ⚠️ Disclaimer

This is an **unofficial, community-driven project**. Not affiliated with or endorsed by Even Realities.

The BLE protocol is reverse-engineered and may change with firmware updates. Use at your own risk.

---

**Built with ❤️ for the AR glasses developer community**

*Providing architecture and patterns for building on emerging hardware*
