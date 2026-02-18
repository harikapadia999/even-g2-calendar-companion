/**
 * Calendar Type Definitions
 * 
 * Defines all calendar-related types for the Even Hub SDK calendar app.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  isAllDay: boolean;
  calendarId: string;
  calendarName: string;
  attendees?: string[];
  organizer?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  color?: string;
}

export interface Calendar {
  id: string;
  name: string;
  color?: string;
  isPrimary: boolean;
  isEnabled: boolean;
  source: CalendarSource;
}

export type CalendarSource = 'google' | 'native' | 'outlook' | 'other';

export interface CalendarSyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  error: string | null;
  nextSyncTime: Date | null;
}

export interface TimeUntilEvent {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  isPast: boolean;
  isNow: boolean;
  formatted: string;
}

export interface EventDuration {
  hours: number;
  minutes: number;
  formatted: string;
}

export interface CalendarSettings {
  syncInterval: number; // milliseconds
  showLocation: boolean;
  showDuration: boolean;
  showTimeUntil: boolean;
  maxTitleLength: number;
  enabledCalendars: string[];
  timeFormat: '12h' | '24h';
  dateFormat: 'short' | 'long';
}

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  syncInterval: 30000, // 30 seconds
  showLocation: true,
  showDuration: true,
  showTimeUntil: true,
  maxTitleLength: 40,
  enabledCalendars: [],
  timeFormat: '12h',
  dateFormat: 'short',
};
