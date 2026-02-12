/**
 * Calendar Service
 * Manages calendar integration, event fetching, and next event detection
 */

import RNCalendarEvents from 'react-native-calendar-events';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  ICalendarService,
  CalendarEvent,
  CalendarSource,
  CalendarType,
  NextEventInfo,
  CalendarServiceConfig,
  CalendarFilterOptions,
  CalendarSyncResult,
  CalendarSyncStatus,
  CalendarError,
  CalendarErrorType,
  EventStatus,
} from '@/types/calendar.types';
import { formatNextEventDisplay } from '@/utils/dateUtils';

/**
 * Default Configuration
 */
const DEFAULT_CONFIG: CalendarServiceConfig = {
  updateInterval: 30000, // 30 seconds
  lookaheadDays: 7,
  enableGoogleCalendar: true,
  enableNativeCalendar: true,
  autoSync: true,
  syncOnAppStart: true,
};

/**
 * Calendar Service Implementation
 */
export class CalendarService implements ICalendarService {
  private config: CalendarServiceConfig;
  private calendars: CalendarSource[] = [];
  private events: CalendarEvent[] = [];
  private currentNextEvent: NextEventInfo | null = null;
  private lastSyncTime: Date | null = null;
  private syncStatus: CalendarSyncStatus = CalendarSyncStatus.IDLE;
  private updateInterval: NodeJS.Timeout | null = null;
  
  // Callbacks
  private nextEventCallbacks: Array<(event: NextEventInfo | null) => void> = [];
  private syncStatusCallbacks: Array<(status: CalendarSyncStatus) => void> = [];
  private errorCallbacks: Array<(error: CalendarError) => void> = [];

  constructor(config: Partial<CalendarServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize calendar service
   */
  async initialize(config: CalendarServiceConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    
    try {
      // Request calendar permissions
      const status = await RNCalendarEvents.requestPermissions();
      if (status !== 'authorized') {
        throw this.createError(
          CalendarErrorType.PERMISSION_DENIED,
          'Calendar permission not granted'
        );
      }
      
      // Configure Google Sign-In if enabled
      if (this.config.enableGoogleCalendar) {
        GoogleSignin.configure({
          scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
          webClientId: process.env.GOOGLE_CLIENT_ID,
        });
      }
      
      // Initial sync
      if (this.config.syncOnAppStart) {
        await this.syncCalendars();
      }
      
      // Start auto-update if enabled
      if (this.config.autoSync) {
        this.startAutoUpdate();
      }
      
      console.log('Calendar service initialized');
    } catch (error) {
      throw this.createError(
        CalendarErrorType.UNKNOWN,
        'Failed to initialize calendar service',
        error as Error
      );
    }
  }

  /**
   * Authenticate with Google Calendar
   */
  async authenticateGoogle(): Promise<void> {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      console.log('Google Calendar authenticated');
    } catch (error) {
      throw this.createError(
        CalendarErrorType.AUTH_ERROR,
        'Google authentication failed',
        error as Error
      );
    }
  }

