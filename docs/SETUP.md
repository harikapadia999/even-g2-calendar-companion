# Setup Guide

Complete guide to setting up Even G2 Calendar Companion for development and production.

## Prerequisites

### Required Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ or **yarn** 1.22+
- **Git** ([Download](https://git-scm.com/))

### Platform-Specific Requirements

#### iOS Development

- **macOS** (required for iOS development)
- **Xcode** 14+ ([Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **CocoaPods** 1.11+ (`sudo gem install cocoapods`)
- **iOS Device** with iOS 13+ (or simulator)

#### Android Development

- **Android Studio** ([Download](https://developer.android.com/studio))
- **Android SDK** (API Level 26+)
- **Java Development Kit (JDK)** 11+
- **Android Device** with Android 8+ (or emulator)

### Hardware Requirements

- **Even Realities G2 Smart Glasses** (required for testing)
- **Smartphone** (iOS 13+ or Android 8+)

## Step 1: Clone Repository

```bash
git clone https://github.com/harikapadia999/even-g2-calendar-companion.git
cd even-g2-calendar-companion
```

## Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or with yarn
yarn install
```

### iOS-Specific Setup

```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..
```

## Step 3: Configure Environment

### Create Environment File

```bash
cp .env.example .env
```

### Configure Google Calendar API

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Name: "Even G2 Calendar Companion"
   - Click "Create"

3. **Enable Google Calendar API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "iOS" (for iOS) or "Android" (for Android)
   - Follow platform-specific instructions below

#### iOS OAuth Setup

```
1. Bundle ID: com.yourcompany.eveng2calendar
2. App Store ID: (leave blank for development)
3. Click "Create"
4. Copy the Client ID
```

Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
```

#### Android OAuth Setup

```
1. Package name: com.eveng2calendar
2. SHA-1 certificate fingerprint:
   - Debug: Get from Android Studio or run:
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   - Production: Use your release keystore
3. Click "Create"
4. Copy the Client ID
```

Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
```

### Update Configuration Files

#### iOS: Info.plist

Add to `ios/EvenG2Calendar/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>

<key>NSCalendarsUsageDescription</key>
<string>We need access to your calendar to display upcoming events on your G2 glasses.</string>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>We need Bluetooth to connect to your Even G2 smart glasses.</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>We need Bluetooth to communicate with your Even G2 smart glasses.</string>
```

#### Android: AndroidManifest.xml

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />

<application>
  <!-- ... -->
</application>
```

## Step 4: Run Development Build

### iOS

```bash
# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios

# Or specify device
npm run ios -- --device "Your iPhone"
```

### Android

```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android

# Or specify device
npm run android -- --deviceId=YOUR_DEVICE_ID
```

## Step 5: Pair with G2 Glasses

### First-Time Setup

1. **Power on G2 Glasses**
   - Ensure glasses are charged
   - Turn on glasses

2. **Enable Bluetooth**
   - On your phone, enable Bluetooth
   - Grant app Bluetooth permissions

3. **Scan for Devices**
   - In app, tap "Scan for G2"
   - Wait for glasses to appear in list

4. **Connect**
   - Tap on your G2 device
   - Wait for connection confirmation

5. **Grant Calendar Permissions**
   - Allow calendar access when prompted
   - Select calendars to sync

6. **Test Display**
   - App should display next event
   - Event should appear on G2 glasses

## Step 6: Verify Installation

### Check BLE Connection

```
✓ Bluetooth enabled
✓ G2 device discovered
✓ Connection established
✓ Services discovered
✓ Characteristics accessible
```

### Check Calendar Sync

```
✓ Calendar permissions granted
✓ Calendars loaded
✓ Events fetched
✓ Next event detected
```

### Check Display

```
✓ Display commands sent
✓ Text appears on G2
✓ Layout correct
✓ Updates working
```

## Troubleshooting

### iOS Issues

#### "Command PhaseScriptExecution failed"

```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### "No bundle URL present"

```bash
# Reset Metro cache
npm start -- --reset-cache
```

#### "Could not find iPhone"

```bash
# List available devices
xcrun simctl list devices

# Or use physical device
npm run ios -- --device
```

### Android Issues

#### "SDK location not found"

Create `android/local.properties`:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

#### "Execution failed for task ':app:installDebug'"

```bash
# Check connected devices
adb devices

# If multiple devices, specify one
npm run android -- --deviceId=DEVICE_ID
```

#### "Unable to load script"

```bash
# Reverse port for Metro
adb reverse tcp:8081 tcp:8081

# Restart Metro
npm start -- --reset-cache
```

### BLE Issues

#### "Bluetooth permission denied"

- **iOS:** Check Settings → Privacy → Bluetooth
- **Android:** Check Settings → Apps → Permissions → Location

#### "Device not found"

1. Ensure G2 is powered on
2. Ensure G2 is not connected to another device
3. Try restarting G2
4. Try restarting phone Bluetooth

#### "Connection failed"

1. Move closer to G2 (<5m)
2. Remove other Bluetooth devices
3. Restart app
4. Restart G2

### Calendar Issues

#### "Calendar permission denied"

- **iOS:** Settings → Privacy → Calendars → Enable app
- **Android:** Settings → Apps → Permissions → Calendar

#### "No events showing"

1. Check calendar has events
2. Check events are in next 7 days
3. Check calendar is enabled in app
4. Try manual sync

#### "Google Calendar not syncing"

1. Check internet connection
2. Re-authenticate Google account
3. Check Google Calendar API enabled
4. Verify OAuth credentials

## Development Tips

### Hot Reload

```bash
# Enable Fast Refresh (enabled by default)
# Shake device or press Cmd+D (iOS) / Cmd+M (Android)
# Select "Enable Fast Refresh"
```

### Debugging

#### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Run
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

#### Chrome DevTools

```bash
# Shake device → "Debug"
# Opens Chrome at http://localhost:8081/debugger-ui
```

#### Flipper

```bash
# Install Flipper
brew install --cask flipper

# Run app in debug mode
# Flipper auto-detects app
```

### Logging

```typescript
// BLE logs
DEBUG_BLE=true npm start

// Calendar logs
DEBUG_CALENDAR=true npm start

// All logs
DEBUG_BLE=true DEBUG_CALENDAR=true DEBUG_DISPLAY=true npm start
```

## Building for Production

### iOS

```bash
# 1. Update version in ios/EvenG2Calendar/Info.plist
# 2. Archive in Xcode
# 3. Upload to App Store Connect

# Or via command line
npm run build:ios
```

### Android

```bash
# 1. Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 2. Add to android/gradle.properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****

# 3. Build release APK
npm run build:android

# Output: android/app/build/outputs/apk/release/app-release.apk
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android
```

## Next Steps

1. **Customize Display** - Edit `src/config/display.config.ts`
2. **Add Features** - See [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Contribute** - See [CONTRIBUTING.md](../CONTRIBUTING.md)

## Support

- **Issues:** [GitHub Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- **Discussions:** [GitHub Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- **Email:** harikapadia99@gmail.com

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [BLE PLX Docs](https://github.com/dotintent/react-native-ble-plx)
- [Google Calendar API](https://developers.google.com/calendar)
- [Even G2 Protocol](https://github.com/i-soxi/even-g2-protocol)
