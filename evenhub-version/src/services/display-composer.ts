/**
 * Display Composer
 * 
 * Composes calendar event data into Even Hub SDK container format.
 * Optimized for G2 display (576×288 monochrome).
 */

import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  ImageContainerProperty,
} from '@evenrealities/even_hub_sdk';
import type { AppState } from '@/types/state.types';
import type { CalendarEvent } from '@/types/calendar.types';
import { G2_DISPLAY, TEXT_AREA_LAYOUT, IMAGE_AREA_LAYOUT, BRANDING_AREA_LAYOUT } from '@/types/display.types';
import { formatEventTime, formatTimeUntil, formatDuration, truncateText } from '@/utils/format-utils';

// Container IDs
export const CONTAINER_ID_TEXT = 1;
export const CONTAINER_ID_IMAGE = 2;
export const CONTAINER_ID_BRAND = 3;

// Container Names
export const CONTAINER_NAME_TEXT = 'calendar-display';
export const CONTAINER_NAME_IMAGE = 'calendar-icon';
export const CONTAINER_NAME_BRAND = 'calendar-brand';

/**
 * Create initial page setup
 */
export function composeStartupPage(state: AppState): CreateStartUpPageContainer {
  const containers = buildContainers(state);
  
  return new CreateStartUpPageContainer({
    containerTotalNum: containers.totalNum,
    textObject: containers.textObjects,
    imageObject: containers.imageObjects,
  });
}

/**
 * Rebuild page (for major layout changes)
 */
export function composePageRebuild(state: AppState): RebuildPageContainer {
  const containers = buildContainers(state);
  
  return new RebuildPageContainer({
    containerTotalNum: containers.totalNum,
    textObject: containers.textObjects,
    imageObject: containers.imageObjects,
  });
}

/**
 * Build container configuration
 */
function buildContainers(state: AppState): {
  totalNum: number;
  textObjects: TextContainerProperty[];
  imageObjects: ImageContainerProperty[];
} {
  const textObjects: TextContainerProperty[] = [];
  const imageObjects: ImageContainerProperty[] = [];

  // Main text container (left side)
  textObjects.push(
    new TextContainerProperty({
      xPosition: TEXT_AREA_LAYOUT.x,
      yPosition: TEXT_AREA_LAYOUT.y,
      width: TEXT_AREA_LAYOUT.width,
      height: TEXT_AREA_LAYOUT.height,
      containerID: CONTAINER_ID_TEXT,
      containerName: CONTAINER_NAME_TEXT,
      content: formatDisplayText(state),
      isEventCapture: 1, // Capture scroll/tap events
    })
  );

  // Optional image container (right side)
  // Currently unused, but available for calendar icons/graphics
  imageObjects.push(
    new ImageContainerProperty({
      xPosition: IMAGE_AREA_LAYOUT.x,
      yPosition: IMAGE_AREA_LAYOUT.y,
      width: IMAGE_AREA_LAYOUT.width,
      height: IMAGE_AREA_LAYOUT.height,
      containerID: CONTAINER_ID_IMAGE,
      containerName: CONTAINER_NAME_IMAGE,
    })
  );

  // Branding container (top center)
  imageObjects.push(
    new ImageContainerProperty({
      xPosition: BRANDING_AREA_LAYOUT.x,
      yPosition: BRANDING_AREA_LAYOUT.y,
      width: BRANDING_AREA_LAYOUT.width,
      height: BRANDING_AREA_LAYOUT.height,
      containerID: CONTAINER_ID_BRAND,
      containerName: CONTAINER_NAME_BRAND,
    })
  );

  const totalNum = textObjects.length + imageObjects.length;
  return { totalNum, textObjects, imageObjects };
}

/**
 * Format complete display text based on app state
 */
export function formatDisplayText(state: AppState): string {
  switch (state.phase) {
    case 'loading':
      return formatLoadingText();
    
    case 'error':
      return formatErrorText(state.error || 'Unknown error');
    
    case 'syncing':
      return formatSyncingText(state.nextEvent);
    
    case 'menu':
      return formatMenuText(state.menuSelectedIndex);
    
    case 'settings':
      return formatSettingsText(state);
    
    case 'eventDetails':
      return formatEventDetailsText(state.nextEvent);
    
    case 'idle':
    default:
      return formatCalendarText(state.nextEvent, state);
  }
}

