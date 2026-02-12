/**
 * Text Formatter
 * Handles all text formatting for G2 display
 */

import { format, formatDistance, formatDuration, intervalToDuration } from 'date-fns';
import { ITextFormatter } from '@/types/display.types';

export class TextFormatter implements ITextFormatter {
  /**
   * Format time range (e.g., "10:00 AM - 10:30 AM")
   */
  formatTimeRange(start: Date, end: Date, timeFormat: '12h' | '24h' = '12h'): string {
    const formatString = timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
    const startTime = format(start, formatString);
    const endTime = format(end, formatString);
    return `${startTime} - ${endTime}`;
  }

  /**
   * Format duration (e.g., "30 minutes", "1 hour 15 min")
   */
  formatDuration(milliseconds: number): string {
    const duration = intervalToDuration({ start: 0, end: milliseconds });
    
    if (duration.hours && duration.hours > 0) {
      if (duration.minutes && duration.minutes > 0) {
        return `${duration.hours}h ${duration.minutes}m`;
      }
      return `${duration.hours} hour${duration.hours > 1 ? 's' : ''}`;
    }
    
    if (duration.minutes && duration.minutes > 0) {
      return `${duration.minutes} min`;
    }
    
    return 'Less than 1 min';
  }

  /**
   * Format time until event (e.g., "Starts in 12 minutes", "In progress")
   */
  formatTimeUntil(milliseconds: number): string {
    if (milliseconds < 0) {
      return 'In progress';
    }
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `In ${days} day${days > 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `In ${hours}h ${remainingMinutes}m`;
      }
      return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    if (minutes > 0) {
      return `Starts in ${minutes} min`;
    }
    
    return 'Starting now';
  }

  /**
   * Format date (e.g., "Today", "Tomorrow", "Jan 15")
   */
  formatDate(date: Date, dateFormat: 'short' | 'medium' | 'long' = 'medium'): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    switch (dateFormat) {
      case 'short':
        return format(date, 'MMM d');
      case 'medium':
        return format(date, 'MMM d, h:mm a');
      case 'long':
        return format(date, 'MMMM d, yyyy h:mm a');
      default:
        return format(date, 'MMM d');
    }
  }

  /**
   * Truncate text with ellipsis
   */
  truncate(text: string, maxLength: number, ellipsis: boolean = true): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    if (ellipsis) {
      return text.slice(0, maxLength - 3) + '...';
    }
    
    return text.slice(0, maxLength);
  }

  /**
   * Capitalize first letter
   */
  capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Remove emojis (G2 can't display them)
   */
  removeEmojis(text: string): string {
    return text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .trim();
  }

  /**
   * Sanitize text for G2 display
   */
  sanitize(text: string): string {
    // Remove emojis
    let sanitized = this.removeEmojis(text);
    
    // Remove special characters that might not render well
    sanitized = sanitized.replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
  }

  /**
   * Format event title for display
   */
  formatEventTitle(title: string, maxLength: number): string {
    let formatted = this.sanitize(title);
    formatted = this.capitalize(formatted);
    return this.truncate(formatted, maxLength, true);
  }

  /**
   * Format location for display
   */
  formatLocation(location: string, maxLength: number): string {
    let formatted = this.sanitize(location);
    
    // Extract just the location name if it's a full address
    // e.g., "Conference Room B, 123 Main St, City" -> "Conference Room B"
    const parts = formatted.split(',');
    if (parts.length > 0) {
      formatted = parts[0].trim();
    }
    
    return this.truncate(formatted, maxLength, true);
  }

  /**
   * Format attendees list
   */
  formatAttendees(attendees: string[], maxLength: number): string {
    if (attendees.length === 0) {
      return '';
    }
    
    if (attendees.length === 1) {
      return this.truncate(attendees[0], maxLength);
    }
    
    if (attendees.length === 2) {
      const combined = `${attendees[0]} & ${attendees[1]}`;
      return this.truncate(combined, maxLength);
    }
    
    const first = attendees[0];
    const remaining = attendees.length - 1;
    const combined = `${first} +${remaining} other${remaining > 1 ? 's' : ''}`;
    return this.truncate(combined, maxLength);
  }
}
