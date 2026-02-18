/**
 * State Management Type Definitions
 * 
 * Defines the application state structure and actions.
 */

import type { CalendarEvent, CalendarSyncStatus, CalendarSettings } from './calendar.types';

export type AppPhase = 
  | 'loading'
  | 'idle'
  | 'syncing'
  | 'error'
  | 'menu'
  | 'settings'
  | 'eventDetails';

export interface AppState {
  // Phase
  phase: AppPhase;
  
  // Calendar data
  nextEvent: CalendarEvent | null;
  upcomingEvents: CalendarEvent[];
  
  // Sync status
  syncStatus: CalendarSyncStatus;
  
  // Settings
  settings: CalendarSettings;
  
  // UI state
  selectedEventIndex: number;
  menuSelectedIndex: number;
  showDebugInfo: boolean;
  
  // Error state
  error: string | null;
  
  // Timestamps
  lastUpdateTime: Date | null;
  appStartTime: Date;
}

export type AppAction =
  | { type: 'INIT_SUCCESS' }
  | { type: 'INIT_ERROR'; error: string }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS'; events: CalendarEvent[] }
  | { type: 'SYNC_ERROR'; error: string }
  | { type: 'UPDATE_NEXT_EVENT'; event: CalendarEvent | null }
  | { type: 'NAVIGATE_UP' }
  | { type: 'NAVIGATE_DOWN' }
  | { type: 'SELECT' }
  | { type: 'BACK' }
  | { type: 'OPEN_MENU' }
  | { type: 'CLOSE_MENU' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'UPDATE_SETTING'; key: keyof CalendarSettings; value: any }
  | { type: 'TOGGLE_DEBUG' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'REFRESH' };

export interface Store {
  getState: () => AppState;
  dispatch: (action: AppAction) => void;
  subscribe: (listener: (state: AppState, prevState: AppState) => void) => () => void;
}

export const MENU_OPTIONS = [
  'Refresh Now',
  'Settings',
  'View All Events',
  'Toggle Debug',
  'Exit',
] as const;

export type MenuOption = typeof MENU_OPTIONS[number];
