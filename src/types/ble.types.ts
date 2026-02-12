/**
 * BLE Type Definitions for Even G2 Protocol
 * Based on reverse-engineered protocol from i-soxi/even-g2-protocol
 */

import { Device, Characteristic } from 'react-native-ble-plx';

/**
 * G2 BLE Service and Characteristic UUIDs
 * These are placeholders - replace with actual UUIDs from protocol documentation
 */
export const G2_UUIDS = {
  // Device Information Service
  DEVICE_INFO_SERVICE: '0000180a-0000-1000-8000-00805f9b34fb',
  BATTERY_CHARACTERISTIC: '00002a19-0000-1000-8000-00805f9b34fb',
  FIRMWARE_CHARACTERISTIC: '00002a26-0000-1000-8000-00805f9b34fb',
  
  // Display Service (custom G2 service)
  DISPLAY_SERVICE: '0000fff0-0000-1000-8000-00805f9b34fb',
  TEXT_CHARACTERISTIC: '0000fff1-0000-1000-8000-00805f9b34fb',
  GRAPHICS_CHARACTERISTIC: '0000fff2-0000-1000-8000-00805f9b34fb',
  CLEAR_CHARACTERISTIC: '0000fff3-0000-1000-8000-00805f9b34fb',
  
  // Input Service (TouchBar events)
  INPUT_SERVICE: '0000ffe0-0000-1000-8000-00805f9b34fb',
  TOUCHBAR_CHARACTERISTIC: '0000ffe1-0000-1000-8000-00805f9b34fb',
  
  // Configuration Service
  CONFIG_SERVICE: '0000ffd0-0000-1000-8000-00805f9b34fb',
  BRIGHTNESS_CHARACTERISTIC: '0000ffd1-0000-1000-8000-00805f9b34fb',
  SETTINGS_CHARACTERISTIC: '0000ffd2-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * BLE Connection States
 */
export enum BLEConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  SCANNING = 'SCANNING',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  ERROR = 'ERROR',
}

/**
 * BLE Error Types
 */
