/**
 * Calendar Service
 * 
 * Handles Google Calendar API integration for fetching events.
 * Runs in browser context (web app inside Even Hub).
 */

import type { CalendarEvent } from '@/types/calendar.types';

export interface CalendarServiceConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export class CalendarService {
  private config: CalendarServiceConfig;
  private isInitialized = false;
  private isSignedIn = false;
  private gapiLoaded = false;
  private gisLoaded = false;
  private tokenClient: any = null;

  constructor(config: CalendarServiceConfig) {
    this.config = {
      ...config,
      scopes: config.scopes.length > 0 ? config.scopes : DEFAULT_SCOPES,
    };
  }

  /**
   * Initialize Google Calendar API
   * Loads gapi and gis libraries
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[CalendarService] Already initialized');
      return;
    }

    try {
      console.log('[CalendarService] Initializing...');
      
      // Load Google API scripts
      await this.loadGoogleAPIs();
      
      // Initialize gapi client
      await this.initializeGapiClient();
      
      // Initialize Google Identity Services
      this.initializeGIS();
      
      this.isInitialized = true;
      console.log('[CalendarService] Initialization complete');
    } catch (err) {
      console.error('[CalendarService] Initialization failed:', err);
      throw new Error('Failed to initialize Google Calendar API');
    }
  }

  /**
   * Load Google API scripts dynamically
   */
  private async loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load gapi
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => {
        this.gapiLoaded = true;
        console.log('[CalendarService] gapi loaded');
        
        // Load gis
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        gisScript.onload = () => {
          this.gisLoaded = true;
          console.log('[CalendarService] gis loaded');
          resolve();
        };
        gisScript.onerror = () => reject(new Error('Failed to load gis'));
        document.head.appendChild(gisScript);
      };
      gapiScript.onerror = () => reject(new Error('Failed to load gapi'));
      document.head.appendChild(gapiScript);
    });
  }

  /**
   * Initialize gapi client
   */
  private async initializeGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      (window as any).gapi.load('client', async () => {
        try {
          await (window as any).gapi.client.init({
            apiKey: this.config.apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          });
          console.log('[CalendarService] gapi client initialized');
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Initialize Google Identity Services
   */
  private initializeGIS(): void {
    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      callback: '', // Will be set during sign-in
    });
    console.log('[CalendarService] GIS token client initialized');
  }

  /**
   * Sign in to Google account
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CalendarService not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.callback = async (response: any) => {
          if (response.error !== undefined) {
            reject(new Error(response.error));
            return;
          }
          
          this.isSignedIn = true;
          console.log('[CalendarService] Sign-in successful');
          resolve();
        };

        // Check if already has valid token
        if ((window as any).gapi.client.getToken() === null) {
          // Prompt for consent
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          // Skip consent if already granted
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Sign out from Google account
   */
  signOut(): void {
    const token = (window as any).gapi.client.getToken();
    if (token !== null) {
      (window as any).google.accounts.oauth2.revoke(token.access_token);
      (window as any).gapi.client.setToken('');
      this.isSignedIn = false;
      console.log('[CalendarService] Signed out');
    }
  }

  /**
   * Fetch upcoming events from Google Calendar
   */
  async getUpcomingEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    if (!this.isInitialized) {
      throw new Error('CalendarService not initialized');
    }

    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      const now = new Date();
      const response = await (window as any).gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime',
      });

      const events = response.result.items || [];
      console.log(`[CalendarService] Fetched ${events.length} events`);

      return events.map((event: any) => this.parseGoogleEvent(event));
    } catch (err) {
      console.error('[CalendarService] Failed to fetch events:', err);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Get next upcoming event
   */
  async getNextEvent(): Promise<CalendarEvent | null> {
    const events = await this.getUpcomingEvents(1);
    return events.length > 0 ? events[0] : null;
  }

  /**
   * Parse Google Calendar event to our format
   */
  private parseGoogleEvent(googleEvent: any): CalendarEvent {
    const start = googleEvent.start.dateTime || googleEvent.start.date;
    const end = googleEvent.end.dateTime || googleEvent.end.date;
    const isAllDay = !googleEvent.start.dateTime;

    return {
      id: googleEvent.id,
      title: googleEvent.summary || '(No title)',
      startTime: new Date(start),
      endTime: new Date(end),
      location: googleEvent.location,
      description: googleEvent.description,
      isAllDay,
      calendarId: 'primary',
      calendarName: 'Google Calendar',
      attendees: googleEvent.attendees?.map((a: any) => a.email) || [],
      organizer: googleEvent.organizer?.email,
      status: googleEvent.status,
      color: googleEvent.colorId,
    };
  }

  /**
   * Check if signed in
   */
  getSignInStatus(): boolean {
    return this.isSignedIn;
  }

  /**
   * Get service status for debugging
   */
  getStatus(): {
    isInitialized: boolean;
    isSignedIn: boolean;
    gapiLoaded: boolean;
    gisLoaded: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isSignedIn: this.isSignedIn,
      gapiLoaded: this.gapiLoaded,
      gisLoaded: this.gisLoaded,
    };
  }
}
