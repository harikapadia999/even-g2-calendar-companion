# Even G2 BLE UUID Discovery Guide

## ⚠️ CRITICAL: You MUST Discover Real UUIDs

The UUIDs in this codebase are **PLACEHOLDERS**. They will NOT work with your G2 glasses.

You must discover the actual UUIDs from your specific G2 device.

## Why UUIDs Are Device-Specific

BLE devices use UUIDs to identify:
- **Services** - Groups of related functionality (e.g., Display Service, Battery Service)
- **Characteristics** - Specific data points or commands within a service

Even Realities G2 uses **custom UUIDs** that are not publicly documented.

## Tools You Need

### Option 1: nRF Connect (Recommended)

**iOS:** https://apps.apple.com/app/nrf-connect/id1054362403
**Android:** https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp

### Option 2: LightBlue (iOS Only)

**iOS:** https://apps.apple.com/app/lightblue/id557428110

### Option 3: BLE Scanner (Android Only)

**Android:** https://play.google.com/store/apps/details?id=com.macdom.ble.blescanner

## Step-by-Step UUID Discovery

### Step 1: Prepare Your G2 Glasses

1. **Charge glasses** to at least 50%
2. **Power on** glasses
3. **Unpair** from official Even app (if paired)
4. **Enable Bluetooth** on your phone
5. **Close** all other BLE apps

### Step 2: Scan for G2 Device

**Using nRF Connect:**

1. Open nRF Connect app
2. Tap **"SCAN"** button
3. Look for device named:
   - "Even G2"
   - "EVEN-G2-XXXX"
   - "G2-XXXX"
   - Or similar variation

**Identifying Your G2:**
- **Signal Strength:** Should be strong (>-60 dBm) when close
- **Device Name:** Contains "Even" or "G2"
- **Manufacturer Data:** May show Even Realities identifier

### Step 3: Connect to G2

1. Tap on your G2 device in the scan list
2. Tap **"CONNECT"** button
3. Wait for connection (5-10 seconds)
4. Connection status should show "Connected"

### Step 4: Discover Services

**nRF Connect will automatically discover services:**

1. After connection, you'll see a list of services
2. Each service has a UUID (e.g., `0000180a-0000-1000-8000-00805f9b34fb`)
3. Tap on each service to expand and see characteristics

### Step 5: Identify Key Services

Look for these **standard BLE services** (these UUIDs are universal):

#### Device Information Service
```
Service UUID: 0000180a-0000-1000-8000-00805f9b34fb

Characteristics:
- Battery Level: 00002a19-0000-1000-8000-00805f9b34fb
- Firmware Version: 00002a26-0000-1000-8000-00805f9b34fb
- Hardware Version: 00002a27-0000-1000-8000-00805f9b34fb
- Manufacturer Name: 00002a29-0000-1000-8000-00805f9b34fb
```

#### Battery Service
```
Service UUID: 0000180f-0000-1000-8000-00805f9b34fb

Characteristics:
- Battery Level: 00002a19-0000-1000-8000-00805f9b34fb
```

### Step 6: Find Custom G2 Services

**Look for services with custom UUIDs** (not starting with `0000`):

These are Even Realities' proprietary services for:
- **Display Control** - Sending text/graphics to glasses
- **Input Events** - TouchBar gestures
- **Configuration** - Brightness, settings

**Example custom UUID patterns:**
```
Service: 0000fff0-0000-1000-8000-00805f9b34fb
Service: 0000ffe0-0000-1000-8000-00805f9b34fb
Service: 0000ffd0-0000-1000-8000-00805f9b34fb
```

### Step 7: Identify Characteristics

For each custom service, expand it and note:

1. **Characteristic UUID**
2. **Properties** (Read, Write, Notify, Indicate)
3. **Descriptor UUIDs** (if any)

**Key properties to look for:**

- **Write** or **Write Without Response** → Likely for sending commands (display text)
- **Notify** or **Indicate** → Likely for receiving events (TouchBar, battery)
- **Read** → Likely for getting status (firmware version, settings)

### Step 8: Test Characteristics

**IMPORTANT:** Be careful when writing to characteristics!

