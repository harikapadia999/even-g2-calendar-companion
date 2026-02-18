/**
 * Display Type Definitions
 * 
 * G2 Display Specifications (VERIFIED):
 * - Resolution: 576×288 pixels (Even Hub SDK coordinate system)
 * - Actual G2 hardware: 640×350 pixels
 * - SDK uses scaled coordinates for compatibility
 * - Monochrome: 1-bit (black/white only)
 * - Image containers: max 200×100 pixels each
 */

export const G2_DISPLAY = {
  // Even Hub SDK coordinate system
  WIDTH: 576,
  HEIGHT: 288,
  
  // Image container limits
  IMAGE_MAX_WIDTH: 200,
  IMAGE_MAX_HEIGHT: 100,
  
  // Actual hardware specs (for reference)
  HARDWARE_WIDTH: 640,
  HARDWARE_HEIGHT: 350,
  REFRESH_RATE: 60, // Hz
  BRIGHTNESS_MAX: 1200, // nits
} as const;

export interface DisplayLayout {
  textArea: LayoutRegion;
  imageArea?: LayoutRegion;
  brandingArea?: LayoutRegion;
}

export interface LayoutRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CalendarDisplayLayout {
  title: LayoutRegion;
  time: LayoutRegion;
  location: LayoutRegion;
  timeUntil: LayoutRegion;
  duration: LayoutRegion;
  footer: LayoutRegion;
}

export interface TextStyle {
  fontSize?: number;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right';
  maxLines?: number;
  ellipsis?: boolean;
}

export interface DisplayContent {
  text: string;
  style?: TextStyle;
}

/**
 * Calendar layout optimized for G2 display
 * 
 * Layout strategy:
 * - Left side (376px): Text content
 * - Right side (200px): Optional calendar icon/graphic
 * - Top (24px): Branding/status
 */
export const CALENDAR_LAYOUT: CalendarDisplayLayout = {
  title: {
    x: 10,
    y: 30,
    width: 356,
    height: 50,
  },
  time: {
    x: 10,
    y: 90,
    width: 356,
    height: 35,
  },
  location: {
    x: 10,
    y: 135,
    width: 356,
    height: 30,
  },
  timeUntil: {
    x: 10,
    y: 175,
    width: 356,
    height: 35,
  },
  duration: {
    x: 10,
    y: 220,
    width: 356,
    height: 25,
  },
  footer: {
    x: 10,
    y: 255,
    width: 356,
    height: 20,
  },
};

export const TEXT_AREA_LAYOUT: LayoutRegion = {
  x: 0,
  y: 0,
  width: 376, // Left side for text
  height: 288,
};

export const IMAGE_AREA_LAYOUT: LayoutRegion = {
  x: 376, // Right side for images
  y: 44, // Vertically centered
  width: 200,
  height: 200,
};

export const BRANDING_AREA_LAYOUT: LayoutRegion = {
  x: 188, // Centered
  y: 4,
  width: 200,
  height: 24,
};
