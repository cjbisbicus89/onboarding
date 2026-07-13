export const COLORS = {
  primary: '#f4511e',
  primaryLight: '#ffab91',
  white: '#fff',
  black: '#000',
  textPrimary: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  textDark: '#444',
  border: '#ddd',
  borderLight: '#eee',
  borderLighter: '#f0f0f0',
  background: '#fff',
  backgroundSecondary: '#f9f9f9',
  backgroundLight: '#f8f8f8',
  errorBackground: '#f5f5f5',
  success: '#4CAF50',
  successLight: '#a5d6a7',
  error: '#f4511e',
  warning: '#FFC107',
  info: '#2196F3',
  disabled: '#ccc',
  overlay: '#000',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 15,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 40,
  huge: 50,
} as const;

export const SIZES = {
  buttonHeight: 56,
  buttonHeightLarge: 60,
  iconSmall: 16,
  iconBase: 20,
  iconLarge: 24,
  iconXLarge: 100,
  headerIconSize: 24,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
  title: 28,
  titleLarge: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 5,
  md: 8,
  lg: 28,
  xl: 30,
} as const;

export const SHADOWS = {
  default: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  subtle: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strong: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
} as const;
