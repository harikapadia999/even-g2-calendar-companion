/**
 * State Management Store
 * 
 * Simple Redux-like store for managing application state.
 */

import type { AppState, AppAction, Store } from '@/types/state.types';
import { DEFAULT_CALENDAR_SETTINGS } from '@/types/calendar.types';
import { getNextEvent } from '@/utils/format-utils';

/**
 * Create initial state
 */
export function createInitialState(): AppState {
  return {
    phase: 'loading',
    nextEvent: null,
    upcomingEvents: [],
    syncStatus: {
      lastSyncTime: null,
      isSyncing: false,
      error: null,
      nextSyncTime: null,
    },
    settings: DEFAULT_CALENDAR_SETTINGS,
    selectedEventIndex: 0,
    menuSelectedIndex: 0,
    showDebugInfo: false,
    error: null,
    lastUpdateTime: null,
    appStartTime: new Date(),
  };
}

/**
 * State reducer
 */
function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT_SUCCESS':
      return {
        ...state,
        phase: 'idle',
        error: null,
      };

    case 'INIT_ERROR':
      return {
        ...state,
        phase: 'error',
        error: action.error,
      };

    case 'SYNC_START':
      return {
        ...state,
        phase: 'syncing',
        syncStatus: {
          ...state.syncStatus,
          isSyncing: true,
          error: null,
        },
      };

    case 'SYNC_SUCCESS': {
      const nextEvent = getNextEvent(action.events);
      return {
        ...state,
        phase: 'idle',
        upcomingEvents: action.events,
        nextEvent,
        syncStatus: {
          lastSyncTime: new Date(),
          isSyncing: false,
          error: null,
          nextSyncTime: new Date(Date.now() + state.settings.syncInterval),
        },
        lastUpdateTime: new Date(),
        error: null,
      };
    }

    case 'SYNC_ERROR':
      return {
        ...state,
        phase: 'error',
        syncStatus: {
          ...state.syncStatus,
          isSyncing: false,
          error: action.error,
        },
        error: action.error,
      };

    case 'UPDATE_NEXT_EVENT':
      return {
        ...state,
        nextEvent: action.event,
        lastUpdateTime: new Date(),
      };

    case 'NAVIGATE_UP':
      if (state.phase === 'menu') {
        return {
          ...state,
          menuSelectedIndex: Math.max(0, state.menuSelectedIndex - 1),
        };
      }
      return state;

    case 'NAVIGATE_DOWN':
      if (state.phase === 'menu') {
        const maxIndex = 4; // 5 menu options (0-4)
        return {
          ...state,
          menuSelectedIndex: Math.min(maxIndex, state.menuSelectedIndex + 1),
        };
      }
      return state;

    case 'SELECT':
      if (state.phase === 'menu') {
        // Handle menu selection
        return handleMenuSelection(state);
      }
      return state;

    case 'BACK':
      if (state.phase === 'menu' || state.phase === 'settings' || state.phase === 'eventDetails') {
        return {
          ...state,
          phase: 'idle',
        };
      }
      return state;

    case 'OPEN_MENU':
      return {
        ...state,
        phase: 'menu',
        menuSelectedIndex: 0,
      };

    case 'CLOSE_MENU':
      return {
        ...state,
        phase: 'idle',
      };

    case 'OPEN_SETTINGS':
      return {
        ...state,
        phase: 'settings',
      };

    case 'CLOSE_SETTINGS':
      return {
        ...state,
        phase: 'idle',
      };

    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: action.value,
        },
      };

    case 'TOGGLE_DEBUG':
      return {
        ...state,
        showDebugInfo: !state.showDebugInfo,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        phase: state.phase === 'error' ? 'idle' : state.phase,
      };

    case 'REFRESH':
      return {
        ...state,
        phase: 'syncing',
      };

    default:
      return state;
  }
}

/**
 * Handle menu selection
 */
function handleMenuSelection(state: AppState): AppState {
  const menuOptions = ['Refresh Now', 'Settings', 'View All Events', 'Toggle Debug', 'Exit'];
  const selected = menuOptions[state.menuSelectedIndex];

  switch (selected) {
    case 'Refresh Now':
      return {
        ...state,
        phase: 'syncing',
      };

    case 'Settings':
      return {
        ...state,
        phase: 'settings',
      };

    case 'View All Events':
      return {
        ...state,
        phase: 'eventDetails',
      };

    case 'Toggle Debug':
      return {
        ...state,
        showDebugInfo: !state.showDebugInfo,
        phase: 'idle',
      };

    case 'Exit':
      // Exit will be handled by app shutdown
      return state;

    default:
      return state;
  }
}

/**
 * Create store
 */
export function createStore(initialState?: AppState): Store {
  let state = initialState || createInitialState();
  const listeners: Array<(state: AppState, prevState: AppState) => void> = [];

  return {
    getState: () => state,

    dispatch: (action: AppAction) => {
      const prevState = state;
      state = reducer(state, action);

      if (state !== prevState) {
        listeners.forEach(listener => listener(state, prevState));
      }
    },

    subscribe: (listener: (state: AppState, prevState: AppState) => void) => {
      listeners.push(listener);

      // Return unsubscribe function
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
  };
}
