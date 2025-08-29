/**
 * Application Constants and Configuration
 * 
 * Centralized configuration file containing all constants used throughout
 * the application. This includes color palettes, UI dimensions, file types,
 * theme settings, and animation parameters.
 */

/**
 * Color Palette for Cluster Visualization
 * 
 * Comprehensive color palette organized by color families for consistent
 * and visually appealing cluster differentiation. Colors are selected
 * to provide good contrast and accessibility while maintaining visual harmony.
 * 
 * Organization:
 * - Blue/Sky family for primary clusters
 * - Purple/Violet family for secondary clusters  
 * - Pink/Rose/Fuchsia family for accent clusters
 * - Orange/Yellow/Amber family for warm clusters
 * - Teal/Cyan family for cool clusters
 * - Gray families for neutral/disabled states
 */
export const colours = [
  // Blue Family - Primary cluster colors
  '#3B82F6', // Blue 500 - Standard blue
  '#1E40AF', // Blue 700 - Darker blue
  '#60A5FA', // Blue 400 - Lighter blue
  '#1D4ED8', // Blue 600 - Medium blue
  '#2563EB', // Blue 600 - Alternative medium blue
  '#1E3A8A', // Blue 800 - Deep blue
  
  // Extended Blue/Sky Variants - Secondary blues
  '#0EA5E9', // Sky 500 - Bright sky blue
  '#0284C7', // Sky 600 - Medium sky blue
  '#0369A1', // Sky 700 - Darker sky blue
  '#075985', // Sky 800 - Deep sky blue
  '#38BDF8', // Sky 400 - Light sky blue
  '#7DD3FC', // Sky 300 - Very light sky blue
  
  // Purple Family - Accent colors
  '#8B5CF6', // Purple 500 - Standard purple
  '#7C3AED', // Purple 600 - Darker purple
  '#A855F7', // Purple 500 - Alternative purple
  '#9333EA', // Purple 600 - Medium purple
  '#6D28D9', // Purple 700 - Deep purple
  '#C084FC', // Purple 400 - Light purple
  '#A78BFA', // Purple 400 - Alternative light purple
  '#581C87', // Purple 800 - Very deep purple
  '#4C1D95', // Purple 900 - Darkest purple
  
  // Violet Extended - Purple variations
  '#DDD6FE', // Violet 200 - Very light violet
  '#C4B5FD', // Violet 300 - Light violet
  '#A78BFA', // Violet 400 - Medium light violet
  '#8B5CF6', // Violet 500 - Standard violet
  '#7C3AED', // Violet 600 - Medium violet
  '#6D28D9', // Violet 700 - Dark violet
  '#5B21B6', // Violet 800 - Very dark violet
  
  // Pink/Magenta Family - Warm accent colors
  '#EC4899', // Pink 500 - Standard pink
  '#DB2777', // Pink 600 - Darker pink
  '#F472B6', // Pink 400 - Light pink
  '#BE185D', // Pink 700 - Deep pink
  '#9D174D', // Pink 800 - Very deep pink
  '#F9A8D4', // Pink 300 - Very light pink
  
  // Rose Family - Red-pink variations
  '#E11D48', // Rose 600 - Deep rose
  '#FB7185', // Rose 400 - Light rose
  '#F43F5E', // Rose 500 - Standard rose
  '#BE123C', // Rose 700 - Dark rose
  
  // Fuchsia Family - Bright pink-purple
  '#F472B6', // Fuchsia 400 - Light fuchsia
  '#E879F9', // Fuchsia 500 - Standard fuchsia
  '#D946EF', // Fuchsia 600 - Medium fuchsia
  '#C026D3', // Fuchsia 700 - Dark fuchsia
  '#A21CAF', // Fuchsia 800 - Very dark fuchsia
  '#86198F', // Fuchsia 900 - Darkest fuchsia
  
  // Orange Family - Warm colors
  '#F97316', // Orange 500 - Standard orange
  '#EA580C', // Orange 600 - Darker orange
  '#FB923C', // Orange 400 - Light orange
  '#C2410C', // Orange 700 - Deep orange
  '#9A3412', // Orange 800 - Very deep orange
  '#7C2D12', // Orange 900 - Darkest orange
  '#FDBA74', // Orange 300 - Very light orange
  
  // Yellow/Amber Family - Bright warm colors
  '#F59E0B', // Amber 500 - Standard amber
  '#D97706', // Amber 600 - Darker amber
  '#FBBF24', // Amber 400 - Light amber
  '#92400E', // Amber 800 - Very deep amber
  '#EAB308', // Yellow 500 - Standard yellow
  '#FDE047', // Yellow 300 - Light yellow
  '#FACC15', // Yellow 400 - Medium yellow
  '#CA8A04', // Yellow 600 - Darker yellow
  '#A16207', // Yellow 700 - Deep yellow
  '#FCD34D', // Amber 300 - Light amber
  '#B45309', // Amber 700 - Deep amber
  
  // Teal/Cyan Family - Cool colors
  '#06B6D4', // Cyan 500 - Standard cyan
  '#0891B2', // Cyan 600 - Darker cyan
  '#22D3EE', // Cyan 400 - Light cyan
  '#0E7490', // Cyan 700 - Deep cyan
  '#164E63', // Cyan 800 - Very deep cyan
  '#67E8F9', // Cyan 300 - Very light cyan
  '#14B8A6', // Teal 500 - Standard teal
  '#0D9488', // Teal 600 - Darker teal
  '#0F766E', // Teal 700 - Deep teal
  '#115E59', // Teal 800 - Very deep teal
  '#5EEAD4', // Teal 300 - Light teal
  '#2DD4BF', // Teal 400 - Medium light teal
  
  // Indigo Family - Deep blue-purple
  '#6366F1', // Indigo 500 - Standard indigo
  '#4F46E5', // Indigo 600 - Darker indigo
  '#818CF8', // Indigo 400 - Light indigo
  '#3730A3', // Indigo 700 - Deep indigo
  '#4338CA', // Indigo 600 - Alternative darker indigo
  '#A5B4FC', // Indigo 300 - Very light indigo
  '#312E81', // Indigo 900 - Darkest indigo
  
  // Warm Grays/Browns - Neutral warm tones
  '#D6D3D1', // Stone 300 - Light warm gray
  '#A8A29E', // Stone 400 - Medium light warm gray
  '#78716C', // Stone 500 - Medium warm gray
  '#57534E', // Stone 600 - Darker warm gray
  '#44403C', // Stone 700 - Deep warm gray
  '#292524', // Stone 800 - Very deep warm gray
  
  // Cool Grays - Neutral cool tones
  '#CBD5E1', // Slate 300 - Light cool gray
  '#94A3B8', // Slate 400 - Medium light cool gray
  '#64748B', // Slate 500 - Medium cool gray
  '#475569', // Slate 600 - Darker cool gray
  '#334155', // Slate 700 - Deep cool gray
  '#1E293B', // Slate 800 - Very deep cool gray
  
  // Neutral Grays - Pure neutral tones
  '#D4D4D8', // Zinc 300 - Light neutral gray
  '#A1A1AA', // Zinc 400 - Medium light neutral gray
  '#71717A', // Zinc 500 - Medium neutral gray
  '#52525B', // Zinc 600 - Darker neutral gray
  '#3F3F46', // Zinc 700 - Deep neutral gray
  '#27272A', // Zinc 800 - Very deep neutral gray
  
  // Additional Neutral Tones - Extra neutral options
  '#A3A3A3', // Gray 400 - Standard light gray
  '#737373', // Gray 500 - Standard medium gray
  '#525252', // Gray 600 - Standard dark gray
];

