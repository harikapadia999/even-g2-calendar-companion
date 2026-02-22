/**
 * Event Mapper
 * 
 * Maps Even Hub SDK events (scroll, tap, double-tap) to application actions.
 * Handles R1 ring and touchpad inputs.
 */

import type { EvenHubEvent } from '@evenrealities/even_hub_sdk';
import type { AppAction, AppState } from '@/types/state.types';

// Event types from Even Hub SDK
const EVENT_TYPE_SCROLL = 'scroll';
const EVENT_TYPE_TAP = 'tap';
const EVENT_TYPE_DOUBLE_TAP = 'double_tap';

// Scroll directions
const SCROLL_UP = 'up';
const SCROLL_DOWN = 'down';

// Tap cooldown to prevent accidental double inputs
let lastTapTime = 0;
const TAP_COOLDOWN_MS = 300;
const TAP_COOLDOWN_MENU_MS = 500; // Longer cooldown in menu

/**
 * Map Even Hub event to application action
 */
export function mapEvenHubEvent(
  event: EvenHubEvent,
  state: AppState
): AppAction | null {
  const now = Date.now();
  const cooldown = state.phase === 'menu' ? TAP_COOLDOWN_MENU_MS : TAP_COOLDOWN_MS;

  // Check tap cooldown
  if (event.type === EVENT_TYPE_TAP || event.type === EVENT_TYPE_DOUBLE_TAP) {
    if (now - lastTapTime < cooldown) {
      console.log('[EventMapper] Tap ignored (cooldown)');
      return null;
    }
    lastTapTime = now;
  }

  console.log('[EventMapper] Event:', event.type, event.data);

  switch (event.type) {
    case EVENT_TYPE_SCROLL:
      return handleScrollEvent(event, state);

    case EVENT_TYPE_TAP:
      return handleTapEvent(event, state);

    case EVENT_TYPE_DOUBLE_TAP:
      return handleDoubleTapEvent(event, state);

    default:
      console.warn('[EventMapper] Unknown event type:', event.type);
      return null;
  }
}

/**
 * Handle scroll events (R1 ring or touchpad swipe)
 */
function handleScrollEvent(event: EvenHubEvent, state: AppState): AppAction | null {
  const direction = event.data?.direction;

  if (!direction) {
    console.warn('[EventMapper] Scroll event missing direction');
    return null;
  }

  switch (state.phase) {
    case 'menu':
    case 'settings':
      // Navigate menu/settings
      if (direction === SCROLL_UP) {
        return { type: 'NAVIGATE_UP' };
      } else if (direction === SCROLL_DOWN) {
        return { type: 'NAVIGATE_DOWN' };
      }
      break;

    case 'idle':
    case 'syncing':
      // Scroll down to open menu
      if (direction === SCROLL_DOWN) {
        return { type: 'OPEN_MENU' };
      }
      break;

    case 'eventDetails':
      // Scroll to navigate between events
      // TODO: Implement event navigation
      break;

    default:
      break;
  }

  return null;
}

/**
 * Handle tap events (single tap on R1 ring or touchpad)
 */
function handleTapEvent(event: EvenHubEvent, state: AppState): AppAction | null {
  switch (state.phase) {
    case 'menu':
    case 'settings':
      // Select current menu item
      return { type: 'SELECT' };

    case 'idle':
      // Tap to refresh
      return { type: 'REFRESH' };

    case 'error':
      // Tap to retry
      return { type: 'CLEAR_ERROR' };

    default:
      break;
  }

  return null;
}

/**
 * Handle double-tap events
 */
function handleDoubleTapEvent(event: EvenHubEvent, state: AppState): AppAction | null {
  switch (state.phase) {
    case 'menu':
    case 'settings':
    case 'eventDetails':
      // Double-tap to go back
      return { type: 'BACK' };

    case 'idle':
      // Double-tap to open menu
      return { type: 'OPEN_MENU' };

    case 'error':
      // Double-tap to clear error and return to idle
      return { type: 'CLEAR_ERROR' };

    default:
      break;
  }

  return null;
}

/**
 * Extend tap cooldown (useful for preventing accidental inputs after menu transitions)
 */
export function extendTapCooldown(additionalMs: number): void {
  lastTapTime = Date.now() + additionalMs;
}

/**
 * Reset tap cooldown
 */
export function resetTapCooldown(): void {
  lastTapTime = 0;
}
