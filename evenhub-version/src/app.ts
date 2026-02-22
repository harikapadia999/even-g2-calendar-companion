/**
 * Calendar Companion Application
 * 
 * Main application orchestration for Even G2 Calendar Companion.
 * Wires together all services and manages the application lifecycle.
 * 
 * Architecture:
 *   CalendarService  →  Store  →  DisplayComposer  →  EvenHubBridge
 *                         ↑                              |
 *                    EventMapper  ←  SDK Events  ←───────┘
 */

import { EvenHubBridge } from './services/evenhub-bridge';
import { CalendarService } from './services/calendar-service';
import { createStore, createInitialState } from './state/store';
import { composeStartupPage, formatDisplayText, CONTAINER_ID_TEXT, CONTAINER_NAME_TEXT } from './services/display-composer';
import { mapEvenHubEvent, extendTapCooldown } from './input/event-mapper';
import type { AppState } from './types/state.types';

// Configuration (should be loaded from environment)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// Global instances
let store: ReturnType<typeof createStore>;
let evenHub: EvenHubBridge;
let calendar: CalendarService;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let storeUnsubscribe: (() => void) | null = null;

/**
 * Initialize and start the application
 */
export async function initApp(): Promise<void> {
  console.log('[App] Initializing Calendar Companion...');

  try {
    // Create store
    store = createStore(createInitialState());
    
    // Initialize services
    evenHub = new EvenHubBridge();
    calendar = new CalendarService({
      clientId: GOOGLE_CLIENT_ID,
      apiKey: GOOGLE_API_KEY,
      scopes: [],
    });

    // Initialize Even Hub SDK
    console.log('[App] Initializing Even Hub...');
    await evenHub.init();

    // Initialize Calendar Service
    console.log('[App] Initializing Google Calendar...');
    await calendar.init();

    // Sign in to Google Calendar
    console.log('[App] Signing in to Google Calendar...');
    await calendar.signIn();

    // Setup initial page
    console.log('[App] Setting up display...');
    const startupPage = composeStartupPage(store.getState());
    await evenHub.setupPage(startupPage);

    // Subscribe to Even Hub events
    console.log('[App] Subscribing to events...');
    evenHub.subscribeEvents((event) => {
      const action = mapEvenHubEvent(event, store.getState());
      if (action) {
        store.dispatch(action);
      }
    });

    // Subscribe to store changes
    storeUnsubscribe = store.subscribe(handleStateChange);

    // Initial sync
    console.log('[App] Performing initial sync...');
    await syncCalendar();

    // Start auto-sync interval
    const syncIntervalMs = store.getState().settings.syncInterval;
    syncInterval = setInterval(() => {
      void syncCalendar();
    }, syncIntervalMs);

    // Mark initialization as successful
    store.dispatch({ type: 'INIT_SUCCESS' });

    console.log('[App] Initialization complete!');
  } catch (err) {
    console.error('[App] Initialization failed:', err);
    store.dispatch({ 
      type: 'INIT_ERROR', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
}

/**
 * Sync calendar events
 */
async function syncCalendar(): Promise<void> {
  console.log('[App] Syncing calendar...');
  
  store.dispatch({ type: 'SYNC_START' });

  try {
    const events = await calendar.getUpcomingEvents(10);
    console.log(`[App] Fetched ${events.length} events`);
    
    store.dispatch({ 
      type: 'SYNC_SUCCESS', 
      events 
    });
  } catch (err) {
    console.error('[App] Sync failed:', err);
    store.dispatch({ 
      type: 'SYNC_ERROR', 
      error: err instanceof Error ? err.message : 'Sync failed' 
    });
  }
}

/**
 * Handle state changes
 */
function handleStateChange(state: AppState, prevState: AppState): void {
  // Update display when state changes
  updateDisplay(state, prevState);

  // Handle phase transitions
  handlePhaseTransitions(state, prevState);

  // Handle menu selections
  handleMenuActions(state, prevState);

  // Handle settings changes
  handleSettingsChanges(state, prevState);
}

/**
 * Update display based on state
 */
async function updateDisplay(state: AppState, prevState: AppState): Promise<void> {
  // Check if display needs update
  const needsUpdate = 
    state.phase !== prevState.phase ||
    state.nextEvent !== prevState.nextEvent ||
    state.menuSelectedIndex !== prevState.menuSelectedIndex ||
    state.showDebugInfo !== prevState.showDebugInfo ||
    state.error !== prevState.error;

  if (!needsUpdate) {
    return;
  }

  // Format display text
  const displayText = formatDisplayText(state);

  // Update text container
  try {
    await evenHub.updateText(CONTAINER_ID_TEXT, CONTAINER_NAME_TEXT, displayText);
  } catch (err) {
    console.error('[App] Failed to update display:', err);
  }
}

/**
 * Handle phase transitions
 */
function handlePhaseTransitions(state: AppState, prevState: AppState): void {
  // Entering menu
  if (state.phase === 'menu' && prevState.phase !== 'menu') {
    extendTapCooldown(500); // Prevent accidental taps
  }

  // Exiting menu
  if (state.phase !== 'menu' && prevState.phase === 'menu') {
    extendTapCooldown(300);
  }

  // Entering settings
  if (state.phase === 'settings' && prevState.phase !== 'settings') {
    extendTapCooldown(500);
  }
}

/**
 * Handle menu actions
 */
function handleMenuActions(state: AppState, prevState: AppState): void {
  // Check if menu selection changed and we're leaving menu
  if (prevState.phase === 'menu' && state.phase !== 'menu') {
    const menuOptions = ['Refresh Now', 'Settings', 'View All Events', 'Toggle Debug', 'Exit'];
    const selected = menuOptions[prevState.menuSelectedIndex];

    if (selected === 'Exit') {
      void shutdownApp();
    }
  }

  // Handle refresh action
  if (state.phase === 'syncing' && prevState.phase !== 'syncing') {
    void syncCalendar();
  }
}

/**
 * Handle settings changes
 */
function handleSettingsChanges(state: AppState, prevState: AppState): void {
  // Restart sync interval if sync interval changed
  if (state.settings.syncInterval !== prevState.settings.syncInterval) {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    
    syncInterval = setInterval(() => {
      void syncCalendar();
    }, state.settings.syncInterval);
    
    console.log(`[App] Sync interval updated to ${state.settings.syncInterval}ms`);
  }
}

/**
 * Shutdown application
 */
async function shutdownApp(): Promise<void> {
  console.log('[App] Shutting down...');

  // Clear sync interval
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }

  // Unsubscribe from store
  if (storeUnsubscribe) {
    storeUnsubscribe();
    storeUnsubscribe = null;
  }

  // Sign out from calendar
  calendar.signOut();

  // Shutdown Even Hub
  await evenHub.shutdown();

  console.log('[App] Shutdown complete');
}

/**
 * Get current app status (for debugging)
 */
export function getAppStatus(): {
  state: AppState;
  evenHub: ReturnType<typeof evenHub.getStatus>;
  calendar: ReturnType<typeof calendar.getStatus>;
} {
  return {
    state: store.getState(),
    evenHub: evenHub.getStatus(),
    calendar: calendar.getStatus(),
  };
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  void shutdownApp();
});
