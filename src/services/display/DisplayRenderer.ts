/**
 * Display Renderer
 * Optimizes calendar event display for Even G2 640×200 monochrome screen
 */

import {
  IDisplayRenderer,
  DisplayRendererConfig,
  CalendarDisplayLayout,
  DisplayElement,
  DisplayUpdate,
  DisplayUpdateType,
  DisplayState,
  RenderingMetrics,
  TextWrappingOptions,
  TextMeasurement,
  TextStyle,
  FontSize,
  DisplayRegion,
  CALENDAR_LAYOUT,
  DISPLAY_DIMENSIONS,
} from '@/types/display.types';
import { TextFormatter } from './TextFormatter';

/**
 * Default Configuration
 */
const DEFAULT_CONFIG: DisplayRendererConfig = {
  defaultFontSize: FontSize.MEDIUM,
  lineHeight: 22,
  letterSpacing: 1,
  maxCharsPerLine: 50,
  maxLines: 8,
  enableAntialiasing: false, // Not applicable for monochrome
};

/**
 * Display Renderer Implementation
 */
export class DisplayRenderer implements IDisplayRenderer {
  private config: DisplayRendererConfig;
  private textFormatter: TextFormatter;
  private state: DisplayState;
  private currentLayout: CalendarDisplayLayout | null = null;

  constructor(config: Partial<DisplayRendererConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.textFormatter = new TextFormatter();
    this.state = {
      isActive: false,
      brightness: 100,
      autoBrightness: true,
      currentLayout: null,
      lastUpdate: null,
      metrics: {
        lastRenderTime: 0,
        averageRenderTime: 0,
        totalRenders: 0,
        failedRenders: 0,
        lastUpdate: new Date(),
      },
    };
  }

  /**
   * Initialize renderer
   */
  initialize(config: DisplayRendererConfig): void {
    this.config = { ...this.config, ...config };
    console.log('Display renderer initialized');
  }

  /**
   * Create calendar layout from event data
   */
  createCalendarLayout(
    title: string,
    timeRange: string,
    location?: string,
    timeUntil?: string,
    duration?: string
  ): CalendarDisplayLayout {
    const layout: CalendarDisplayLayout = {
      title: {
        id: 'title',
        region: CALENDAR_LAYOUT.TITLE,
        content: this.textFormatter.formatEventTitle(title, 60),
        style: {
          fontSize: FontSize.LARGE,
          bold: true,
          alignment: 'left',
        },
        visible: true,
      },
      timeRange: {
        id: 'timeRange',
        region: CALENDAR_LAYOUT.TIME,
        content: timeRange,
        style: {
          fontSize: FontSize.MEDIUM,
          bold: false,
          alignment: 'left',
        },
        visible: true,
      },
      timeUntil: {
        id: 'timeUntil',
        region: CALENDAR_LAYOUT.TIME_UNTIL,
        content: timeUntil || '',
        style: {
          fontSize: FontSize.MEDIUM,
          bold: true,
          alignment: 'left',
        },
        visible: !!timeUntil,
      },
    };

    if (location) {
      layout.location = {
        id: 'location',
        region: CALENDAR_LAYOUT.LOCATION,
        content: this.textFormatter.formatLocation(location, 50),
        style: {
          fontSize: FontSize.SMALL,
          bold: false,
          alignment: 'left',
        },
        visible: true,
      };
    }

    if (duration) {
      layout.duration = {
        id: 'duration',
        region: CALENDAR_LAYOUT.DURATION,
        content: duration,
        style: {
          fontSize: FontSize.SMALL,
          bold: false,
          alignment: 'left',
        },
        visible: true,
      };
    }

    return layout;
  }