  /**
   * Sign out from Google Calendar
   */
  async signOutGoogle(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log('Signed out from Google Calendar');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  /**
   * Check if Google is authenticated
   */
  isGoogleAuthenticated(): boolean {
    return GoogleSignin.isSignedIn();
  }

  /**
   * Get available calendars
   */
  async getCalendars(): Promise<CalendarSource[]> {
    try {
      const nativeCalendars = await RNCalendarEvents.findCalendars();
      
      this.calendars = nativeCalendars.map(cal => ({
        id: cal.id,
        name: cal.title,
        type: this.detectCalendarType(cal.source),
        color: cal.color,
        isPrimary: cal.isPrimary,
        isEnabled: true,
      }));
      
      return this.calendars;
    } catch (error) {
      throw this.createError(
        CalendarErrorType.SYNC_FAILED,
        'Failed to fetch calendars',
        error as Error
      );
    }
  }

  /**
   * Enable calendar
   */
  async enableCalendar(calendarId: string): Promise<void> {
    const calendar = this.calendars.find(c => c.id === calendarId);
    if (calendar) {
      calendar.isEnabled = true;
      await this.syncCalendars();
    }
  }

  /**
   * Disable calendar
   */
  async disableCalendar(calendarId: string): Promise<void> {
    const calendar = this.calendars.find(c => c.id === calendarId);
    if (calendar) {
      calendar.isEnabled = false;
      await this.syncCalendars();
    }
  }

  /**
   * Get events with optional filtering
   */
  async getEvents(options: CalendarFilterOptions = {}): Promise<CalendarEvent[]> {
    try {
      const startDate = options.startDate || new Date();
      const endDate = options.endDate || new Date(Date.now() + this.config.lookaheadDays * 24 * 60 * 60 * 1000);
      
      const enabledCalendarIds = this.calendars
        .filter(c => c.isEnabled)
        .map(c => c.id);
      
      const calendarIds = options.calendarIds || enabledCalendarIds;
      
      const nativeEvents = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString(),
        calendarIds
      );
      
      let events = nativeEvents.map(this.mapNativeEvent);
      
      // Apply filters
      if (options.excludeCancelled) {
        events = events.filter(e => e.status !== EventStatus.CANCELLED);
      }
      
      if (options.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        events = events.filter(e =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query)
        );
      }
      
      // Sort by start date
      events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      this.events = events;
      return events;
    } catch (error) {
      throw this.createError(
        CalendarErrorType.SYNC_FAILED,
        'Failed to fetch events',
        error as Error
      );
    }
  }

  /**
   * Get next upcoming event
   */
  async getNextEvent(): Promise<NextEventInfo | null> {
    try {
      const now = new Date();
      const events = await this.getEvents({
        startDate: now,
        excludeCancelled: true,
      });
      
      // Find next event (not currently in progress)
      const nextEvent = events.find(event => event.startDate > now);
      
      if (!nextEvent) {
        this.updateNextEvent(null);
        return null;
      }
      
      const timeUntilStart = nextEvent.startDate.getTime() - now.getTime();
      const isStartingSoon = timeUntilStart <= 15 * 60 * 1000; // 15 minutes
      
      const nextEventInfo: NextEventInfo = {
        event: nextEvent,
        timeUntilStart,
        isStartingSoon,
        isInProgress: false,
        displayText: formatNextEventDisplay(nextEvent, timeUntilStart),
      };
      
      this.updateNextEvent(nextEventInfo);
      return nextEventInfo;
    } catch (error) {
      this.handleError(
        this.createError(
          CalendarErrorType.SYNC_FAILED,
          'Failed to get next event',
          error as Error
        )
      );
      return null;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(count: number): Promise<CalendarEvent[]> {
    const events = await this.getEvents({
      startDate: new Date(),
      excludeCancelled: true,
    });
    
    return events.slice(0, count);
  }

  /**
   * Sync calendars
   */
  async syncCalendars(): Promise<CalendarSyncResult> {
    try {
      this.updateSyncStatus(CalendarSyncStatus.SYNCING);
      
      await this.getCalendars();
      const events = await this.getEvents();
      await this.getNextEvent();
      
      this.lastSyncTime = new Date();
      this.updateSyncStatus(CalendarSyncStatus.SUCCESS);
      
      return {
        status: CalendarSyncStatus.SUCCESS,
        eventsCount: events.length,
        lastSyncTime: this.lastSyncTime,
      };
    } catch (error) {
      const calendarError = this.createError(
        CalendarErrorType.SYNC_FAILED,
        'Calendar sync failed',
        error as Error
      );
      
      this.updateSyncStatus(CalendarSyncStatus.ERROR);
      this.handleError(calendarError);
      
      return {
        status: CalendarSyncStatus.ERROR,
        eventsCount: 0,
        lastSyncTime: this.lastSyncTime || new Date(),
        error: calendarError,
      };
    }
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Event listeners
   */
  onNextEventChange(callback: (event: NextEventInfo | null) => void): void {
    this.nextEventCallbacks.push(callback);
  }

  onSyncStatusChange(callback: (status: CalendarSyncStatus) => void): void {
    this.syncStatusCallbacks.push(callback);
  }

  onError(callback: (error: CalendarError) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Private Methods
   */
  
  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(async () => {
      await this.getNextEvent();
    }, this.config.updateInterval);
  }

  private stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private updateNextEvent(event: NextEventInfo | null): void {
    // Only notify if event changed
    if (this.hasNextEventChanged(this.currentNextEvent, event)) {
      this.currentNextEvent = event;
      this.notifyNextEventChange(event);
    }
  }

  private hasNextEventChanged(prev: NextEventInfo | null, current: NextEventInfo | null): boolean {
    if (!prev && !current) return false;
    if (!prev || !current) return true;
    return prev.event.id !== current.event.id;
  }

  private updateSyncStatus(status: CalendarSyncStatus): void {
    this.syncStatus = status;
    this.notifySyncStatusChange(status);
  }

  private mapNativeEvent(nativeEvent: any): CalendarEvent {
    return {
      id: nativeEvent.id,
      calendarId: nativeEvent.calendarId,
      title: nativeEvent.title || 'Untitled Event',
      description: nativeEvent.description,
      location: nativeEvent.location,
      startDate: new Date(nativeEvent.startDate),
      endDate: new Date(nativeEvent.endDate),
      allDay: nativeEvent.allDay || false,
      recurring: !!nativeEvent.recurrenceRule,
      recurrenceRule: nativeEvent.recurrenceRule,
      status: EventStatus.CONFIRMED,
      url: nativeEvent.url,
    };
  }

  private detectCalendarType(source: string): CalendarType {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('google')) return CalendarType.GOOGLE;
    if (sourceLower.includes('exchange')) return CalendarType.EXCHANGE;
    if (sourceLower.includes('icloud')) return CalendarType.ICLOUD;
    return CalendarType.NATIVE;
  }

  private createError(type: CalendarErrorType, message: string, originalError?: Error): CalendarError {
    return {
      type,
      message,
      originalError,
      timestamp: new Date(),
    };
  }

  private handleError(error: CalendarError): void {
    console.error('Calendar Error:', error);
    this.notifyError(error);
  }

  private notifyNextEventChange(event: NextEventInfo | null): void {
    this.nextEventCallbacks.forEach(cb => cb(event));
  }

  private notifySyncStatusChange(status: CalendarSyncStatus): void {
    this.syncStatusCallbacks.forEach(cb => cb(status));
  }

  private notifyError(error: CalendarError): void {
    this.errorCallbacks.forEach(cb => cb(error));
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoUpdate();
    this.nextEventCallbacks = [];
    this.syncStatusCallbacks = [];
    this.errorCallbacks = [];
  }
}

/**
 * Export singleton instance
 */
export const calendarService = new CalendarService();
