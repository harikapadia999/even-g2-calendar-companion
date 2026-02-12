/**
 * BLE Manager
 * Handles all Bluetooth Low Energy communication with Even G2 glasses
 */

import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  IBLEManager,
  BLEConnectionState,
  BLEError,
  BLEErrorType,
  G2DeviceInfo,
  DisplayCommand,
  BLEManagerConfig,
  BLEConnectionOptions,
  BLEScanOptions,
  DeviceDiscoveryCallback,
  ConnectionStateCallback,
  ErrorCallback,
  TouchBarEventCallback,
  G2_UUIDS,
} from '@/types/ble.types';
import { g2Encoder, g2Decoder } from './G2Protocol';

/**
 * Default BLE Manager Configuration
 */
const DEFAULT_CONFIG: BLEManagerConfig = {
  scanTimeout: 10000,
  connectionTimeout: 5000,
  reconnectDelay: 2000,
  maxReconnectAttempts: 5,
  enableAutoReconnect: true,
  rssiThreshold: -80,
};

/**
 * BLE Manager Implementation
 */
export class G2BLEManager implements IBLEManager {
  private bleManager: BleManager;
  private config: BLEManagerConfig;
  private connectedDevice: Device | null = null;
  private connectionState: BLEConnectionState = BLEConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private scanSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;
  
  // Callbacks
  private deviceDiscoveryCallbacks: DeviceDiscoveryCallback[] = [];
  private connectionStateCallbacks: ConnectionStateCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private touchBarCallbacks: TouchBarEventCallback[] = [];