  /**
   * Wrap text to fit within width constraints
   */
  wrapText(text: string, options: TextWrappingOptions): string[] {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';
    
    // Estimate characters per line based on width and font size
    const avgCharWidth = 8; // Approximate for monospace-ish display
    const maxCharsPerLine = Math.floor(options.maxWidth / avgCharWidth);

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        
        if (lines.length >= options.maxLines) {
          if (options.ellipsis) {
            lines[lines.length - 1] = lines[lines.length - 1].slice(0, -3) + '...';
          }
          break;
        }
        
        currentLine = word;
      }
    }

    if (currentLine && lines.length < options.maxLines) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Measure text dimensions
   */
  measureText(text: string, style: TextStyle): TextMeasurement {
    const avgCharWidth = this.getCharWidth(style.fontSize);
    const width = text.length * avgCharWidth;
    const height = style.fontSize + 4; // Font size + spacing
    
    const maxWidth = DISPLAY_DIMENSIONS.WIDTH - 20; // Account for margins
    const lines = this.wrapText(text, {
      maxWidth,
      maxLines: this.config.maxLines,
      ellipsis: true,
      wordWrap: true,
    });

    return {
      width: Math.min(width, maxWidth),
      height: lines.length * height,
      lines,
      truncated: lines.length > 1 || text.length * avgCharWidth > maxWidth,
    };
  }

  /**
   * Truncate text to fit width
   */
  truncateText(text: string, maxWidth: number, style: TextStyle): string {
    const avgCharWidth = this.getCharWidth(style.fontSize);
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    
    if (text.length <= maxChars) {
      return text;
    }
    
    return text.slice(0, maxChars - 3) + '...';
  }

  /**
   * Render complete calendar layout
   */
  renderLayout(layout: CalendarDisplayLayout): DisplayUpdate {
    const startTime = Date.now();
    
    try {
      const elements: DisplayElement[] = [];
      
      // Collect all visible elements
      if (layout.title.visible) elements.push(layout.title);
      if (layout.timeRange.visible) elements.push(layout.timeRange);
      if (layout.location?.visible) elements.push(layout.location);
      if (layout.timeUntil.visible) elements.push(layout.timeUntil);
      if (layout.duration?.visible) elements.push(layout.duration);

      this.currentLayout = layout;
      this.state.currentLayout = layout;
      this.state.lastUpdate = new Date();
      
      const update: DisplayUpdate = {
        type: DisplayUpdateType.FULL,
        elements,
        clearBefore: true,
        timestamp: new Date(),
      };

      this.updateMetrics(Date.now() - startTime, true);
      
      return update;
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Render single element
   */
  renderElement(element: DisplayElement): DisplayUpdate {
    const startTime = Date.now();
    
    try {
      const update: DisplayUpdate = {
        type: DisplayUpdateType.PARTIAL,
        elements: [element],
        clearBefore: false,
        timestamp: new Date(),
      };

      this.updateMetrics(Date.now() - startTime, true);
      
      return update;
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Clear display region
   */
  clearRegion(region: DisplayRegion): DisplayUpdate {
    return {
      type: DisplayUpdateType.PARTIAL,
      elements: [],
      clearBefore: true,
      timestamp: new Date(),
    };
  }

  /**
   * Clear entire display
   */
  clearAll(): DisplayUpdate {
    this.currentLayout = null;
    this.state.currentLayout = null;
    
    return {
      type: DisplayUpdateType.FULL,
      elements: [],
      clearBefore: true,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate diff between layouts for incremental updates
   */
  calculateDiff(
    previous: CalendarDisplayLayout | null,
    current: CalendarDisplayLayout
  ): DisplayUpdate {
    if (!previous) {
      return this.renderLayout(current);
    }

    const changedElements: DisplayElement[] = [];

    // Check each element for changes
    if (this.hasElementChanged(previous.title, current.title)) {
      changedElements.push(current.title);
    }
    if (this.hasElementChanged(previous.timeRange, current.timeRange)) {
      changedElements.push(current.timeRange);
    }
    if (this.hasElementChanged(previous.location, current.location)) {
      if (current.location) changedElements.push(current.location);
    }
    if (this.hasElementChanged(previous.timeUntil, current.timeUntil)) {
      changedElements.push(current.timeUntil);
    }
    if (this.hasElementChanged(previous.duration, current.duration)) {
      if (current.duration) changedElements.push(current.duration);
    }

    const updateType = changedElements.length === 0
      ? DisplayUpdateType.FULL
      : changedElements.length > 2
      ? DisplayUpdateType.FULL
      : DisplayUpdateType.INCREMENTAL;

    return {
      type: updateType,
      elements: updateType === DisplayUpdateType.FULL
        ? this.getAllElements(current)
        : changedElements,
      clearBefore: updateType === DisplayUpdateType.FULL,
      timestamp: new Date(),
    };
  }

  /**
   * Get current state
   */
  getState(): DisplayState {
    return { ...this.state };
  }

  /**
   * Get rendering metrics
   */
  getMetrics(): RenderingMetrics {
    return { ...this.state.metrics };
  }

  /**
   * Private Helper Methods
   */

  private hasElementChanged(prev?: DisplayElement, current?: DisplayElement): boolean {
    if (!prev && !current) return false;
    if (!prev || !current) return true;
    return prev.content !== current.content || prev.visible !== current.visible;
  }

  private getAllElements(layout: CalendarDisplayLayout): DisplayElement[] {
    const elements: DisplayElement[] = [layout.title, layout.timeRange, layout.timeUntil];
    if (layout.location) elements.push(layout.location);
    if (layout.duration) elements.push(layout.duration);
    return elements.filter(e => e.visible);
  }

  private getCharWidth(fontSize: FontSize): number {
    // Approximate character width based on font size
    switch (fontSize) {
      case FontSize.SMALL:
        return 7;
      case FontSize.MEDIUM:
        return 9;
      case FontSize.LARGE:
        return 12;
      case FontSize.XLARGE:
        return 16;
      default:
        return 9;
    }
  }

  private updateMetrics(renderTime: number, success: boolean): void {
    const metrics = this.state.metrics;
    
    metrics.lastRenderTime = renderTime;
    metrics.totalRenders++;
    
    if (!success) {
      metrics.failedRenders++;
    }
    
    // Calculate rolling average
    metrics.averageRenderTime =
      (metrics.averageRenderTime * (metrics.totalRenders - 1) + renderTime) /
      metrics.totalRenders;
    
    metrics.lastUpdate = new Date();
  }
}

/**
 * Export singleton instance
 */
export const displayRenderer = new DisplayRenderer();