export enum BLEErrorType {
  BLUETOOTH_DISABLED = 'BLUETOOTH_DISABLED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  WRITE_FAILED = 'WRITE_FAILED',
  READ_FAILED = 'READ_FAILED',
  SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
  CHARACTERISTIC_NOT_FOUND = 'CHARACTERISTIC_NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * BLE Error
 */
export interface BLEError {
  type: BLEErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
}

/**
 * G2 Device Information
 */
export interface G2DeviceInfo {
  id: string;
  name: string;
  rssi: number;
  batteryLevel?: number;
  firmwareVersion?: string;
  isConnected: boolean;
  lastSeen: Date;
}

/**
 * Text Alignment Options
 */
export enum TextAlignment {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
}

/**
 * Display Command Types
 */
export enum DisplayCommandType {
  TEXT = 0x01,
  CLEAR = 0x02,
  GRAPHICS = 0x03,
  BRIGHTNESS = 0x04,
  REFRESH = 0x05,
}

/**
 * Text Display Command
 */
export interface TextDisplayCommand {
  type: DisplayCommandType.TEXT;
  text: string;
  x: number; // 0-640
  y: number; // 0-200
  alignment: TextAlignment;
  fontSize?: number;
  bold?: boolean;
}

/**
 * Clear Display Command
 */
export interface ClearDisplayCommand {
  type: DisplayCommandType.CLEAR;
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Graphics Display Command (for future use)
 */
export interface GraphicsDisplayCommand {
  type: DisplayCommandType.GRAPHICS;
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array; // Monochrome bitmap data
}

/**
 * Brightness Command
 */
export interface BrightnessCommand {
  type: DisplayCommandType.BRIGHTNESS;
  level: number; // 0-100
  auto?: boolean;
}

/**
 * Union of all display commands
 */
export type DisplayCommand =
  | TextDisplayCommand
  | ClearDisplayCommand
  | GraphicsDisplayCommand
  | BrightnessCommand;

/**
 * BLE Command Packet Structure
 * Based on typical BLE protocol structure
 */
export interface BLECommandPacket {
  header: number; // Start byte (e.g., 0x02)
  commandType: DisplayCommandType;
  payloadLength: number;
  payload: Uint8Array;
  checksum: number;
}

/**
 * TouchBar Event Types
 */
export enum TouchBarEventType {
  TAP = 'TAP',
  DOUBLE_TAP = 'DOUBLE_TAP',
  TRIPLE_TAP = 'TRIPLE_TAP',
  PRESS_HOLD = 'PRESS_HOLD',
  SWIPE_UP = 'SWIPE_UP',
  SWIPE_DOWN = 'SWIPE_DOWN',
}

/**
 * TouchBar Event
 */
export interface TouchBarEvent {
  type: TouchBarEventType;
  timestamp: Date;
}

/**
 * BLE Manager Configuration
 */
export interface BLEManagerConfig {
  scanTimeout: number; // ms
  connectionTimeout: number; // ms
  reconnectDelay: number; // ms
  maxReconnectAttempts: number;
  enableAutoReconnect: boolean;
  rssiThreshold: number; // Minimum RSSI for connection
}

/**
 * BLE Connection Options
 */
export interface BLEConnectionOptions {
  timeout?: number;
  autoConnect?: boolean;
  requestMTU?: number; // Maximum Transmission Unit
}

/**
 * BLE Scan Options
 */
export interface BLEScanOptions {
  timeout?: number;
  allowDuplicates?: boolean;
  scanMode?: 'lowPower' | 'balanced' | 'lowLatency';
}

/**
 * Device Discovery Callback
 */
export type DeviceDiscoveryCallback = (device: G2DeviceInfo) => void;

/**
 * Connection State Change Callback
 */
export type ConnectionStateCallback = (state: BLEConnectionState) => void;

/**
 * Error Callback
 */
export type ErrorCallback = (error: BLEError) => void;

/**
 * TouchBar Event Callback
 */
export type TouchBarEventCallback = (event: TouchBarEvent) => void;

/**
 * BLE Manager Interface
 */
export interface IBLEManager {
  // Connection Management
  initialize(): Promise<void>;
  startScan(options?: BLEScanOptions): Promise<void>;
  stopScan(): void;
  connect(deviceId: string, options?: BLEConnectionOptions): Promise<void>;
  disconnect(): Promise<void>;
  
  // Device Information
  getConnectedDevice(): G2DeviceInfo | null;
  getBatteryLevel(): Promise<number>;
  getFirmwareVersion(): Promise<string>;
  
  // Display Commands
  sendCommand(command: DisplayCommand): Promise<void>;
  clearDisplay(region?: ClearDisplayCommand['region']): Promise<void>;
  setBrightness(level: number, auto?: boolean): Promise<void>;
  
  // Event Listeners
  onDeviceDiscovered(callback: DeviceDiscoveryCallback): void;
  onConnectionStateChange(callback: ConnectionStateCallback): void;
  onError(callback: ErrorCallback): void;
  onTouchBarEvent(callback: TouchBarEventCallback): void;
  
  // State
  getConnectionState(): BLEConnectionState;
  isConnected(): boolean;
}

/**
 * Protocol Encoder Interface
 */
export interface IProtocolEncoder {
  encodeTextCommand(command: TextDisplayCommand): Uint8Array;
  encodeClearCommand(command: ClearDisplayCommand): Uint8Array;
  encodeGraphicsCommand(command: GraphicsDisplayCommand): Uint8Array;
  encodeBrightnessCommand(command: BrightnessCommand): Uint8Array;
  calculateChecksum(data: Uint8Array): number;
}

/**
 * Protocol Decoder Interface
 */
export interface IProtocolDecoder {
  decodeTouchBarEvent(data: Uint8Array): TouchBarEvent;
  decodeBatteryLevel(data: Uint8Array): number;
  decodeFirmwareVersion(data: Uint8Array): string;
  validateChecksum(packet: Uint8Array): boolean;
}