**Safe to test:**
- **Read** operations (won't change anything)
- **Enable notifications** (just listens for events)

**Risky:**
- **Write** operations (could send commands to glasses)
- Only test if you understand the protocol

**Testing Read:**
1. Tap on characteristic
2. Tap "Read" button
3. Note the value returned

**Testing Notify:**
1. Tap on characteristic
2. Tap "Enable notifications"
3. Perform action on glasses (e.g., tap TouchBar)
4. Watch for notification data

### Step 9: Document Your Findings

Create a file `G2_UUIDS.txt` with your discoveries:

```
=== EVEN G2 BLE UUIDS ===
Device Name: EVEN-G2-1234

=== STANDARD SERVICES ===
Device Information Service: 0000180a-0000-1000-8000-00805f9b34fb
  - Battery Level: 00002a19-0000-1000-8000-00805f9b34fb (Read, Notify)
  - Firmware Version: 00002a26-0000-1000-8000-00805f9b34fb (Read)

=== CUSTOM SERVICES ===
Display Service: [YOUR_DISCOVERED_UUID]
  - Text Display: [YOUR_DISCOVERED_UUID] (Write)
  - Clear Display: [YOUR_DISCOVERED_UUID] (Write)
  - Brightness: [YOUR_DISCOVERED_UUID] (Read, Write)

Input Service: [YOUR_DISCOVERED_UUID]
  - TouchBar Events: [YOUR_DISCOVERED_UUID] (Notify)

Configuration Service: [YOUR_DISCOVERED_UUID]
  - Settings: [YOUR_DISCOVERED_UUID] (Read, Write)
```

### Step 10: Update Code

Replace placeholder UUIDs in `src/types/ble.types.ts`:

```typescript
export const G2_UUIDS = {
  // Device Information Service (Standard)
  DEVICE_INFO_SERVICE: '0000180a-0000-1000-8000-00805f9b34fb',
  BATTERY_CHARACTERISTIC: '00002a19-0000-1000-8000-00805f9b34fb',
  FIRMWARE_CHARACTERISTIC: '00002a26-0000-1000-8000-00805f9b34fb',
  
  // Display Service (REPLACE WITH YOUR DISCOVERED UUIDS)
  DISPLAY_SERVICE: 'YOUR_DISCOVERED_SERVICE_UUID',
  TEXT_CHARACTERISTIC: 'YOUR_DISCOVERED_CHARACTERISTIC_UUID',
  GRAPHICS_CHARACTERISTIC: 'YOUR_DISCOVERED_CHARACTERISTIC_UUID',
  CLEAR_CHARACTERISTIC: 'YOUR_DISCOVERED_CHARACTERISTIC_UUID',
  
  // Input Service (REPLACE WITH YOUR DISCOVERED UUIDS)
  INPUT_SERVICE: 'YOUR_DISCOVERED_SERVICE_UUID',
  TOUCHBAR_CHARACTERISTIC: 'YOUR_DISCOVERED_CHARACTERISTIC_UUID',
  
  // Configuration Service (REPLACE WITH YOUR DISCOVERED UUIDS)
  CONFIG_SERVICE: 'YOUR_DISCOVERED_SERVICE_UUID',
  BRIGHTNESS_CHARACTERISTIC: 'YOUR_DISCOVERED_CHARACTERISTIC_UUID',
  SETTINGS_CHARACTERISTIC: 'YOUR_DISCOVERED_CHARACTERISTIC_UUID',
} as const;
```

## Advanced: Protocol Reverse Engineering

Once you have UUIDs, you need to figure out the **command format**.

### Method 1: Observe Official App

1. **Install** official Even app
2. **Pair** G2 with app
3. **Use** nRF Connect to monitor BLE traffic
4. **Perform actions** in Even app (display text, change brightness)
5. **Observe** what data is sent to which characteristics

### Method 2: Trial and Error

**Start simple:**

```typescript
// Try sending "Hello" as plain text
const text = "Hello";
const data = new TextEncoder().encode(text);
await characteristic.writeValue(data);
```

**If that doesn't work, try:**

```typescript
// Try with length prefix
const text = "Hello";
const textBytes = new TextEncoder().encode(text);
const data = new Uint8Array(textBytes.length + 1);
data[0] = textBytes.length;
data.set(textBytes, 1);
await characteristic.writeValue(data);
```

**If still doesn't work:**

Study the protocol implementation in:
- `src/services/ble/G2Protocol.ts`
- Try different packet structures
- Check if checksum is required

### Method 3: Community Resources

Check these resources for protocol info:

1. **i-soxi/even-g2-protocol** - https://github.com/i-soxi/even-g2-protocol
2. **rodrigofalvarez/g1-basis-android** - https://github.com/rodrigofalvarez/g1-basis-android
3. **Even Realities Discord** - Ask in developer channels
4. **Level1Techs Forum** - https://forum.level1techs.com/t/even-reality-g1-glasses-discussion/238290

## Troubleshooting

### Can't Find G2 Device

**Check:**
- Glasses are powered on
- Glasses are charged
- Bluetooth enabled on phone
- Glasses not paired to another device
- Try restarting glasses
- Try restarting phone Bluetooth

### Connection Fails

**Check:**
- Move closer to glasses (<1 meter)
- Remove other Bluetooth devices
- Disable other BLE apps
- Try different BLE scanner app
- Restart both devices

### No Custom Services Visible

**Possible reasons:**
- G2 requires pairing first
- G2 requires authentication
- Services are hidden until specific command sent
- Firmware version differences

**Try:**
- Pair with official app first, then scan
- Look for "Unknown Service" entries
- Check all services, even standard ones

### Write Operations Don't Work

**Check:**
- Characteristic has Write property
- Using correct data format
- Data length within limits
- Checksum correct (if required)
- Authentication needed first

## Security Considerations

### Be Careful When Writing

**Don't:**
- Send random data to characteristics
- Write to unknown characteristics
- Exceed data length limits
- Spam write operations

**Could cause:**
- Glasses malfunction
- Display corruption
- Battery drain
- Need for factory reset

### Respect Privacy

**Don't:**
- Share UUIDs publicly without permission
- Reverse engineer security features
- Bypass authentication mechanisms
- Violate Even Realities' terms of service

## Next Steps

After discovering UUIDs:

1. **Update** `src/types/ble.types.ts` with real UUIDs
2. **Test** basic connection in app
3. **Experiment** with simple commands
4. **Validate** protocol implementation
5. **Iterate** based on results

## Need Help?

- **GitHub Issues:** https://github.com/harikapadia999/even-g2-calendar-companion/issues
- **Discussions:** https://github.com/harikapadia999/even-g2-calendar-companion/discussions
- **Email:** harikapadia99@gmail.com

## Contributing

If you successfully discover G2 UUIDs and protocol:

1. **Document** your findings
2. **Share** with community (if allowed)
3. **Contribute** to protocol documentation
4. **Help** others with same hardware

**Together we can build better tools for G2 development!**
