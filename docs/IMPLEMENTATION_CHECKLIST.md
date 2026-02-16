# Implementation Checklist

## Complete Guide: From Architecture to Working App

This checklist guides you through converting the architecture into a working application.

**Estimated Time:** 4-8 hours with G2 hardware

---

## Phase 1: Environment Setup (30 minutes)

### ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm 9+ or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### ✅ Platform Tools

**For iOS:**
- [ ] macOS computer
- [ ] Xcode 14+ installed
- [ ] CocoaPods installed (`sudo gem install cocoapods`)
- [ ] iOS device or simulator

**For Android:**
- [ ] Android Studio installed
- [ ] Android SDK (API 26+) installed
- [ ] JDK 11+ installed
- [ ] Android device or emulator

### ✅ Hardware

- [ ] Even Realities G2 smart glasses
- [ ] G2 charged to at least 50%
- [ ] Smartphone (iOS 13+ or Android 8+)
- [ ] nRF Connect app installed on phone

---

## Phase 2: Project Initialization (30 minutes)

### ✅ Clone Repository

```bash
- [ ] git clone https://github.com/harikapadia999/even-g2-calendar-companion.git
- [ ] cd even-g2-calendar-companion
- [ ] git checkout complete-rn-project
```

### ✅ Initialize React Native Project

```bash
- [ ] npx react-native init EvenG2Calendar --template react-native-template-typescript
- [ ] cd EvenG2Calendar
```

### ✅ Copy Architecture Files

```bash
- [ ] cp -r ../src ./
- [ ] cp -r ../docs ./
- [ ] cp -r ../scripts ./
- [ ] cp ../App.tsx ./
- [ ] cp ../package.json ./package.json.new
- [ ] cp ../tsconfig.json ./
- [ ] cp ../babel.config.js ./
- [ ] cp ../metro.config.js ./
- [ ] cp ../jest.config.js ./
- [ ] cp ../jest.setup.js ./
- [ ] cp ../.env.example ./.env
- [ ] cp ../.gitignore ./
- [ ] cp ../index.js ./
- [ ] cp ../app.json ./
```

### ✅ Merge package.json

```bash
- [ ] Merge dependencies from package.json.new into package.json
- [ ] Keep React Native version from initialized project
- [ ] Add all custom dependencies
```

### ✅ Install Dependencies

```bash
- [ ] npm install
```

### ✅ iOS Setup (macOS only)

```bash
- [ ] cp ../ios/Podfile ./ios/
- [ ] cp ../ios/Info.plist.template ./ios/EvenG2Calendar/Info.plist
- [ ] cd ios && pod install && cd ..
```

### ✅ Android Setup

```bash
- [ ] cp ../android/build.gradle ./android/
- [ ] cp ../android/app/build.gradle ./android/app/
- [ ] cp ../android/settings.gradle ./android/
- [ ] cp ../android/app/src/main/AndroidManifest.xml.template ./android/app/src/main/AndroidManifest.xml
```

---

## Phase 3: G2 BLE UUID Discovery (1-2 hours)

### ✅ Prepare G2 Glasses

- [ ] Charge G2 to at least 50%
- [ ] Power on G2 glasses
- [ ] Unpair from official Even app (if paired)
- [ ] Ensure Bluetooth enabled on phone

### ✅ Install BLE Scanner

- [ ] Install nRF Connect app on phone
  - iOS: https://apps.apple.com/app/nrf-connect/id1054362403
  - Android: https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp

### ✅ Scan for G2

- [ ] Open nRF Connect
- [ ] Tap "SCAN"
- [ ] Find device named "Even G2" or similar
- [ ] Note signal strength (should be >-60 dBm when close)

### ✅ Connect to G2

- [ ] Tap on G2 device in scan list
- [ ] Tap "CONNECT"
- [ ] Wait for connection (5-10 seconds)
- [ ] Verify "Connected" status

### ✅ Discover Services

- [ ] nRF Connect auto-discovers services
- [ ] Expand each service to see characteristics
- [ ] Document ALL UUIDs in a text file

### ✅ Identify Standard Services

**Device Information Service:**
- [ ] Service UUID: `0000180a-0000-1000-8000-00805f9b34fb`
- [ ] Battery Level: `00002a19-0000-1000-8000-00805f9b34fb`
- [ ] Firmware Version: `00002a26-0000-1000-8000-00805f9b34fb`

