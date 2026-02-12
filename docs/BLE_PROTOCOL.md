# Even G2 BLE Protocol Documentation

## Overview

This document details the Bluetooth Low Energy (BLE) protocol used to communicate with Even Realities G2 smart glasses. The protocol is based on reverse-engineering efforts from the community, primarily [i-soxi/even-g2-protocol](https://github.com/i-soxi/even-g2-protocol).

**⚠️ Important:** This is an unofficial, reverse-engineered protocol. It may change with firmware updates without notice.

## BLE Services & Characteristics

### Device Information Service

**Service UUID:** `0000180a-0000-1000-8000-00805f9b34fb` (Standard BLE Service)

| Characteristic | UUID | Type | Description |
|----------------|------|------|-------------|
| Battery Level | `00002a19-0000-1000-8000-00805f9b34fb` | Read/Notify | Battery percentage (0-100) |
| Firmware Version | `00002a26-0000-1000-8000-00805f9b34fb` | Read | Firmware version string |

### Display Service (Custom)

**Service UUID:** `0000fff0-0000-1000-8000-00805f9b34fb`

| Characteristic | UUID | Type | Description |
|----------------|------|------|-------------|
| Text Display | `0000fff1-0000-1000-8000-00805f9b34fb` | Write | Send text display commands |
| Graphics Display | `0000fff2-0000-1000-8000-00805f9b34fb` | Write | Send graphics commands (future) |
| Clear Display | `0000fff3-0000-1000-8000-00805f9b34fb` | Write | Clear display commands |

### Input Service (Custom)

**Service UUID:** `0000ffe0-0000-1000-8000-00805f9b34fb`

| Characteristic | UUID | Type | Description |
|----------------|------|------|-------------|
| TouchBar Events | `0000ffe1-0000-1000-8000-00805f9b34fb` | Notify | TouchBar gesture events |

### Configuration Service (Custom)

**Service UUID:** `0000ffd0-0000-1000-8000-00805f9b34fb`

| Characteristic | UUID | Type | Description |
|----------------|------|------|-------------|
| Brightness | `0000ffd1-0000-1000-8000-00805f9b34fb` | Write | Set display brightness |
| Settings | `0000ffd2-0000-1000-8000-00805f9b34fb` | Read/Write | Device settings |

## Packet Structure

All commands follow this structure:

```
┌────────┬─────────┬────────┬─────────┬──────────┐
│ Header │ Command │ Length │ Payload │ Checksum │
│ 1 byte │ 1 byte  │ 2 bytes│ N bytes │ 1 byte   │
└────────┴─────────┴────────┴─────────┴──────────┘
```

### Header
- **Value:** `0x02` (Start of frame)
- **Purpose:** Packet synchronization

### Command Type
- **Size:** 1 byte
- **Values:**
  - `0x01` - TEXT
  - `0x02` - CLEAR
  - `0x03` - GRAPHICS
  - `0x04` - BRIGHTNESS
  - `0x05` - REFRESH

### Length
- **Size:** 2 bytes (little-endian)
- **Value:** Payload length in bytes
- **Range:** 0-512

### Payload
- **Size:** Variable (0-512 bytes)
- **Content:** Command-specific data

### Checksum
- **Size:** 1 byte
- **Algorithm:** XOR checksum with seed `0xFF`

```typescript
checksum = 0xFF;
for (byte in payload) {
  checksum ^= byte;
}
```

## Command Details

### TEXT Command (0x01)

Display text at specified coordinates.

**Payload Structure:**
```
┌────┬────┬───────────┬──────────┬──────┐
│ X  │ Y  │ Alignment │ FontSize │ Text │
│ 2B │ 2B │ 1B        │ 1B       │ N    │
└────┴────┴───────────┴──────────┴──────┘
```

**Fields:**
- **X (2 bytes, little-endian):** X coordinate (0-640)
- **Y (2 bytes, little-endian):** Y coordinate (0-200)
- **Alignment (1 byte):**
  - `0x00` - Left
  - `0x01` - Center
  - `0x02` - Right
- **FontSize (1 byte):** Font size in pixels (14-32)
- **Text (N bytes):** UTF-8 encoded text

**Example:**
```
Display "Hello World" at (10, 20), left-aligned, 18px font

Header:    0x02
Command:   0x01
Length:    0x10 0x00  (16 bytes)
Payload:
  X:       0x0A 0x00  (10)
  Y:       0x14 0x00  (20)
  Align:   0x00       (left)
  Font:    0x12       (18)
  Text:    "Hello World" (11 bytes)
Checksum:  [calculated]
```

### CLEAR Command (0x02)

Clear display or specific region.

**Payload Structure (Full Clear):**
```
Empty payload (length = 0)
```

**Payload Structure (Region Clear):**
```
┌────┬────┬───────┬────────┐
│ X  │ Y  │ Width │ Height │
│ 2B │ 2B │ 2B    │ 2B     │
└────┴────┴───────┴────────┘
```

**Fields:**
- **X (2 bytes):** Region X coordinate
- **Y (2 bytes):** Region Y coordinate
- **Width (2 bytes):** Region width
- **Height (2 bytes):** Region height

**Example (Full Clear):**
```
Header:    0x02
Command:   0x02
Length:    0x00 0x00  (0 bytes)
Payload:   (empty)
Checksum:  [calculated]
```

### GRAPHICS Command (0x03)

Display monochrome bitmap.

**Payload Structure:**
```
┌────┬────┬───────┬────────┬─────────────┐
│ X  │ Y  │ Width │ Height │ Bitmap Data │
│ 2B │ 2B │ 2B    │ 2B     │ N bytes     │
└────┴────┴───────┴────────┴─────────────┘
```

**Fields:**
- **X, Y (2 bytes each):** Position
- **Width, Height (2 bytes each):** Dimensions
- **Bitmap Data:** 1 bit per pixel, packed

**Bitmap Format:**
- 1 bit per pixel (1 = white, 0 = black)
- Packed left-to-right, top-to-bottom
- Padded to byte boundary

**Example (8×8 icon):**
```
8×8 = 64 pixels = 8 bytes

Header:    0x02
Command:   0x03
Length:    0x10 0x00  (16 bytes)
Payload:
  X:       0x0A 0x00  (10)
  Y:       0x14 0x00  (20)
  Width:   0x08 0x00  (8)
  Height:  0x08 0x00  (8)
  Data:    [8 bytes of bitmap]
Checksum:  [calculated]
```

### BRIGHTNESS Command (0x04)

Set display brightness.

**Payload Structure:**
```
┌───────┬──────┐
│ Level │ Auto │
│ 1B    │ 1B   │
└───────┴──────┘
```

**Fields:**
- **Level (1 byte):** Brightness 0-100
- **Auto (1 byte):** Auto-brightness enable (0x00 = off, 0x01 = on)

**Example:**
```
Set brightness to 75%, auto off

Header:    0x02
Command:   0x04
Length:    0x02 0x00  (2 bytes)
Payload:
  Level:   0x4B       (75)
  Auto:    0x00       (off)
Checksum:  [calculated]
```

## TouchBar Events

TouchBar events are received via notifications on the TouchBar characteristic.

**Event Structure:**
```
┌───────────┬───────────┐
│ EventType │ Timestamp │
│ 1 byte    │ 4 bytes   │
└───────────┴───────────┘
```

**Event Types:**
- `0x01` - TAP
- `0x02` - DOUBLE_TAP
- `0x03` - TRIPLE_TAP
- `0x04` - PRESS_HOLD
- `0x05` - SWIPE_UP
- `0x06` - SWIPE_DOWN

**Example:**
```
Single tap event

EventType:  0x01
Timestamp:  [4 bytes, Unix timestamp]
```

## Connection Flow

### 1. Discovery

```
App → Start BLE Scan
    → Filter devices by name (contains "Even" or "G2")
    → Display available devices
```

### 2. Connection

```
App → Connect to device
    → Negotiate MTU (request 512 bytes)
    → Discover services and characteristics
    → Subscribe to notifications (TouchBar, Battery)
```

### 3. Initialization

```
App → Read battery level
    → Read firmware version
    → Set initial brightness
    → Clear display
```

### 4. Communication

```
App → Create command
    → Encode to bytes
    → Calculate checksum
    → Write to characteristic
    → Wait for response (if applicable)
```

## Best Practices

### Command Timing

**Issue:** Sending commands too fast can overwhelm the G2.

**Solution:**
- Add 50ms delay between commands
- Batch related commands
- Use incremental updates when possible

```typescript
for (const command of commands) {
  await sendCommand(command);
  await delay(50); // 50ms delay
}
```

### Error Handling

**Connection Lost:**
```typescript
device.onDisconnected((error, device) => {
  // Attempt reconnection
  setTimeout(() => reconnect(device.id), 2000);
});
```

**Write Failures:**
```typescript
try {
  await writeCharacteristic(data);
} catch (error) {
  // Retry with exponential backoff
  await retryWithBackoff(() => writeCharacteristic(data));
}
```

### Battery Optimization

**Minimize Updates:**
- Only update changed regions
- Use display timeout (5 minutes)
- Reduce update frequency when idle

**Monitor Battery:**
```typescript
setInterval(async () => {
  const battery = await getBatteryLevel();
  if (battery < 20) {
    // Reduce update frequency
    setUpdateInterval(60000); // 1 minute
  }
}, 300000); // Check every 5 minutes
```

## Display Constraints

### Resolution
- **Width:** 640 pixels
- **Height:** 200 pixels
- **Aspect Ratio:** 3.2:1

### Color
- **Monochrome:** Green only
- **No grayscale:** 1-bit per pixel

### Refresh Rate
- **20Hz:** No smooth animations
- **Best for:** Static text, simple graphics

### Text Rendering

**Recommended Font Sizes:**
- Small: 14px (for details)
- Medium: 18px (for body text)
- Large: 24px (for titles)
- XLarge: 32px (for emphasis)

**Character Limits:**
- ~50 characters per line (18px font)
- ~8 lines maximum (with spacing)

## Troubleshooting

### Commands Not Working

**Check:**
1. Correct service/characteristic UUIDs
2. Proper packet structure
3. Valid checksum
4. MTU size (ensure ≤512 bytes)

### Display Not Updating

**Check:**
1. BLE connection active
2. Commands sent successfully
3. Coordinates within bounds (0-640, 0-200)
4. Text not empty

### Connection Drops

**Check:**
1. Device in range (<10m)
2. No interference
3. Battery level sufficient
4. Bluetooth enabled

## Protocol Limitations

### Known Issues

1. **No Acknowledgment:** Commands don't return success/failure
2. **No Flow Control:** Can't detect if G2 is busy
3. **Limited Bandwidth:** ~100-200 kbps practical
4. **Firmware Dependent:** Protocol may change with updates

### Workarounds

1. **Add delays** between commands
2. **Implement timeouts** for operations
3. **Use incremental updates** to reduce data
4. **Monitor connection state** actively

## Future Protocol Enhancements

### Wishlist

- Command acknowledgments
- Flow control
- Compressed graphics
- Color support (if hardware allows)
- Bidirectional text input
- Gesture customization

## References

- [i-soxi/even-g2-protocol](https://github.com/i-soxi/even-g2-protocol) - Reverse-engineered protocol
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) - BLE library
- [Bluetooth Core Specification](https://www.bluetooth.com/specifications/specs/) - BLE standards

## Contributing

Found protocol improvements or corrections? Please contribute to:
- This documentation
- [i-soxi/even-g2-protocol](https://github.com/i-soxi/even-g2-protocol)

## Disclaimer

This protocol documentation is based on reverse engineering and community efforts. It is not officially endorsed by Even Realities. Use at your own risk. The protocol may change without notice with firmware updates.