/**
 * UI Layout and Sizing Constants
 * 
 * Defines all layout dimensions, spacing, and sizing parameters used
 * throughout the visualization components. These values control the
 * matrix layout, sidebar behavior, and visual element positioning.
 */
export const UI_CONSTANTS = {
  // Sidebar constraints and defaults
  SIDEBAR_MIN_WIDTH: 200,        // Minimum sidebar width (pixels)
  SIDEBAR_MAX_WIDTH: 600,        // Maximum sidebar width (pixels)
  SIDEBAR_DEFAULT_WIDTH: 320,    // Default sidebar width (pixels)
  
  // Matrix visualization dimensions
  CELL_SIZE: 50,                 // Size of each matrix cell (pixels)
  CLUSTER_WIDTH: 100,            // Width allocated for cluster labels (pixels)
  BACTERIA_SPACING: 30,          // Vertical spacing between bacteria rows (pixels)
  CLUSTER_SPACING: 15,           // Vertical spacing between clusters (pixels)
  
  // SVG margins for proper layout
  MARGIN: {
    TOP: 150,                    // Top margin for phage headers (pixels)
    RIGHT: 40,                   // Right margin (pixels)
    BOTTOM: 40,                  // Bottom margin (pixels)
    LEFT: 20,                    // Left margin (pixels)
  },
  
  // Label positioning offsets
  CLUSTER_LABEL_OFFSET_X: -15,   // Horizontal offset for cluster labels (pixels)
  BACTERIA_LABEL_OFFSET_X: -12,  // Horizontal offset for bacteria labels (pixels)
} as const;

/**
 * File Upload Configuration
 * 
 * Defines accepted file types and extensions for Excel file uploads.
 * Used for file validation and browser file picker configuration.
 */
export const ACCEPTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx files
  'application/vnd.ms-excel', // .xls files
] as const;

export const ACCEPTED_FILE_EXTENSIONS = ['.xlsx', '.xls'] as const;

/**
 * Theme Management Constants
 * 
 * Configuration for theme persistence and default values.
 */
export const THEME_STORAGE_KEY = 'theme';    // localStorage key for theme persistence
export const DEFAULT_THEME = 'light';       // Default theme when none is stored

/**
 * Animation and Interaction Constants
 * 
 * Timing parameters for animations, loading states, and user interactions.
 * These values provide consistent timing across the application.
 */
export const ANIMATION_DURATION = 500;           // Standard animation duration (milliseconds)
export const LOADING_SIMULATION_INTERVAL = 150;  // Loading progress update interval (milliseconds)
export const LOADING_INCREMENT = 10;             // Loading progress increment per interval
