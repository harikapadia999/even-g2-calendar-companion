/**
 * Even G2 BLE Protocol Implementation
 * Based on reverse-engineered protocol from i-soxi/even-g2-protocol
 * 
 * Protocol Structure:
 * [Header(1)] [Command(1)] [Length(2)] [Payload(N)] [Checksum(1)]
 */

import {
  DisplayCommand,
  TextDisplayCommand,
  ClearDisplayCommand,
  GraphicsDisplayCommand,
  BrightnessCommand,
  DisplayCommandType,
  TextAlignment,
  BLECommandPacket,
  TouchBarEvent,
  TouchBarEventType,
  IProtocolEncoder,
  IProtocolDecoder,
} from '@/types/ble.types';

/**
 * Protocol Constants
 */
const PROTOCOL_CONSTANTS = {
  HEADER: 0x02, // Start of frame
  FOOTER: 0x03, // End of frame
  MAX_PAYLOAD_SIZE: 512, // Maximum payload size in bytes
  CHECKSUM_SEED: 0xFF,
} as const;

/**
 * G2 Protocol Encoder
 * Converts high-level commands to BLE byte arrays
 */
export class G2ProtocolEncoder implements IProtocolEncoder {
  /**
   * Encode text display command
   */
  encodeTextCommand(command: TextDisplayCommand): Uint8Array {
    const textBytes = this.stringToBytes(command.text);
    const payloadSize = 6 + textBytes.length; // x(2) + y(2) + alignment(1) + fontSize(1) + text
    
    const payload = new Uint8Array(payloadSize);
    let offset = 0;
    
    // X coordinate (2 bytes, little-endian)
    payload[offset++] = command.x & 0xFF;
    payload[offset++] = (command.x >> 8) & 0xFF;
    
    // Y coordinate (2 bytes, little-endian)
    payload[offset++] = command.y & 0xFF;
    payload[offset++] = (command.y >> 8) & 0xFF;
    
    // Alignment (1 byte)
    payload[offset++] = this.encodeAlignment(command.alignment);
    
    // Font size (1 byte)
    payload[offset++] = command.fontSize || 18;
    
    // Text data
    payload.set(textBytes, offset);
    
    return this.buildPacket(DisplayCommandType.TEXT, payload);
  }

  /**
   * Encode clear display command
   */
  encodeClearCommand(command: ClearDisplayCommand): Uint8Array {
    if (command.region) {
      // Clear specific region
      const payload = new Uint8Array(8);
      let offset = 0;
      
      payload[offset++] = command.region.x & 0xFF;
      payload[offset++] = (command.region.x >> 8) & 0xFF;
      payload[offset++] = command.region.y & 0xFF;
      payload[offset++] = (command.region.y >> 8) & 0xFF;
      payload[offset++] = command.region.width & 0xFF;
      payload[offset++] = (command.region.width >> 8) & 0xFF;
      payload[offset++] = command.region.height & 0xFF;
      payload[offset++] = (command.region.height >> 8) & 0xFF;
      
      return this.buildPacket(DisplayCommandType.CLEAR, payload);
    } else {
      // Clear entire display
      return this.buildPacket(DisplayCommandType.CLEAR, new Uint8Array(0));
    }
  }

  /**
   * Encode graphics display command
   */
  encodeGraphicsCommand(command: GraphicsDisplayCommand): Uint8Array {
    const headerSize = 8; // x(2) + y(2) + width(2) + height(2)
    const payload = new Uint8Array(headerSize + command.data.length);
    let offset = 0;
    
    // Position and dimensions
    payload[offset++] = command.x & 0xFF;
    payload[offset++] = (command.x >> 8) & 0xFF;
    payload[offset++] = command.y & 0xFF;
    payload[offset++] = (command.y >> 8) & 0xFF;
    payload[offset++] = command.width & 0xFF;
    payload[offset++] = (command.width >> 8) & 0xFF;
    payload[offset++] = command.height & 0xFF;
    payload[offset++] = (command.height >> 8) & 0xFF;
    
    // Bitmap data
    payload.set(command.data, offset);
    
    return this.buildPacket(DisplayCommandType.GRAPHICS, payload);
  }

  /**
   * Encode brightness command
   */
  encodeBrightnessCommand(command: BrightnessCommand): Uint8Array {
    const payload = new Uint8Array(2);
    payload[0] = Math.max(0, Math.min(100, command.level)); // Clamp 0-100
    payload[1] = command.auto ? 0x01 : 0x00;
    
    return this.buildPacket(DisplayCommandType.BRIGHTNESS, payload);
  }

  /**
   * Calculate checksum for data
   * Simple XOR checksum with seed
   */
  calculateChecksum(data: Uint8Array): number {
    let checksum = PROTOCOL_CONSTANTS.CHECKSUM_SEED;
    for (let i = 0; i < data.length; i++) {
      checksum ^= data[i];
    }
    return checksum;
  }

  /**
   * Build complete BLE packet
   */
  private buildPacket(commandType: DisplayCommandType, payload: Uint8Array): Uint8Array {
    const packetSize = 5 + payload.length; // header(1) + cmd(1) + len(2) + payload + checksum(1)
    const packet = new Uint8Array(packetSize);
    let offset = 0;
    
    // Header
    packet[offset++] = PROTOCOL_CONSTANTS.HEADER;
    
    // Command type
    packet[offset++] = commandType;
    
    // Payload length (2 bytes, little-endian)
    packet[offset++] = payload.length & 0xFF;
    packet[offset++] = (payload.length >> 8) & 0xFF;
    
    // Payload
    packet.set(payload, offset);
    offset += payload.length;
    
    // Checksum (calculated on everything except header and checksum itself)
    const checksumData = packet.slice(1, offset);
    packet[offset] = this.calculateChecksum(checksumData);
    
    return packet;
  }

