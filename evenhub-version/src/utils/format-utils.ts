/**
 * Formatting Utilities
 * 
 * Helper functions for formatting calendar data for display.
 */

import type { CalendarEvent } from '@/types/calendar.types';
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

/**
 * Format event time range
 */
export function formatEventTime(event: CalendarEvent, timeFormat: '12h' | '24h' = '12h'): string {
  if (event.isAllDay) {
    return 'All day';
  }

  const formatString = timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
  const start = format(event.startTime, formatString);
  const end = format(event.endTime, formatString);

  // Check if same day
  const sameDay = event.startTime.toDateString() === event.endTime.toDateString();
  
  if (sameDay) {
    return `${start} - ${end}`;
  } else {
    const startDate = format(event.startTime, 'MMM d');
    const endDate = format(event.endTime, 'MMM d');
    return `${startDate} ${start} - ${endDate} ${end}`;
  }
}

/**
 * Format time until event starts
 */
export function formatTimeUntil(startTime: Date): string {
  const now = new Date();
  const diffMinutes = differenceInMinutes(startTime, now);

  if (diffMinutes < 0) {
    return 'Started';
  }

  if (diffMinutes === 0) {
    return 'Starting now';
  }

  if (diffMinutes < 60) {
    return `Starts in ${diffMinutes} min`;
  }

  const diffHours = differenceInHours(startTime, now);
  if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes === 0) {
      return `Starts in ${diffHours} hr`;
    }
    return `Starts in ${diffHours}h ${remainingMinutes}m`;
  }

  const diffDays = differenceInDays(startTime, now);
  if (diffDays === 1) {
    return 'Starts tomorrow';
  }

  return `Starts in ${diffDays} days`;
}

/**
 * Format event duration
 */
export function formatDuration(startTime: Date, endTime: Date): string {
  const diffMinutes = differenceInMinutes(endTime, startTime);

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Wrap text to fit width (approximate, based on character count)
 */
export function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatType: 'short' | 'long' = 'short'): string {
  if (formatType === 'short') {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMMM d, yyyy');
  }
}

/**
 * Format time for display
 */
export function formatTime(date: Date, timeFormat: '12h' | '24h' = '12h'): string {
  const formatString = timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
  return format(date, formatString);
}

/**
 * Check if event is happening now
 */
export function isEventNow(event: CalendarEvent): boolean {
  const now = new Date();
  return now >= event.startTime && now <= event.endTime;
}

/**
 * Check if event is in the past
 */
export function isEventPast(event: CalendarEvent): boolean {
  const now = new Date();
  return now > event.endTime;
}

/**
 * Check if event is upcoming (in the future)
 */
export function isEventUpcoming(event: CalendarEvent): boolean {
  const now = new Date();
  return now < event.startTime;
}

/**
 * Sort events by start time (ascending)
 */
export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Filter events to only upcoming ones
 */
export function filterUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(isEventUpcoming);
}

/**
 * Get next event from a list
 */
export function getNextEvent(events: CalendarEvent[]): CalendarEvent | null {
  const upcoming = filterUpcomingEvents(events);
  const sorted = sortEventsByTime(upcoming);
  return sorted.length > 0 ? sorted[0] : null;
}

/**
 * Remove emojis and special characters for monochrome display
 */
export function sanitizeForDisplay(text: string): string {
  // Remove emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  let sanitized = text.replace(emojiRegex, '');
  
  // Remove other problematic characters
  sanitized = sanitized.replace(/[^\x20-\x7E\n\r\t]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 5 minutes")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}
