// Color palette for clusters
export const colours = [
  // Blue Family
  '#3B82F6', // Blue 500
  '#1E40AF', // Blue 700
  '#60A5FA', // Blue 400
  '#1D4ED8', // Blue 600
  '#2563EB', // Blue 600
  '#1E3A8A', // Blue 800
  
  // Extended Blue/Sky Variants
  '#0EA5E9', // Sky 500
  '#0284C7', // Sky 600
  '#0369A1', // Sky 700
  '#075985', // Sky 800
  '#38BDF8', // Sky 400
  '#7DD3FC', // Sky 300
  
  // Purple Family
  '#8B5CF6', // Purple 500
  '#7C3AED', // Purple 600
  '#A855F7', // Purple 500
  '#9333EA', // Purple 600
  '#6D28D9', // Purple 700
  '#C084FC', // Purple 400
  '#A78BFA', // Purple 400
  '#581C87', // Purple 800
  '#4C1D95', // Purple 900
  
  // Violet Extended
  '#DDD6FE', // Violet 200
  '#C4B5FD', // Violet 300
  '#A78BFA', // Violet 400
  '#8B5CF6', // Violet 500
  '#7C3AED', // Violet 600
  '#6D28D9', // Violet 700
  '#5B21B6', // Violet 800
  
  // Pink/Magenta Family
  '#EC4899', // Pink 500
  '#DB2777', // Pink 600
  '#F472B6', // Pink 400
  '#BE185D', // Pink 700
  '#9D174D', // Pink 800
  '#F9A8D4', // Pink 300
  
  // Rose Family
  '#E11D48', // Rose 600
  '#FB7185', // Rose 400
  '#F43F5E', // Rose 500
  '#BE123C', // Rose 700
  
  // Fuchsia Family
  '#F472B6', // Fuchsia 400
  '#E879F9', // Fuchsia 500
  '#D946EF', // Fuchsia 600
  '#C026D3', // Fuchsia 700
  '#A21CAF', // Fuchsia 800
  '#86198F', // Fuchsia 900
  
  // Orange Family
  '#F97316', // Orange 500
  '#EA580C', // Orange 600
  '#FB923C', // Orange 400
  '#C2410C', // Orange 700
  '#9A3412', // Orange 800
  '#7C2D12', // Orange 900
  '#FDBA74', // Orange 300
  
  // Yellow/Amber Family
  '#F59E0B', // Amber 500
  '#D97706', // Amber 600
  '#FBBF24', // Amber 400
  '#92400E', // Amber 800
  '#EAB308', // Yellow 500
  '#FDE047', // Yellow 300
  '#FACC15', // Yellow 400
  '#CA8A04', // Yellow 600
  '#A16207', // Yellow 700
  '#FCD34D', // Amber 300
  '#B45309', // Amber 700
  
  // Teal/Cyan Family
  '#06B6D4', // Cyan 500
  '#0891B2', // Cyan 600
  '#22D3EE', // Cyan 400
  '#0E7490', // Cyan 700
  '#164E63', // Cyan 800
  '#67E8F9', // Cyan 300
  '#14B8A6', // Teal 500
  '#0D9488', // Teal 600
  '#0F766E', // Teal 700
  '#115E59', // Teal 800
  '#5EEAD4', // Teal 300
  '#2DD4BF', // Teal 400
  
  // Indigo Family
  '#6366F1', // Indigo 500
  '#4F46E5', // Indigo 600
  '#818CF8', // Indigo 400
  '#3730A3', // Indigo 700
  '#4338CA', // Indigo 600
  '#A5B4FC', // Indigo 300
  '#312E81', // Indigo 900
  
  // Warm Grays/Browns
  '#D6D3D1', // Stone 300
  '#A8A29E', // Stone 400
  '#78716C', // Stone 500
  '#57534E', // Stone 600
  '#44403C', // Stone 700
  '#292524', // Stone 800
  
  // Cool Grays
  '#CBD5E1', // Slate 300
  '#94A3B8', // Slate 400
  '#64748B', // Slate 500
  '#475569', // Slate 600
  '#334155', // Slate 700
  '#1E293B', // Slate 800
  
  // Neutral Grays
  '#D4D4D8', // Zinc 300
  '#A1A1AA', // Zinc 400
  '#71717A', // Zinc 500
  '#52525B', // Zinc 600
  '#3F3F46', // Zinc 700
  '#27272A', // Zinc 800
  
  // Additional Neutral Tones
  '#A3A3A3', // Gray 400
  '#737373', // Gray 500
  '#525252', // Gray 600
];

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_MIN_WIDTH: 200,
  SIDEBAR_MAX_WIDTH: 600,
  SIDEBAR_DEFAULT_WIDTH: 320,
  CELL_SIZE: 50,
  CLUSTER_WIDTH: 100,
  BACTERIA_SPACING: 30,
  CLUSTER_SPACING: 15,
  MARGIN: {
    TOP: 150,
    RIGHT: 40,
    BOTTOM: 40,
    LEFT: 20,
  },
  CLUSTER_LABEL_OFFSET_X: -15,
  BACTERIA_LABEL_OFFSET_X: -12,
} as const;

// File type constants
export const ACCEPTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
] as const;

export const ACCEPTED_FILE_EXTENSIONS = ['.xlsx', '.xls'] as const;

// Theme related constants
export const THEME_STORAGE_KEY = 'theme';
export const DEFAULT_THEME = 'light';

// Animation constants
export const ANIMATION_DURATION = 500;
export const LOADING_SIMULATION_INTERVAL = 150;
export const LOADING_INCREMENT = 10;
