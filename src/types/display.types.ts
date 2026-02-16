/**
 * Display Type Definitions
 * Optimized for Even G2 640×350 monochrome display
 * 
 * ACTUAL G2 SPECIFICATIONS:
 * - Resolution: 640×350 pixels
 * - Refresh Rate: 60Hz
 * - Brightness: 1200 nits
 * - Display: Green Micro-LED with waveguides
 * - Field of View: 27.5° binocular
 * - Passthrough: 98%
 */

/**
 * Display Dimensions - CORRECTED FOR G2
 */
export const DISPLAY_DIMENSIONS = {
  WIDTH: 640,
  HEIGHT: 350, // CORRECTED
  ASPECT_RATIO: 1.83,
  REFRESH_RATE: 60, // CORRECTED
  BRIGHTNESS_MAX: 1200,
  FOV: 27.5,
} as const;

/**
 * Predefined Display Regions for Calendar Layout
 * UPDATED for 640×350 resolution
 */
export const CALENDAR_LAYOUT = {
  TITLE: { x: 10, y: 30, width: 620, height: 60 },
  TIME: { x: 10, y: 110, width: 620, height: 40 },
  LOCATION: { x: 10, y: 170, width: 620, height: 35 },
  TIME_UNTIL: { x: 10, y: 225, width: 620, height: 40 },
  DURATION: { x: 10, y: 285, width: 620, height: 30 },
  FOOTER: { x: 10, y: 325, width: 620, height: 20 },
} as const;

export interface DisplayRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum FontSize {
  TINY = 12,
  SMALL = 16,
  MEDIUM = 20,
  LARGE = 28,
  XLARGE = 36,
  XXLARGE = 48,
}

export interface TextStyle {
  fontSize: FontSize;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right';
}

export interface DisplayElement {
  id: string;
  region: DisplayRegion;
  content: string;
  style: TextStyle;
  visible: boolean;
}

export interface CalendarDisplayLayout {
  title: DisplayElement;
  timeRange: DisplayElement;
  location?: DisplayElement;
  timeUntil: DisplayElement;
  duration?: DisplayElement;
  footer?: DisplayElement;
}

export enum DisplayUpdateType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  INCREMENTAL = 'INCREMENTAL',
}

export interface DisplayUpdate {
  type: DisplayUpdateType;
  elements: DisplayElement[];
  clearBefore?: boolean;
  timestamp: Date;
}

export interface TextWrappingOptions {
  maxWidth: number;
  maxLines: number;
  ellipsis: boolean;
  wordWrap: boolean;
}

export interface TextMeasurement {
  width: number;
  height: number;
  lines: string[];
  truncated: boolean;
}

export interface DisplayRendererConfig {
  defaultFontSize: FontSize;
  lineHeight: number;
  letterSpacing: number;
  maxCharsPerLine: number;
  maxLines: number;
  enableAntialiasing: boolean;
}

export interface RenderingMetrics {
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenders: number;
  failedRenders: number;
  lastUpdate: Date;
}

export interface DisplayState {
  isActive: boolean;
  brightness: number;
  autoBrightness: boolean;
  currentLayout: CalendarDisplayLayout | null;
  lastUpdate: Date | null;
  metrics: RenderingMetrics;
}

export interface IDisplayRenderer {
  initialize(config: DisplayRendererConfig): void;
  createCalendarLayout(
    title: string,
    timeRange: string,
    location?: string,
    timeUntil?: string,
    duration?: string,
    footer?: string
  ): CalendarDisplayLayout;
  wrapText(text: string, options: TextWrappingOptions): string[];
  measureText(text: string, style: TextStyle): TextMeasurement;
  truncateText(text: string, maxWidth: number, style: TextStyle): string;
  renderLayout(layout: CalendarDisplayLayout): DisplayUpdate;
  renderElement(element: DisplayElement): DisplayUpdate;
  clearRegion(region: DisplayRegion): DisplayUpdate;
  clearAll(): DisplayUpdate;
  calculateDiff(
    previous: CalendarDisplayLayout | null,
    current: CalendarDisplayLayout
  ): DisplayUpdate;
  getState(): DisplayState;
  getMetrics(): RenderingMetrics;
}

export interface ITextFormatter {
  formatTimeRange(start: Date, end: Date, format: '12h' | '24h'): string;
  formatDuration(milliseconds: number): string;
  formatTimeUntil(milliseconds: number): string;
  formatDate(date: Date, format: 'short' | 'medium' | 'long'): string;
  truncate(text: string, maxLength: number, ellipsis?: boolean): string;
  capitalize(text: string): string;
  removeEmojis(text: string): string;
  sanitize(text: string): string;
  formatEventTitle(title: string, maxLength: number): string;
  formatLocation(location: string, maxLength: number): string;
  formatAttendees(attendees: string[], maxLength: number): string;
}

export enum OptimizationStrategy {
  QUALITY = 'QUALITY',
  BALANCED = 'BALANCED',
  PERFORMANCE = 'PERFORMANCE',
}

export interface DisplayOptimizationConfig {
  strategy: OptimizationStrategy;
  enableCaching: boolean;
  enableDiffing: boolean;
  batchUpdates: boolean;
  updateThrottleMs: number;
}

export interface BitmapData {
  width: number;
  height: number;
  data: Uint8Array;
}

export enum IconType {
  CALENDAR = 'CALENDAR',
  CLOCK = 'CLOCK',
  LOCATION = 'LOCATION',
  PERSON = 'PERSON',
  VIDEO = 'VIDEO',
  PHONE = 'PHONE',
  WARNING = 'WARNING',
  CHECK = 'CHECK',
  BATTERY = 'BATTERY',
  WIFI = 'WIFI',
}

export interface IconDefinition {
  type: IconType;
  width: number;
  height: number;
  data: Uint8Array;
}

export enum DisplayErrorType {
  RENDER_FAILED = 'RENDER_FAILED',
  INVALID_LAYOUT = 'INVALID_LAYOUT',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  REGION_OUT_OF_BOUNDS = 'REGION_OUT_OF_BOUNDS',
  UNSUPPORTED_CHARACTER = 'UNSUPPORTED_CHARACTER',
  BRIGHTNESS_OUT_OF_RANGE = 'BRIGHTNESS_OUT_OF_RANGE',
  UNKNOWN = 'UNKNOWN',
}

export interface DisplayError {
  type: DisplayErrorType;
  message: string;
  element?: DisplayElement;
  timestamp: Date;
}

export interface G2DisplayFeatures {
  autoBrightness: boolean;
  waveguideMode: 'standard' | 'enhanced';
  displayDepth: number;
  edgeEnhancement: boolean;
}

export interface AdvancedLayoutOptions {
  enableMultiLine: boolean;
  maxLinesPerSection: number;
  sectionSpacing: number;
  showFooter: boolean;
  adaptiveFontSize: boolean;
}
