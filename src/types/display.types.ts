/**
 * Display Type Definitions
 * Optimized for Even G2 640×200 monochrome display
 */

/**
 * Display Dimensions
 */
export const DISPLAY_DIMENSIONS = {
  WIDTH: 640,
  HEIGHT: 200,
  ASPECT_RATIO: 3.2, // 640/200
} as const;

/**
 * Display Region
 */
export interface DisplayRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Predefined Display Regions for Calendar Layout
 */
export const CALENDAR_LAYOUT = {
  TITLE: { x: 10, y: 20, width: 620, height: 40 },
  TIME: { x: 10, y: 70, width: 620, height: 30 },
  LOCATION: { x: 10, y: 110, width: 620, height: 25 },
  TIME_UNTIL: { x: 10, y: 145, width: 620, height: 25 },
  DURATION: { x: 10, y: 175, width: 620, height: 20 },
} as const;

/**
 * Font Sizes (in pixels)
 */
export enum FontSize {
  SMALL = 14,
  MEDIUM = 18,
  LARGE = 24,
  XLARGE = 32,
}

/**
 * Text Style
 */
export interface TextStyle {
  fontSize: FontSize;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Display Element
 */
export interface DisplayElement {
  id: string;
  region: DisplayRegion;
  content: string;
  style: TextStyle;
  visible: boolean;
}

/**
 * Calendar Display Layout
 */
export interface CalendarDisplayLayout {
  title: DisplayElement;
  timeRange: DisplayElement;
  location?: DisplayElement;
  timeUntil: DisplayElement;
  duration?: DisplayElement;
}

/**
 * Display Update Type
 */
export enum DisplayUpdateType {
  FULL = 'FULL', // Complete screen refresh
  PARTIAL = 'PARTIAL', // Update specific regions
  INCREMENTAL = 'INCREMENTAL', // Only changed elements
}

/**
 * Display Update
 */
export interface DisplayUpdate {
  type: DisplayUpdateType;
  elements: DisplayElement[];
  clearBefore?: boolean;
  timestamp: Date;
}

/**
 * Text Wrapping Options
 */
export interface TextWrappingOptions {
  maxWidth: number; // pixels
  maxLines: number;
  ellipsis: boolean; // Add "..." if truncated
  wordWrap: boolean; // Wrap at word boundaries
}

/**
 * Text Measurement
 */
export interface TextMeasurement {
  width: number;
  height: number;
  lines: string[];
  truncated: boolean;
}

/**
 * Display Renderer Configuration
 */
export interface DisplayRendererConfig {
  defaultFontSize: FontSize;
  lineHeight: number; // pixels
  letterSpacing: number; // pixels
  maxCharsPerLine: number;
  maxLines: number;
  enableAntialiasing: boolean;
}

/**
 * Rendering Performance Metrics
 */
export interface RenderingMetrics {
  lastRenderTime: number; // ms
  averageRenderTime: number; // ms
  totalRenders: number;
  failedRenders: number;
  lastUpdate: Date;
}

/**
 * Display State
 */
export interface DisplayState {
  isActive: boolean;
  brightness: number; // 0-100
  autoBrightness: boolean;
  currentLayout: CalendarDisplayLayout | null;
  lastUpdate: Date | null;
  metrics: RenderingMetrics;
}

/**
 * Display Renderer Interface
 */
export interface IDisplayRenderer {
  // Initialization
  initialize(config: DisplayRendererConfig): void;
  
  // Layout Management
  createCalendarLayout(
    title: string,
    timeRange: string,
    location?: string,
    timeUntil?: string,
    duration?: string
  ): CalendarDisplayLayout;
  
  // Text Processing
  wrapText(text: string, options: TextWrappingOptions): string[];
  measureText(text: string, style: TextStyle): TextMeasurement;
  truncateText(text: string, maxWidth: number, style: TextStyle): string;
  
  // Rendering
  renderLayout(layout: CalendarDisplayLayout): DisplayUpdate;
  renderElement(element: DisplayElement): DisplayUpdate;
  clearRegion(region: DisplayRegion): DisplayUpdate;
  clearAll(): DisplayUpdate;
  
  // Optimization
  calculateDiff(
    previous: CalendarDisplayLayout | null,
    current: CalendarDisplayLayout
  ): DisplayUpdate;
  
  // State
  getState(): DisplayState;
  getMetrics(): RenderingMetrics;
}

/**
 * Text Formatter Interface
 */
export interface ITextFormatter {
  // Date/Time Formatting
  formatTimeRange(start: Date, end: Date, format: '12h' | '24h'): string;
  formatDuration(milliseconds: number): string;
  formatTimeUntil(milliseconds: number): string;
  formatDate(date: Date, format: 'short' | 'medium' | 'long'): string;
  
  // Text Processing
  truncate(text: string, maxLength: number, ellipsis?: boolean): string;
  capitalize(text: string): string;
  removeEmojis(text: string): string; // G2 can't display emojis
  sanitize(text: string): string; // Remove unsupported characters
  
  // Calendar-specific
  formatEventTitle(title: string, maxLength: number): string;
  formatLocation(location: string, maxLength: number): string;
  formatAttendees(attendees: string[], maxLength: number): string;
}

/**
 * Display Optimization Strategy
 */
export enum OptimizationStrategy {
  QUALITY = 'QUALITY', // Best visual quality, slower
  BALANCED = 'BALANCED', // Balance quality and speed
  PERFORMANCE = 'PERFORMANCE', // Fastest, minimal quality loss
}

/**
 * Display Optimization Config
 */
export interface DisplayOptimizationConfig {
  strategy: OptimizationStrategy;
  enableCaching: boolean;
  enableDiffing: boolean;
  batchUpdates: boolean;
  updateThrottleMs: number;
}

/**
 * Bitmap Data (for future graphics support)
 */
export interface BitmapData {
  width: number;
  height: number;
  data: Uint8Array; // 1 bit per pixel (monochrome)
}

/**
 * Icon Type (predefined icons for common elements)
 */
export enum IconType {
  CALENDAR = 'CALENDAR',
  CLOCK = 'CLOCK',
  LOCATION = 'LOCATION',
  PERSON = 'PERSON',
  VIDEO = 'VIDEO',
  PHONE = 'PHONE',
  WARNING = 'WARNING',
  CHECK = 'CHECK',
}

/**
 * Icon Definition
 */
export interface IconDefinition {
  type: IconType;
  width: number;
  height: number;
  data: Uint8Array;
}

/**
 * Display Error Types
 */
export enum DisplayErrorType {
  RENDER_FAILED = 'RENDER_FAILED',
  INVALID_LAYOUT = 'INVALID_LAYOUT',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  REGION_OUT_OF_BOUNDS = 'REGION_OUT_OF_BOUNDS',
  UNSUPPORTED_CHARACTER = 'UNSUPPORTED_CHARACTER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Display Error
 */
export interface DisplayError {
  type: DisplayErrorType;
  message: string;
  element?: DisplayElement;
  timestamp: Date;
}