### ✅ Identify Custom Services

**Look for services with custom UUIDs:**

**Display Service:**
- [ ] Service UUID: ________________
- [ ] Text Display Characteristic: ________________
- [ ] Graphics Characteristic: ________________
- [ ] Clear Display Characteristic: ________________

**Input Service:**
- [ ] Service UUID: ________________
- [ ] TouchBar Events Characteristic: ________________

**Configuration Service:**
- [ ] Service UUID: ________________
- [ ] Brightness Characteristic: ________________
- [ ] Settings Characteristic: ________________

### ✅ Test Characteristics

**Safe to test:**
- [ ] Read battery level
- [ ] Read firmware version
- [ ] Enable TouchBar notifications (tap TouchBar, watch for data)

**Document findings:**
- [ ] Create `G2_UUIDS.txt` with all discovered UUIDs
- [ ] Note which characteristics support Read/Write/Notify

### ✅ Update Code

- [ ] Open `src/types/ble.types.ts`
- [ ] Replace ALL placeholder UUIDs with real ones
- [ ] Save file
- [ ] Commit changes: `git commit -m "feat: add real G2 BLE UUIDs"`

---

## Phase 4: Google Calendar Setup (30 minutes)

### ✅ Google Cloud Console

- [ ] Visit https://console.cloud.google.com
- [ ] Create new project: "Even G2 Calendar Companion"
- [ ] Enable Google Calendar API
- [ ] Create OAuth 2.0 credentials

**For iOS:**
- [ ] Application type: iOS
- [ ] Bundle ID: `com.eveng2calendar`
- [ ] Copy Client ID

**For Android:**
- [ ] Application type: Android
- [ ] Package name: `com.eveng2calendar`
- [ ] Get SHA-1 fingerprint:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
- [ ] Copy Client ID

### ✅ Configure App

**Update .env:**
- [ ] `GOOGLE_CLIENT_ID=your_client_id_here`

**Update iOS Info.plist:**
- [ ] Replace `YOUR_CLIENT_ID` with actual client ID
- [ ] Verify all permission descriptions are present

**Update Android:**
- [ ] Verify AndroidManifest.xml has all permissions
- [ ] Add Google Sign-In configuration if needed

---

## Phase 5: First Run (30 minutes)

### ✅ Start Metro Bundler

```bash
- [ ] npm start
```

### ✅ Run on iOS

```bash
- [ ] npm run ios
# Or for device:
- [ ] npm run ios -- --device "Your iPhone"
```

### ✅ Run on Android

```bash
- [ ] npm run android
# Or for specific device:
- [ ] npm run android -- --deviceId=YOUR_DEVICE_ID
```

### ✅ Verify App Launches

- [ ] App opens without crashes
- [ ] No red screen errors
- [ ] UI renders correctly
- [ ] Permissions requested

### ✅ Grant Permissions

- [ ] Allow Bluetooth access
- [ ] Allow Calendar access
- [ ] Allow Location access (Android)

---

## Phase 6: BLE Connection Test (1 hour)

### ✅ Scan for G2

- [ ] Tap "Scan for G2" in app
- [ ] G2 device appears in list
- [ ] Device shows correct name
- [ ] Signal strength displayed

### ✅ Connect to G2

- [ ] Tap on G2 device
- [ ] Connection status changes to "Connecting"
- [ ] Connection succeeds
- [ ] Status shows "Connected"

### ✅ Verify Connection