  constructor(config: Partial<BLEManagerConfig> = {}) {
    this.bleManager = new BleManager();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize BLE Manager
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();
      
      // Check Bluetooth state
      const state = await this.bleManager.state();
      if (state !== State.PoweredOn) {
        throw this.createError(
          BLEErrorType.BLUETOOTH_DISABLED,
          'Bluetooth is not enabled'
        );
      }
      
      // Monitor Bluetooth state changes
      this.bleManager.onStateChange((state) => {
        if (state === State.PoweredOff) {
          this.handleError(
            this.createError(BLEErrorType.BLUETOOTH_DISABLED, 'Bluetooth was disabled')
          );
          this.disconnect();
        }
      }, true);
      
      console.log('BLE Manager initialized');
    } catch (error) {
      throw this.createError(
        BLEErrorType.UNKNOWN,
        'Failed to initialize BLE Manager',
        error as Error
      );
    }
  }

  /**
   * Start scanning for G2 devices
   */
  async startScan(options: BLEScanOptions = {}): Promise<void> {
    try {
      this.updateConnectionState(BLEConnectionState.SCANNING);
      
      const timeout = options.timeout || this.config.scanTimeout;
      
      // Stop any existing scan
      this.stopScan();
      
      console.log('Starting BLE scan...');
      
      this.scanSubscription = this.bleManager.onDeviceDisconnected(
        null,
        (error, device) => {
          if (error) {
            console.error('Device disconnected with error:', error);
            return;
          }
          
          // Filter for G2 devices (adjust name filter as needed)
          if (device && this.isG2Device(device)) {
            const deviceInfo = this.mapDeviceInfo(device);
            this.notifyDeviceDiscovered(deviceInfo);
          }
        }
      );
      
      // Start scanning
      this.bleManager.startDeviceScan(
        null, // Service UUIDs (null = scan all)
        { allowDuplicates: options.allowDuplicates || false },
        (error, device) => {
          if (error) {
            this.handleError(
              this.createError(BLEErrorType.UNKNOWN, 'Scan error', error)
            );
            return;
          }
          
          if (device && this.isG2Device(device)) {
            const deviceInfo = this.mapDeviceInfo(device);
            this.notifyDeviceDiscovered(deviceInfo);
          }
        }
      );
      
      // Auto-stop scan after timeout
      setTimeout(() => {
        this.stopScan();
        if (this.connectionState === BLEConnectionState.SCANNING) {
          this.updateConnectionState(BLEConnectionState.DISCONNECTED);
        }
      }, timeout);
    } catch (error) {
      throw this.createError(
        BLEErrorType.UNKNOWN,
        'Failed to start scan',
        error as Error
      );
    }
  }

  /**
   * Stop scanning
   */
  stopScan(): void {
    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }
    this.bleManager.stopDeviceScan();
    console.log('BLE scan stopped');
  }

  /**
   * Connect to G2 device
   */
  async connect(deviceId: string, options: BLEConnectionOptions = {}): Promise<void> {
    try {
      this.updateConnectionState(BLEConnectionState.CONNECTING);
      this.stopScan();
      
      const timeout = options.timeout || this.config.connectionTimeout;
      
      console.log(`Connecting to device: ${deviceId}`);
      
      // Connect with timeout
      const device = await Promise.race([
        this.bleManager.connectToDevice(deviceId, {
          autoConnect: options.autoConnect,
          requestMTU: options.requestMTU || 512,
        }),
        this.createTimeout(timeout, 'Connection timeout'),
      ]);
      
      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      this.reconnectAttempts = 0;
      this.updateConnectionState(BLEConnectionState.CONNECTED);
      
      // Monitor disconnection
      this.connectionSubscription = device.onDisconnected((error, device) => {
        console.log('Device disconnected:', device?.id);
        this.handleDisconnection(error);
      });
      
      // Subscribe to TouchBar events
      await this.subscribeTouchBarEvents();
      
      console.log('Connected to G2 device');
    } catch (error) {
      this.updateConnectionState(BLEConnectionState.ERROR);
      throw this.createError(
        BLEErrorType.CONNECTION_FAILED,
        'Failed to connect to device',
        error as Error
      );
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connectionSubscription) {
        this.connectionSubscription.remove();
        this.connectionSubscription = null;
      }
      
      if (this.connectedDevice) {
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
        this.connectedDevice = null;
      }
      
      this.updateConnectionState(BLEConnectionState.DISCONNECTED);
      console.log('Disconnected from device');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  /**
   * Get connected device info
   */
  getConnectedDevice(): G2DeviceInfo | null {
    if (!this.connectedDevice) {
      return null;
    }
    return this.mapDeviceInfo(this.connectedDevice);
  }

  /**
   * Get battery level
   */
  async getBatteryLevel(): Promise<number> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    
    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        G2_UUIDS.DEVICE_INFO_SERVICE,
        G2_UUIDS.BATTERY_CHARACTERISTIC
      );
      
      if (!characteristic.value) {
        throw new Error('No battery data received');
      }
      
      const data = this.base64ToUint8Array(characteristic.value);
      return g2Decoder.decodeBatteryLevel(data);
    } catch (error) {
      throw this.createError(
        BLEErrorType.READ_FAILED,
        'Failed to read battery level',
        error as Error
      );
    }
  }

  /**
   * Get firmware version
   */
  async getFirmwareVersion(): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    
    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        G2_UUIDS.DEVICE_INFO_SERVICE,
        G2_UUIDS.FIRMWARE_CHARACTERISTIC
      );
      
      if (!characteristic.value) {
        throw new Error('No firmware data received');
      }
      
      const data = this.base64ToUint8Array(characteristic.value);
      return g2Decoder.decodeFirmwareVersion(data);
    } catch (error) {
      throw this.createError(
        BLEErrorType.READ_FAILED,
        'Failed to read firmware version',
        error as Error
      );
    }
  }

  /**
   * Send display command
   */
  async sendCommand(command: DisplayCommand): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    
    try {
      let encodedCommand: Uint8Array;
      
      switch (command.type) {
        case 0x01: // TEXT
          encodedCommand = g2Encoder.encodeTextCommand(command);
          break;
        case 0x02: // CLEAR
          encodedCommand = g2Encoder.encodeClearCommand(command);
          break;
        case 0x03: // GRAPHICS
          encodedCommand = g2Encoder.encodeGraphicsCommand(command);
          break;
        case 0x04: // BRIGHTNESS
          encodedCommand = g2Encoder.encodeBrightnessCommand(command);
          break;
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
      
      const base64Data = this.uint8ArrayToBase64(encodedCommand);
      
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        G2_UUIDS.DISPLAY_SERVICE,
        G2_UUIDS.TEXT_CHARACTERISTIC,
        base64Data
      );
    } catch (error) {
      throw this.createError(
        BLEErrorType.WRITE_FAILED,
        'Failed to send command',
        error as Error
      );
    }
  }

  /**
   * Clear display
   */
  async clearDisplay(region?: { x: number; y: number; width: number; height: number }): Promise<void> {
    await this.sendCommand({
      type: 0x02,
      region,
    });
  }

  /**
   * Set brightness
   */
  async setBrightness(level: number, auto: boolean = false): Promise<void> {
    await this.sendCommand({
      type: 0x04,
      level,
      auto,
    });
  }

  /**
   * Subscribe to TouchBar events
   */
  private async subscribeTouchBarEvents(): Promise<void> {
    if (!this.connectedDevice) {
      return;
    }
    
    try {
      await this.connectedDevice.monitorCharacteristicForService(
        G2_UUIDS.INPUT_SERVICE,
        G2_UUIDS.TOUCHBAR_CHARACTERISTIC,
        (error, characteristic) => {
          if (error) {
            console.error('TouchBar monitoring error:', error);
            return;
          }
          
          if (characteristic?.value) {
            const data = this.base64ToUint8Array(characteristic.value);
            const event = g2Decoder.decodeTouchBarEvent(data);
            this.notifyTouchBarEvent(event);
          }
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to TouchBar events:', error);
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(error: any): void {
    this.connectedDevice = null;
    this.updateConnectionState(BLEConnectionState.DISCONNECTED);
    
    if (this.config.enableAutoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        // Reconnection logic would go here
        // For now, just notify error
        this.handleError(
          this.createError(BLEErrorType.CONNECTION_LOST, 'Connection lost')
        );
      }, this.config.reconnectDelay);
    } else {
      this.handleError(
        this.createError(BLEErrorType.CONNECTION_LOST, 'Connection lost')
      );
    }
  }

  /**
   * Event listener registration
   */
  onDeviceDiscovered(callback: DeviceDiscoveryCallback): void {
    this.deviceDiscoveryCallbacks.push(callback);
  }

  onConnectionStateChange(callback: ConnectionStateCallback): void {
    this.connectionStateCallbacks.push(callback);
  }

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  onTouchBarEvent(callback: TouchBarEventCallback): void {
    this.touchBarCallbacks.push(callback);
  }

  /**
   * Get connection state
   */
  getConnectionState(): BLEConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === BLEConnectionState.CONNECTED;
  }

  /**
   * Utility Methods
   */
  
  private isG2Device(device: Device): boolean {
    // Adjust this filter based on actual G2 device naming
    return device.name?.toLowerCase().includes('even') || 
           device.name?.toLowerCase().includes('g2') ||
           false;
  }

  private mapDeviceInfo(device: Device): G2DeviceInfo {
    return {
      id: device.id,
      name: device.name || 'Unknown',
      rssi: device.rssi || -100,
      isConnected: device.id === this.connectedDevice?.id,
      lastSeen: new Date(),
    };
  }

  private updateConnectionState(state: BLEConnectionState): void {
    this.connectionState = state;
    this.notifyConnectionStateChange(state);
  }

  private createError(type: BLEErrorType, message: string, originalError?: Error): BLEError {
    return {
      type,
      message,
      originalError,
      timestamp: new Date(),
    };
  }

  private handleError(error: BLEError): void {
    console.error('BLE Error:', error);
    this.notifyError(error);
  }

  private notifyDeviceDiscovered(device: G2DeviceInfo): void {
    this.deviceDiscoveryCallbacks.forEach(cb => cb(device));
  }

  private notifyConnectionStateChange(state: BLEConnectionState): void {
    this.connectionStateCallbacks.forEach(cb => cb(state));
  }

  private notifyError(error: BLEError): void {
    this.errorCallbacks.forEach(cb => cb(error));
  }

  private notifyTouchBarEvent(event: any): void {
    this.touchBarCallbacks.forEach(cb => cb(event));
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private createTimeout<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;
      
      if (apiLevel >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          throw this.createError(
            BLEErrorType.PERMISSION_DENIED,
            'Bluetooth permissions not granted'
          );
        }
      } else {
        // Android 11 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw this.createError(
            BLEErrorType.PERMISSION_DENIED,
            'Location permission not granted'
          );
        }
      }
    }
    // iOS permissions are handled automatically by the system
  }
}

/**
 * Export singleton instance
 */
export const bleManager = new G2BLEManager();
