/**
 * App Coordinator
 * Orchestrates BLE, Calendar, and Display services
 * This is the main integration layer that makes everything work together
 */

import { bleManager } from './ble/BLEManager';
import { calendarService } from './calendar/CalendarService';
import { displayRenderer } from './display/DisplayRenderer';
import {
  BLEConnectionState,
  DisplayCommandType,
  TextAlignment,
} from '@/types/ble.types';
import { NextEventInfo, CalendarSyncStatus } from '@/types/calendar.types';
import { DisplayUpdateType } from '@/types/display.types';

/**
 * App Coordinator Configuration
 */
export interface AppCoordinatorConfig {
  autoConnectDevice?: boolean;
  autoSyncCalendar?: boolean;
  updateInterval?: number; // ms
  displayTimeout?: number; // ms
}

/**
 * App Coordinator State
 */
export interface AppCoordinatorState {
  isInitialized: boolean;
  bleConnected: boolean;
  calendarSynced: boolean;
  currentEvent: NextEventInfo | null;
  lastUpdate: Date | null;
  error: string | null;
}

/**
 * App Coordinator
 * Main orchestration layer
 */
export class AppCoordinator {
  private config: AppCoordinatorConfig;
  private state: AppCoordinatorState;
  private updateInterval: NodeJS.Timeout | null = null;
  private displayTimeout: NodeJS.Timeout | null = null;