- [ ] Check logs for "Connected to G2 device"
- [ ] No error messages
- [ ] Connection stable (doesn't drop)

### ✅ Test Basic Commands

**Add test button to App.tsx:**

```typescript
const testDisplay = async () => {
  try {
    await bleManager.clearDisplay();
    await bleManager.sendCommand({
      type: DisplayCommandType.TEXT,
      text: "Hello G2",
      x: 10,
      y: 10,
      alignment: TextAlignment.LEFT,
      fontSize: 24,
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

- [ ] Add test button to UI
- [ ] Tap test button
- [ ] Check if "Hello G2" appears on glasses

**If text appears:** ✅ Protocol works!
**If nothing appears:** ❌ Protocol needs adjustment

---

## Phase 7: Protocol Validation (1-2 hours)

### ✅ Test Each Command Type

**Clear Display:**
- [ ] Send clear command
- [ ] Verify display clears
- [ ] Test region clear (specific area)

**Text Display:**
- [ ] Test different positions (x, y)
- [ ] Test different alignments (left, center, right)
- [ ] Test different font sizes (14, 18, 24, 32)
- [ ] Test multi-line text
- [ ] Test special characters

**Brightness:**
- [ ] Test brightness levels (0, 50, 100)
- [ ] Test auto-brightness toggle
- [ ] Verify changes visible on glasses

### ✅ Validate Packet Structure

**If commands don't work:**

- [ ] Check packet structure in `G2Protocol.ts`
- [ ] Try different header values
- [ ] Test with/without checksum
- [ ] Adjust payload format
- [ ] Compare with community protocol docs

**Document findings:**
- [ ] Create `PROTOCOL_FINDINGS.md`
- [ ] Note what works/doesn't work
- [ ] Share with community

---

## Phase 8: Calendar Integration (1 hour)

### ✅ Test Calendar Permissions

- [ ] App requests calendar permission
- [ ] Permission granted
- [ ] Calendars loaded successfully

### ✅ Test Google Calendar

- [ ] Tap "Sign in with Google"
- [ ] Google Sign-In flow works
- [ ] Calendar API returns events
- [ ] Events parsed correctly

### ✅ Test Native Calendar

- [ ] Native calendars detected
- [ ] Events fetched
- [ ] Events displayed in app

### ✅ Test Next Event Detection

- [ ] Create test event in calendar (15 minutes from now)
- [ ] App detects next event
- [ ] Event details correct
- [ ] Time until start calculated correctly

---

## Phase 9: Display Integration (1-2 hours)

### ✅ Test Calendar Display

- [ ] Next event appears on G2
- [ ] Title displayed correctly
- [ ] Time range formatted properly
- [ ] Location shown (if present)
- [ ] Time until start updates

### ✅ Test Layout

- [ ] All text visible on G2
- [ ] No text cutoff
- [ ] Spacing looks good
- [ ] Font sizes readable

### ✅ Optimize Display

**If layout needs adjustment:**

- [ ] Adjust font sizes in `display.types.ts`
- [ ] Modify layout regions
- [ ] Test text wrapping
- [ ] Verify readability

### ✅ Test Auto-Update

- [ ] Wait 30 seconds
- [ ] Display updates automatically
- [ ] Time until start decrements
- [ ] No performance issues

---

## Phase 10: Error Handling (1 hour)

### ✅ Test Connection Recovery

- [ ] Turn off G2 glasses
- [ ] App detects disconnection
- [ ] Turn on G2 glasses
- [ ] App auto-reconnects
- [ ] Display resumes

### ✅ Test Calendar Errors

- [ ] Disable internet
- [ ] App handles sync failure gracefully
- [ ] Enable internet
- [ ] Sync resumes automatically

### ✅ Test Edge Cases

- [ ] No upcoming events
- [ ] All-day events
- [ ] Events with no location
- [ ] Very long event titles
- [ ] Multiple events at same time
- [ ] Past events

---

## Phase 11: Performance Testing (1 hour)

### ✅ Measure Latency

- [ ] Time from calendar change to display update
- [ ] Target: <5 seconds
- [ ] Optimize if needed

### ✅ Monitor Battery

- [ ] Run app for 1 hour
- [ ] Check phone battery drain
- [ ] Check G2 battery drain
- [ ] Target: <3% per hour (phone)

### ✅ Check Memory Usage

- [ ] Monitor app memory in dev tools
- [ ] Target: <100MB
- [ ] Check for memory leaks

### ✅ Test Stability

- [ ] Run app for extended period (2+ hours)
- [ ] No crashes
- [ ] No connection drops
- [ ] No memory issues

---

## Phase 12: Polish & Refinement (2-4 hours)

### ✅ UI Improvements

- [ ] Add loading states
- [ ] Improve error messages
- [ ] Add success confirmations
- [ ] Polish animations
- [ ] Add app icon

### ✅ Settings Screen

- [ ] Calendar selection
- [ ] Update interval configuration
- [ ] Display timeout setting
- [ ] Brightness preferences
- [ ] About screen

### ✅ Error Messages

- [ ] User-friendly error text
- [ ] Actionable suggestions
- [ ] Clear recovery steps

### ✅ Documentation

- [ ] Update README with real findings
- [ ] Document actual UUIDs (if shareable)
- [ ] Add screenshots
- [ ] Create demo video

---

## Phase 13: Testing (2-4 hours)

### ✅ Unit Tests

```bash
- [ ] npm test
- [ ] All tests pass
- [ ] Coverage >70%
```

### ✅ Integration Tests

- [ ] BLE connection flow
- [ ] Calendar sync flow
- [ ] Display update flow
- [ ] Error recovery flow

### ✅ Manual Testing

**Happy Path:**
- [ ] Install app
- [ ] Grant permissions
- [ ] Connect to G2
- [ ] Sync calendar
- [ ] View next event on G2
- [ ] Auto-updates work

**Error Scenarios:**
- [ ] No Bluetooth
- [ ] No calendar permission
- [ ] No internet
- [ ] G2 out of range
- [ ] G2 battery dead
- [ ] No upcoming events

**Edge Cases:**
- [ ] Multiple calendars
- [ ] Recurring events
- [ ] All-day events
- [ ] Events with emojis
- [ ] Very long titles
- [ ] Special characters

---

## Phase 14: Build for Production (1-2 hours)

### ✅ Version Update

- [ ] Update version in `package.json`
- [ ] Update version in `app.json`
- [ ] Update iOS version in Info.plist
- [ ] Update Android version in build.gradle

### ✅ iOS Build

```bash
- [ ] Open Xcode
- [ ] Select "Any iOS Device"
- [ ] Product → Archive
- [ ] Distribute App
- [ ] Upload to App Store Connect
```

### ✅ Android Build

```bash
- [ ] Generate release keystore
- [ ] Configure signing in gradle.properties
- [ ] npm run build:android
- [ ] Test release APK
- [ ] Upload to Google Play Console
```

---

## Phase 15: Documentation & Sharing (1 hour)

### ✅ Update Documentation

- [ ] README.md with real specs
- [ ] CHANGELOG.md with v1.0.0 details
- [ ] Add screenshots to docs/
- [ ] Create demo video

### ✅ Share Findings

**If UUIDs are shareable:**
- [ ] Update `src/types/ble.types.ts` with real UUIDs
- [ ] Document protocol findings
- [ ] Create PR to main branch
- [ ] Share with community

**If UUIDs are private:**
- [ ] Document process in IMPLEMENTATION_NOTES.md
- [ ] Share learnings without specific UUIDs
- [ ] Help others with discovery process

### ✅ Community Contribution

- [ ] Star the repository
- [ ] Share on social media
- [ ] Write blog post about experience
- [ ] Help others in Issues/Discussions

---

## Troubleshooting Checklist

### BLE Connection Issues

**Problem: Can't find G2 device**
- [ ] G2 powered on?
- [ ] G2 charged?
- [ ] Bluetooth enabled on phone?
- [ ] G2 not paired to another device?
- [ ] Try restarting G2
- [ ] Try restarting phone Bluetooth
- [ ] Move closer (<1 meter)

**Problem: Connection fails**
- [ ] Check UUIDs are correct
- [ ] Verify G2 is in pairing mode
- [ ] Check BLE permissions granted
- [ ] Try different phone
- [ ] Check G2 firmware version

**Problem: Connection drops immediately**
- [ ] Check signal strength
- [ ] Remove interference sources
- [ ] Verify MTU negotiation
- [ ] Check auto-reconnect logic

### Display Issues

**Problem: No text appears on G2**
- [ ] Verify UUIDs correct
- [ ] Check packet structure
- [ ] Test with simple text first
- [ ] Verify coordinates within bounds (0-640, 0-350)
- [ ] Check checksum calculation

**Problem: Garbled text**
- [ ] Wrong packet structure
- [ ] Incorrect encoding
- [ ] Checksum mismatch
- [ ] Try different command format

**Problem: Text cutoff**
- [ ] Adjust font sizes
- [ ] Check layout regions
- [ ] Verify text wrapping
- [ ] Test different positions

### Calendar Issues

**Problem: No events showing**
- [ ] Calendar permission granted?
- [ ] Events exist in calendar?
- [ ] Events in next 7 days?
- [ ] Calendar enabled in app?
- [ ] Try manual sync

**Problem: Google Calendar not working**
- [ ] Internet connection?
- [ ] OAuth credentials correct?
- [ ] Calendar API enabled?
- [ ] Try re-authentication

**Problem: Wrong event displayed**
- [ ] Check next event logic
- [ ] Verify timezone handling
- [ ] Test with different events
- [ ] Check event filtering

### Performance Issues

**Problem: High battery drain**
- [ ] Reduce update interval
- [ ] Optimize BLE commands
- [ ] Add display timeout
- [ ] Check for memory leaks

**Problem: Slow updates**
- [ ] Check BLE latency
- [ ] Optimize calendar sync
- [ ] Reduce command delays
- [ ] Profile performance

**Problem: App crashes**
- [ ] Check error logs
- [ ] Verify null checks
- [ ] Test error recovery
- [ ] Add try-catch blocks

---

## Success Criteria

### ✅ Minimum Viable Product

- [ ] App connects to G2 via BLE
- [ ] Text displays on G2 screen
- [ ] Calendar syncs successfully
- [ ] Next event shows on G2
- [ ] Updates automatically
- [ ] Handles basic errors

### ✅ Production Ready

- [ ] All MVP criteria met
- [ ] Auto-reconnection works
- [ ] Battery usage acceptable
- [ ] No crashes in 2+ hour test
- [ ] Error messages user-friendly
- [ ] Documentation complete
- [ ] Tests passing

### ✅ Community Contribution

- [ ] Code shared on GitHub
- [ ] Documentation updated
- [ ] Findings shared with community
- [ ] Help others with issues

---

## Time Estimates

### With G2 Hardware:
- **Setup:** 30 minutes
- **UUID Discovery:** 1-2 hours
- **Protocol Validation:** 1-2 hours
- **Integration:** 1-2 hours
- **Testing:** 1-2 hours
- **Total:** 4-8 hours

### Without G2 Hardware:
- **Study architecture:** 2-4 hours
- **Learn patterns:** 4-8 hours
- **Adapt for other devices:** 8-16 hours
- **Total:** 14-28 hours (learning time)

---

## Next Steps After Completion

### Version 1.1 Features

- [ ] Multiple event preview (next 3 events)
- [ ] Custom event filters
- [ ] Meeting join links (Zoom, Meet, Teams)
- [ ] Event creation from glasses
- [ ] Voice notes integration

### Version 1.2 Features

- [ ] Full day schedule view
- [ ] Event reminders with haptic
- [ ] Calendar sharing
- [ ] Offline mode
- [ ] Battery optimization

### Version 2.0 Features

- [ ] Graphics support (icons, charts)
- [ ] Multi-language support
- [ ] Accessibility features
- [ ] Widget support
- [ ] Apple Watch companion

---

## Resources

### Documentation
- [Setup Guide](SETUP.md)
- [Architecture](ARCHITECTURE.md)
- [BLE Protocol](BLE_PROTOCOL.md)
- [UUID Discovery](G2_BLE_UUID_DISCOVERY.md)

### Community
- [GitHub Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- [GitHub Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- [Even Realities Discord](https://discord.gg/evenrealities)

### Tools
- [nRF Connect](https://www.nordicsemi.com/Products/Development-tools/nrf-connect-for-mobile)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)

---

## Support

**Stuck? Need help?**

1. Check documentation
2. Search GitHub Issues
3. Ask in Discussions
4. Email: harikapadia99@gmail.com

**Found a bug?**
- Create GitHub Issue with details

**Want to contribute?**
- Read CONTRIBUTING.md
- Create Pull Request

---

## Final Checklist

Before considering the project complete:

- [ ] All phases completed
- [ ] App works on real G2 hardware
- [ ] Documentation updated with findings
- [ ] Tests passing
- [ ] No known critical bugs
- [ ] Performance acceptable
- [ ] Battery usage reasonable
- [ ] Code committed to Git
- [ ] Shared with community

**Congratulations! You've built a production-ready G2 app! 🎉**
