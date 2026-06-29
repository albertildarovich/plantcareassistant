export const colors = {
  // Primary
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',

  // Secondary
  secondary: '#81C784',
  secondaryDark: '#66BB6A',

  // Accent
  accent: '#FFB74D',
  accentDark: '#FFA726',

  // Background
  background: '#F5F7FA',
  white: '#FFFFFF',

  // Gray scale
  gray50: '#F8F9FA',
  gray100: '#F0F0F0',
  gray200: '#E0E0E0',
  gray300: '#BDBDBD',
  gray400: '#9E9E9E',
  gray500: '#757575',
  gray600: '#616161',
  gray700: '#424242',
  gray800: '#303030',
  gray900: '#212121',

  // Status colors
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  info: '#1976D2',
  infoLight: '#E3F2FD',

  // Plant-specific
  leafGreen: '#43A047',
  soilBrown: '#795548',
  skyBlue: '#42A5F5',
  sunYellow: '#FFEE58',
  waterBlue: '#29B6F6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
} as const;