  constructor(config: AppCoordinatorConfig = {}) {
    this.config = {
      autoConnectDevice: false,
      autoSyncCalendar: true,
      updateInterval: 30000, // 30 seconds
      displayTimeout: 300000, // 5 minutes
      ...config,
    };

    this.state = {
      isInitialized: false,
      bleConnected: false,
      calendarSynced: false,
      currentEvent: null,
      lastUpdate: null,
      error: null,
    };
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing App Coordinator...');

      // Initialize BLE Manager
      await bleManager.initialize();
      this.setupBLEListeners();

      // Initialize Calendar Service
      await calendarService.initialize({
        updateInterval: this.config.updateInterval || 30000,
        lookaheadDays: 7,
        enableGoogleCalendar: true,
        enableNativeCalendar: true,
        autoSync: this.config.autoSyncCalendar || true,
        syncOnAppStart: true,
      });
      this.setupCalendarListeners();

      // Initialize Display Renderer
      displayRenderer.initialize({
        defaultFontSize: 18,
        lineHeight: 22,
        letterSpacing: 1,
        maxCharsPerLine: 50,
        maxLines: 8,
        enableAntialiasing: false,
      });

      this.state.isInitialized = true;
      console.log('App Coordinator initialized successfully');

      // Start auto-update loop
      this.startAutoUpdate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.error = errorMessage;
      console.error('Failed to initialize App Coordinator:', error);
      throw error;
    }
  }

  /**
   * Connect to G2 device
   */
  async connectToDevice(deviceId: string): Promise<void> {
    try {
      await bleManager.connect(deviceId, {
        timeout: 5000,
        autoConnect: true,
        requestMTU: 512,
      });

      this.state.bleConnected = true;
      console.log('Connected to G2 device');

      // Display initial event if available
      if (this.state.currentEvent) {
        await this.updateDisplay(this.state.currentEvent);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      this.state.error = errorMessage;
      console.error('Failed to connect to device:', error);
      throw error;
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    await bleManager.disconnect();
    this.state.bleConnected = false;
    console.log('Disconnected from device');
  }

  /**
   * Scan for G2 devices
   */
  async scanForDevices(): Promise<void> {
    await bleManager.startScan({
      timeout: 10000,
      allowDuplicates: false,
    });
  }

  /**
   * Stop scanning
   */
  stopScan(): void {
    bleManager.stopScan();
  }

  /**
   * Sync calendars manually
   */
  async syncCalendars(): Promise<void> {
    try {
      const result = await calendarService.syncCalendars();
      this.state.calendarSynced = result.status === CalendarSyncStatus.SUCCESS;
      console.log(`Calendar sync: ${result.status}, ${result.eventsCount} events`);
    } catch (error) {
      console.error('Calendar sync failed:', error);
      throw error;
    }
  }

  /**
   * Update display with next event
   */
  private async updateDisplay(eventInfo: NextEventInfo): Promise<void> {
    if (!bleManager.isConnected()) {
      console.log('Not connected to device, skipping display update');
      return;
    }

    try {
      // Clear display first
      await bleManager.clearDisplay();

      // Create layout
      const layout = displayRenderer.createCalendarLayout(
        eventInfo.displayText.title,
        eventInfo.displayText.timeRange,
        eventInfo.displayText.location,
        eventInfo.displayText.timeUntil,
        eventInfo.displayText.duration
      );

      // Render layout
      const update = displayRenderer.renderLayout(layout);

      // Send commands to G2
      for (const element of update.elements) {
        if (!element.visible) continue;

        await bleManager.sendCommand({
          type: DisplayCommandType.TEXT,
          text: element.content,
          x: element.region.x,
          y: element.region.y,
          alignment: this.mapAlignment(element.style.alignment),
          fontSize: element.style.fontSize,
          bold: element.style.bold,
        });

        // Small delay between commands to avoid overwhelming BLE
        await this.delay(50);
      }

      this.state.lastUpdate = new Date();
      console.log('Display updated successfully');

      // Set display timeout
      this.resetDisplayTimeout();
    } catch (error) {
      console.error('Failed to update display:', error);
      throw error;
    }
  }

  /**
   * Clear display
   */
  async clearDisplay(): Promise<void> {
    if (bleManager.isConnected()) {
      await bleManager.clearDisplay();
      console.log('Display cleared');
    }
  }

  /**
   * Get current state
   */
  getState(): AppCoordinatorState {
    return { ...this.state };
  }

  /**
   * Setup BLE event listeners
   */
  private setupBLEListeners(): void {
    bleManager.onConnectionStateChange((state) => {
      console.log('BLE connection state:', state);
      this.state.bleConnected = state === BLEConnectionState.CONNECTED;

      if (state === BLEConnectionState.CONNECTED && this.state.currentEvent) {
        // Update display when connected
        this.updateDisplay(this.state.currentEvent).catch(console.error);
      }
    });

    bleManager.onError((error) => {
      console.error('BLE error:', error);
      this.state.error = error.message;
    });

    bleManager.onTouchBarEvent((event) => {
      console.log('TouchBar event:', event);
      // Handle TouchBar interactions (future feature)
    });
  }

  /**
   * Setup Calendar event listeners
   */
  private setupCalendarListeners(): void {
    calendarService.onNextEventChange((eventInfo) => {
      console.log('Next event changed:', eventInfo?.event.title || 'None');
      this.state.currentEvent = eventInfo;

      if (eventInfo && bleManager.isConnected()) {
        this.updateDisplay(eventInfo).catch(console.error);
      } else if (!eventInfo && bleManager.isConnected()) {
        // No upcoming events, clear display
        this.clearDisplay().catch(console.error);
      }
    });

    calendarService.onSyncStatusChange((status) => {
      console.log('Calendar sync status:', status);
      this.state.calendarSynced = status === CalendarSyncStatus.SUCCESS;
    });

    calendarService.onError((error) => {
      console.error('Calendar error:', error);
      this.state.error = error.message;
    });
  }

  /**
   * Start auto-update loop
   */
  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        // Refresh next event
        const nextEvent = await calendarService.getNextEvent();

        // Update display if event changed and we're connected
        if (nextEvent && bleManager.isConnected()) {
          await this.updateDisplay(nextEvent);
        }
      } catch (error) {
        console.error('Auto-update error:', error);
      }
    }, this.config.updateInterval || 30000);

    console.log('Auto-update started');
  }

  /**
   * Stop auto-update loop
   */
  private stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Auto-update stopped');
    }
  }

  /**
   * Reset display timeout
   */
  private resetDisplayTimeout(): void {
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
    }

    this.displayTimeout = setTimeout(async () => {
      console.log('Display timeout reached, clearing display');
      await this.clearDisplay();
    }, this.config.displayTimeout || 300000);
  }

  /**
   * Utility: Map alignment
   */
  private mapAlignment(alignment?: 'left' | 'center' | 'right'): TextAlignment {
    switch (alignment) {
      case 'center':
        return TextAlignment.CENTER;
      case 'right':
        return TextAlignment.RIGHT;
      default:
        return TextAlignment.LEFT;
    }
  }

  /**
   * Utility: Delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    this.stopAutoUpdate();
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
    }
    await this.disconnect();
    console.log('App Coordinator destroyed');
  }
}

/**
 * Export singleton instance
 */
export const appCoordinator = new AppCoordinator();