  /**
   * Convert string to UTF-8 bytes
   */
  private stringToBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * Encode text alignment to byte value
   */
  private encodeAlignment(alignment: TextAlignment): number {
    switch (alignment) {
      case TextAlignment.LEFT:
        return 0x00;
      case TextAlignment.CENTER:
        return 0x01;
      case TextAlignment.RIGHT:
        return 0x02;
      default:
        return 0x00;
    }
  }
}

/**
 * G2 Protocol Decoder
 * Converts BLE byte arrays to high-level events/data
 */
export class G2ProtocolDecoder implements IProtocolDecoder {
  /**
   * Decode TouchBar event from BLE notification
   */
  decodeTouchBarEvent(data: Uint8Array): TouchBarEvent {
    if (data.length < 2) {
      throw new Error('Invalid TouchBar event data');
    }
    
    const eventType = this.decodeEventType(data[0]);
    const timestamp = new Date();
    
    return {
      type: eventType,
      timestamp,
    };
  }

  /**
   * Decode battery level from BLE characteristic
   */
  decodeBatteryLevel(data: Uint8Array): number {
    if (data.length < 1) {
      throw new Error('Invalid battery level data');
    }
    
    // Battery level is typically a single byte (0-100)
    return Math.max(0, Math.min(100, data[0]));
  }

  /**
   * Decode firmware version from BLE characteristic
   */
  decodeFirmwareVersion(data: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(data).trim();
  }

  /**
   * Validate packet checksum
   */
  validateChecksum(packet: Uint8Array): boolean {
    if (packet.length < 5) {
      return false;
    }
    
    const checksumIndex = packet.length - 1;
    const receivedChecksum = packet[checksumIndex];
    
    // Calculate checksum on data (excluding header and checksum)
    const checksumData = packet.slice(1, checksumIndex);
    const encoder = new G2ProtocolEncoder();
    const calculatedChecksum = encoder.calculateChecksum(checksumData);
    
    return receivedChecksum === calculatedChecksum;
  }

  /**
   * Decode TouchBar event type from byte
   */
  private decodeEventType(byte: number): TouchBarEventType {
    switch (byte) {
      case 0x01:
        return TouchBarEventType.TAP;
      case 0x02:
        return TouchBarEventType.DOUBLE_TAP;
      case 0x03:
        return TouchBarEventType.TRIPLE_TAP;
      case 0x04:
        return TouchBarEventType.PRESS_HOLD;
      case 0x05:
        return TouchBarEventType.SWIPE_UP;
      case 0x06:
        return TouchBarEventType.SWIPE_DOWN;
      default:
        return TouchBarEventType.TAP;
    }
  }
}

/**
 * Protocol Utilities
 */
export class G2ProtocolUtils {
  /**
   * Validate command before encoding
   */
  static validateCommand(command: DisplayCommand): boolean {
    switch (command.type) {
      case DisplayCommandType.TEXT:
        return this.validateTextCommand(command);
      case DisplayCommandType.CLEAR:
        return this.validateClearCommand(command);
      case DisplayCommandType.GRAPHICS:
        return this.validateGraphicsCommand(command);
      case DisplayCommandType.BRIGHTNESS:
        return this.validateBrightnessCommand(command);
      default:
        return false;
    }
  }

  /**
   * Validate text command
   */
  private static validateTextCommand(command: TextDisplayCommand): boolean {
    return (
      command.x >= 0 &&
      command.x < 640 &&
      command.y >= 0 &&
      command.y < 200 &&
      command.text.length > 0 &&
      command.text.length <= 256
    );
  }

  /**
   * Validate clear command
   */
  private static validateClearCommand(command: ClearDisplayCommand): boolean {
    if (!command.region) {
      return true; // Full clear is always valid
    }
    
    return (
      command.region.x >= 0 &&
      command.region.y >= 0 &&
      command.region.width > 0 &&
      command.region.height > 0 &&
      command.region.x + command.region.width <= 640 &&
      command.region.y + command.region.height <= 200
    );
  }

  /**
   * Validate graphics command
   */
  private static validateGraphicsCommand(command: GraphicsDisplayCommand): boolean {
    const expectedDataSize = Math.ceil((command.width * command.height) / 8); // 1 bit per pixel
    
    return (
      command.x >= 0 &&
      command.y >= 0 &&
      command.width > 0 &&
      command.height > 0 &&
      command.x + command.width <= 640 &&
      command.y + command.height <= 200 &&
      command.data.length === expectedDataSize
    );
  }

  /**
   * Validate brightness command
   */
  private static validateBrightnessCommand(command: BrightnessCommand): boolean {
    return command.level >= 0 && command.level <= 100;
  }

  /**
   * Split large text into multiple commands if needed
   */
  static splitTextCommand(command: TextDisplayCommand, maxLength: number = 128): TextDisplayCommand[] {
    if (command.text.length <= maxLength) {
      return [command];
    }
    
    const commands: TextDisplayCommand[] = [];
    const lines = this.wrapText(command.text, maxLength);
    const lineHeight = (command.fontSize || 18) + 4; // Font size + spacing
    
    lines.forEach((line, index) => {
      commands.push({
        ...command,
        text: line,
        y: command.y + (index * lineHeight),
      });
    });
    
    return commands;
  }

  /**
   * Simple text wrapping
   */
  private static wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
}

/**
 * Export singleton instances
 */
export const g2Encoder = new G2ProtocolEncoder();
export const g2Decoder = new G2ProtocolDecoder();
