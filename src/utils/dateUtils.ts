/**
 * Date Utilities
 * Helper functions for date/time operations
 */

import { CalendarEvent, NextEventDisplayText } from '@/types/calendar.types';
import { TextFormatter } from '@/services/display/TextFormatter';

const textFormatter = new TextFormatter();

/**
 * Format next event for display
 */
export function formatNextEventDisplay(
  event: CalendarEvent,
  timeUntilStart: number
): NextEventDisplayText {
  const duration = event.endDate.getTime() - event.startDate.getTime();
  
  return {
    title: textFormatter.formatEventTitle(event.title, 60),
    timeRange: textFormatter.formatTimeRange(event.startDate, event.endDate, '12h'),
    location: event.location ? textFormatter.formatLocation(event.location, 50) : undefined,
    timeUntil: textFormatter.formatTimeUntil(timeUntilStart),
    duration: textFormatter.formatDuration(duration),
  };
}

/**
 * Check if event is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if event is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if event is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if event is currently happening
 */
export function isInProgress(event: CalendarEvent): boolean {
  const now = Date.now();
  return event.startDate.getTime() <= now && event.endDate.getTime() >= now;
}

/**
 * Get time until event starts (in milliseconds)
 */
export function getTimeUntilStart(event: CalendarEvent): number {
  return event.startDate.getTime() - Date.now();
}

/**
 * Get event duration (in milliseconds)
 */
export function getEventDuration(event: CalendarEvent): number {
  return event.endDate.getTime() - event.startDate.getTime();
}

/**
 * Check if event is starting soon (within 15 minutes)
 */
export function isStartingSoon(event: CalendarEvent): boolean {
  const timeUntil = getTimeUntilStart(event);
  return timeUntil > 0 && timeUntil <= 15 * 60 * 1000;
}
