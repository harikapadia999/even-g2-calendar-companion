# Calendar Companion for Even G2 (Even Hub SDK Version)

**Display your next calendar event on Even Realities G2 smart glasses**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Even Hub SDK](https://img.shields.io/badge/Even%20Hub%20SDK-0.0.7-purple.svg)

---

## 🎯 What is This?

Calendar Companion is a web application that runs inside the Even Hub app and displays your next upcoming Google Calendar event on your Even G2 smart glasses. It automatically syncs every 30 seconds and provides a clean, optimized display for the G2's monochrome screen.

### Key Features

- ✅ **Auto-Sync** - Refreshes calendar every 30 seconds
- ✅ **Next Event Display** - Shows title, time, location, and countdown
- ✅ **Google Calendar Integration** - Full OAuth 2.0 authentication
- ✅ **Interactive Controls** - Navigate with R1 ring or touchpad
- ✅ **Menu System** - Access settings and options
- ✅ **Optimized Display** - Perfect for 576×288 monochrome screen
- ✅ **Production Ready** - Error handling, state management, and logging

---

## 🚀 Quick Start

### Prerequisites

1. **Even Realities G2 smart glasses**
2. **Even Hub app** installed on your phone
3. **Google Calendar account**
4. **Google Cloud Console project** with Calendar API enabled
5. **Node.js 20+** for development

### Installation

```bash
# Clone the repository
git clone https://github.com/harikapadia999/even-g2-calendar-companion.git
cd even-g2-calendar-companion/evenhub-version

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Google API credentials

# Run development server
npm run dev
```

### Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Calendar API**
4. Create credentials:
   - **OAuth 2.0 Client ID** (Web application)
   - **API Key**
5. Configure OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
7. Copy credentials to `.env` file

---

## 📱 Usage

### Controls

| Action | Function |
|--------|----------|
| **Scroll Down** | Open menu |
| **Scroll Up/Down** (in menu) | Navigate options |
| **Single Tap** | Select / Refresh |
| **Double Tap** | Open menu / Go back |

### Menu Options

- **Refresh Now** - Manually sync calendar
- **Settings** - Configure display preferences
- **View All Events** - See upcoming events
- **Toggle Debug** - Show/hide debug information
- **Exit** - Close the application

### Display Information

The main screen shows:
- **Event Title** - Truncated to fit display
- **Time Range** - Start and end time
- **Location** - Event location (if available)
- **Time Until** - Countdown to event start
- **Duration** - Event length
- **Last Update** - When calendar was last synced

---

## 🏗️ Architecture

### Technology Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Even Hub SDK** - Official G2 integration
- **Google Calendar API** - Calendar data source
- **date-fns** - Date formatting and manipulation
- **Zustand** - State management (optional)

### Project Structure

```
evenhub-version/
├── src/
│   ├── services/
│   │   ├── evenhub-bridge.ts      # Even Hub SDK wrapper
│   │   ├── calendar-service.ts    # Google Calendar integration
│   │   └── display-composer.ts    # Display formatting
│   ├── state/
│   │   └── store.ts               # State management
│   ├── input/
│   │   └── event-mapper.ts        # Input event handling
│   ├── types/
│   │   ├── calendar.types.ts      # Calendar types
│   │   ├── display.types.ts       # Display types
│   │   └── state.types.ts         # State types
│   ├── utils/
│   │   └── format-utils.ts        # Formatting utilities
│   ├── app.ts                     # Main application
│   └── main.ts                    # Entry point
├── index.html                     # HTML entry page
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

### Data Flow

```
CalendarService  →  Store  →  DisplayComposer  →  EvenHubBridge  →  G2 Glasses
                      ↑                                |
                 EventMapper  ←  SDK Events  ←─────────┘
```

1. **CalendarService** fetches events from Google Calendar
2. **Store** manages application state
3. **DisplayComposer** formats data for G2 display
4. **EvenHubBridge** sends to Even Hub SDK
5. **EventMapper** handles user input from glasses

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### Testing with Even Hub Simulator

```bash
# Install simulator globally
npm install -g @evenrealities/evenhub-simulator

# Run simulator
evenhub-simulator

# Open your app in the simulator
# Navigate to http://localhost:3000
```

### Deployment

```bash
# Build production version
npm run build

# Deploy using Even Hub CLI
npm install -g @evenrealities/evenhub-cli
evenhub-cli deploy
```

---

## 📐 Display Specifications

### G2 Display

- **SDK Resolution:** 576×288 pixels
- **Hardware Resolution:** 640×350 pixels
- **Color:** Monochrome (1-bit black/white)
- **Image Containers:** Max 200×100 pixels each
- **Refresh Rate:** 60Hz
- **Brightness:** 1200 nits (auto-adjusting)

### Layout

```
┌─────────────────────────────────────────────────┐
│  [Branding Area - 200×24px]                     │
├─────────────────────────┬───────────────────────┤
│                         │                       │
│  Text Area              │  Image Area           │
│  376×288px              │  200×200px            │
│                         │  (Optional)           │
│  • Event Title          │                       │
│  • Time Range           │                       │
│  • Location             │                       │
│  • Time Until           │                       │
│  • Duration             │                       │
│  • Footer               │                       │
│                         │                       │
└─────────────────────────┴───────────────────────┘
```

---

## ⚙️ Configuration

### Settings (Configurable via Menu)

```typescript
{
  syncInterval: 30000,        // Sync every 30 seconds
  showLocation: true,         // Display event location
  showDuration: true,         // Display event duration
  showTimeUntil: true,        // Display countdown
  maxTitleLength: 40,         // Max characters for title
  timeFormat: '12h',          // '12h' or '24h'
  dateFormat: 'short',        // 'short' or 'long'
}
```

### Environment Variables

```bash
# Required
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_API_KEY=your_api_key

# Optional (defaults shown)
VITE_SYNC_INTERVAL=30000
VITE_MAX_EVENTS=10
```

---

## 🐛 Troubleshooting

### App Not Loading

**Problem:** App doesn't initialize

**Solutions:**
- Ensure you're running inside Even Hub app
- Check Google Calendar API credentials in `.env`
- Verify internet connection
- Check browser console for errors

### Calendar Not Syncing

**Problem:** Events not appearing

**Solutions:**
- Verify Google Calendar API is enabled in Cloud Console
- Check OAuth consent screen configuration
- Ensure authorized JavaScript origins are correct
- Try signing out and signing in again
- Check calendar permissions in Google account

### Display Issues

**Problem:** Text cut off or layout broken

**Solutions:**
- Adjust `maxTitleLength` in settings
- Check display composer configuration
- Verify event data format
- Test with shorter event titles

### Authentication Errors

**Problem:** Google sign-in fails

**Solutions:**
- Verify OAuth 2.0 Client ID is correct
- Check authorized JavaScript origins
- Ensure OAuth consent screen is published
- Clear browser cache and cookies
- Try incognito/private browsing mode

---

## 📚 Resources

### Official Documentation

- [Even Hub SDK](https://www.npmjs.com/package/@evenrealities/even_hub_sdk)
- [Even Hub Simulator](https://www.npmjs.com/package/@evenrealities/evenhub-simulator)
- [Even Hub CLI](https://www.npmjs.com/package/@evenrealities/evenhub-cli)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)

### Reference Implementations

- [EvenChess](https://github.com/dmyster145/EvenChess) - Chess app using Even Hub SDK
- [Even G2 Protocol](https://github.com/i-soxi/even-g2-protocol) - Reverse-engineered protocol

### Community

- [Even Realities Discord](https://discord.gg/evenrealities)
- [GitHub Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add types for all functions and variables
- Write descriptive commit messages
- Update documentation for new features
- Test on real G2 hardware when possible

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

**TL;DR:** Free to use, modify, and distribute. Even commercially.

---

## 🙏 Acknowledgments

- **Even Realities** - G2 smart glasses and Even Hub SDK
- **dmyster145** - EvenChess reference implementation
- **Google** - Calendar API
- **Open Source Community** - Various libraries and tools

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- **Discussions:** [GitHub Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- **Email:** harikapadia99@gmail.com

---

## 🎯 Roadmap

### Current Version (1.0.0)

- ✅ Google Calendar integration
- ✅ Next event display
- ✅ Auto-sync every 30 seconds
- ✅ Interactive menu system
- ✅ Settings configuration

### Planned Features

- [ ] Multiple calendar support
- [ ] Event notifications
- [ ] Custom display themes
- [ ] Offline mode
- [ ] Event creation/editing
- [ ] Calendar widget
- [ ] Voice commands
- [ ] Integration with other calendar services (Outlook, iCal)

---

**Built with ❤️ for the Even G2 community**

*Making smart glasses smarter, one calendar event at a time.*