/**
 * Format loading screen
 */
function formatLoadingText(): string {
  return `
╔════════════════════════════╗
║   CALENDAR COMPANION       ║
╚════════════════════════════╝

Initializing...

• Loading Google Calendar
• Connecting to Even Hub
• Fetching events

Please wait...
`.trim();
}

/**
 * Format error screen
 */
function formatErrorText(error: string): string {
  return `
╔════════════════════════════╗
║   ERROR                    ║
╚════════════════════════════╝

${truncateText(error, 200)}

Double-tap to retry
Scroll down for menu
`.trim();
}

/**
 * Format syncing screen
 */
function formatSyncingText(currentEvent: CalendarEvent | null): string {
  const eventPreview = currentEvent 
    ? `\nCurrent: ${truncateText(currentEvent.title, 30)}`
    : '';
  
  return `
╔════════════════════════════╗
║   SYNCING...               ║
╚════════════════════════════╝

Refreshing calendar events...
${eventPreview}

Please wait...
`.trim();
}

/**
 * Format main calendar display
 */
function formatCalendarText(event: CalendarEvent | null, state: AppState): string {
  if (!event) {
    return formatNoEventsText();
  }

  const title = truncateText(event.title, state.settings.maxTitleLength);
  const timeRange = formatEventTime(event, state.settings.timeFormat);
  const location = event.location 
    ? truncateText(event.location, 35)
    : null;
  const timeUntil = formatTimeUntil(event.startTime);
  const duration = formatDuration(event.startTime, event.endTime);

  let display = `
╔════════════════════════════╗
║   NEXT EVENT               ║
╚════════════════════════════╝

${title}

⏰ ${timeRange}
`.trim();

  if (location && state.settings.showLocation) {
    display += `\n📍 ${location}`;
  }

  if (state.settings.showTimeUntil) {
    display += `\n\n⏳ ${timeUntil}`;
  }

  if (state.settings.showDuration) {
    display += `\n⌛ ${duration}`;
  }

  // Footer
  const lastUpdate = state.lastUpdateTime 
    ? new Date(state.lastUpdateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';
  
  display += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  display += `\nUpdated: ${lastUpdate}`;
  
  if (state.showDebugInfo) {
    display += `\nEvents: ${state.upcomingEvents.length}`;
  }

  return display;
}

/**
 * Format no events screen
 */
function formatNoEventsText(): string {
  return `
╔════════════════════════════╗
║   NO UPCOMING EVENTS       ║
╚════════════════════════════╝

Your calendar is clear!

Enjoy your free time 😊

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Double-tap for menu
`.trim();
}

/**
 * Format menu screen
 */
function formatMenuText(selectedIndex: number): string {
  const options = [
    'Refresh Now',
    'Settings',
    'View All Events',
    'Toggle Debug',
    'Exit',
  ];

  let display = `
╔════════════════════════════╗
║   MENU                     ║
╚════════════════════════════╝

`;

  options.forEach((option, index) => {
    const marker = index === selectedIndex ? '▶' : ' ';
    display += `${marker} ${option}\n`;
  });

  display += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scroll: Navigate
Tap: Select
Double-tap: Back
`.trim();

  return display;
}

/**
 * Format settings screen
 */
function formatSettingsText(state: AppState): string {
  const { settings } = state;
  
  return `
╔════════════════════════════╗
║   SETTINGS                 ║
╚════════════════════════════╝

Sync Interval: ${settings.syncInterval / 1000}s
Time Format: ${settings.timeFormat}
Show Location: ${settings.showLocation ? 'Yes' : 'No'}
Show Duration: ${settings.showDuration ? 'Yes' : 'No'}
Show Time Until: ${settings.showTimeUntil ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Double-tap to go back
`.trim();
}

/**
 * Format event details screen
 */
function formatEventDetailsText(event: CalendarEvent | null): string {
  if (!event) {
    return formatNoEventsText();
  }

  const title = event.title;
  const timeRange = formatEventTime(event, '12h');
  const location = event.location || 'No location';
  const description = event.description 
    ? truncateText(event.description, 150)
    : 'No description';

  return `
╔════════════════════════════╗
║   EVENT DETAILS            ║
╚════════════════════════════╝

${title}

⏰ ${timeRange}
📍 ${location}

${description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Double-tap to go back
`.trim();
}
