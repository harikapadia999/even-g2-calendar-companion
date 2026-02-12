/**
 * Calendar Type Definitions
 * Supports both Google Calendar and native device calendars
 */

/**
 * Calendar Event
 */
export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  recurring: boolean;
  recurrenceRule?: string;
  attendees?: EventAttendee[];
  organizer?: EventOrganizer;
  status: EventStatus;
  url?: string;
  meetingUrl?: string; // Zoom, Meet, Teams link
  timezone?: string;
  reminders?: EventReminder[];
  color?: string;
}

/**
 * Event Status
 */
export enum EventStatus {
  CONFIRMED = 'CONFIRMED',
  TENTATIVE = 'TENTATIVE',
  CANCELLED = 'CANCELLED',
}

/**
 * Event Attendee
 */
export interface EventAttendee {
  name?: string;
  email: string;
  responseStatus: AttendeeResponseStatus;
  optional?: boolean;
}

/**
 * Attendee Response Status
 */
export enum AttendeeResponseStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
  NEEDS_ACTION = 'NEEDS_ACTION',
}

/**
 * Event Organizer
 */
export interface EventOrganizer {
  name?: string;
  email: string;
}

/**
 * Event Reminder
 */
export interface EventReminder {
  method: ReminderMethod;
  minutes: number;
}

/**
 * Reminder Method
 */
export enum ReminderMethod {
  EMAIL = 'EMAIL',
  POPUP = 'POPUP',
  SMS = 'SMS',
}

/**
 * Calendar Source
 */
export interface CalendarSource {
  id: string;
  name: string;
  type: CalendarType;
  color?: string;
  isPrimary?: boolean;
  isEnabled: boolean;
}

/**
 * Calendar Type
 */
export enum CalendarType {
  GOOGLE = 'GOOGLE',
  NATIVE = 'NATIVE',
  EXCHANGE = 'EXCHANGE',
  ICLOUD = 'ICLOUD',
  OTHER = 'OTHER',
}

/**
 * Next Event Info
 * Optimized structure for display on G2
 */
export interface NextEventInfo {
  event: CalendarEvent;
  timeUntilStart: number; // milliseconds
  isStartingSoon: boolean; // within 15 minutes
  isInProgress: boolean;
  displayText: NextEventDisplayText;
}

/**
 * Next Event Display Text
 * Pre-formatted text for G2 display
 */
export interface NextEventDisplayText {
  title: string; // Truncated/formatted title
  timeRange: string; // "10:00 AM - 10:30 AM"
  location?: string; // Truncated location
  timeUntil: string; // "Starts in 12 minutes" or "In progress"
  duration: string; // "30 minutes"
}

/**
 * Calendar Sync Status
 */
export enum CalendarSyncStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

/**
 * Calendar Sync Result
 */
export interface CalendarSyncResult {
  status: CalendarSyncStatus;
  eventsCount: number;
  lastSyncTime: Date;
  error?: CalendarError;
}

/**
 * Calendar Error Types
 */
export enum CalendarErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  INVALID_CALENDAR = 'INVALID_CALENDAR',
  SYNC_FAILED = 'SYNC_FAILED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Calendar Error
 */
export interface CalendarError {
  type: CalendarErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
}

/**
 * Calendar Filter Options
 */
export interface CalendarFilterOptions {
  calendarIds?: string[]; // Filter by specific calendars
  startDate?: Date; // Events after this date
  endDate?: Date; // Events before this date
  includeAllDay?: boolean;
  includeRecurring?: boolean;
  excludeCancelled?: boolean;
  searchQuery?: string; // Search in title/description
}

/**
 * Calendar Service Configuration
 */
export interface CalendarServiceConfig {
  updateInterval: number; // ms between calendar checks
  lookaheadDays: number; // How many days ahead to fetch events
  enableGoogleCalendar: boolean;
  enableNativeCalendar: boolean;
  autoSync: boolean;
  syncOnAppStart: boolean;
}

/**
 * Google Calendar Credentials
 */
export interface GoogleCalendarCredentials {
  clientId: string;
  clientSecret?: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

/**
 * Calendar Service Interface
 */
export interface ICalendarService {
  // Initialization
  initialize(config: CalendarServiceConfig): Promise<void>;
  
  // Authentication
  authenticateGoogle(): Promise<void>;
  signOutGoogle(): Promise<void>;
  isGoogleAuthenticated(): boolean;
  
  // Calendar Sources
  getCalendars(): Promise<CalendarSource[]>;
  enableCalendar(calendarId: string): Promise<void>;
  disableCalendar(calendarId: string): Promise<void>;
  
  // Events
  getEvents(options?: CalendarFilterOptions): Promise<CalendarEvent[]>;
  getNextEvent(): Promise<NextEventInfo | null>;
  getUpcomingEvents(count: number): Promise<CalendarEvent[]>;
  
  // Sync
  syncCalendars(): Promise<CalendarSyncResult>;
  getLastSyncTime(): Date | null;
  
  // Event Listeners
  onNextEventChange(callback: (event: NextEventInfo | null) => void): void;
  onSyncStatusChange(callback: (status: CalendarSyncStatus) => void): void;
  onError(callback: (error: CalendarError) => void): void;
}

/**
 * Event Time Utilities
 */
export interface EventTimeInfo {
  isToday: boolean;
  isTomorrow: boolean;
  isThisWeek: boolean;
  isPast: boolean;
  isCurrent: boolean;
  timeUntilStart: number; // ms
  timeUntilEnd: number; // ms
  duration: number; // ms
}

/**
 * Display Formatting Options
 */
export interface DisplayFormattingOptions {
  maxTitleLength: number;
  maxLocationLength: number;
  dateFormat: 'short' | 'medium' | 'long';
  timeFormat: '12h' | '24h';
  showDuration: boolean;
  showLocation: boolean;
  showAttendees: boolean;
}
