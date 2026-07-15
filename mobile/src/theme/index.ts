export { Colors } from './colors';
export { Spacing } from './spacing';
export { Radius } from './radius';
export { Shadows } from './shadows';
export { AnimationConfig } from './animation';
export { useResponsiveDimensions, responsiveWidth, responsiveHeight } from './responsive';
export { Sizes } from './sizes';
export { Typography } from './typography';

import { Colors } from './colors';
import { Spacing } from './spacing';
import { Radius } from './radius';
import { Shadows } from './shadows';
import { AnimationConfig } from './animation';
import { Sizes } from './sizes';
import { Typography } from './typography';

export const Theme = {
  colors: {
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    primaryDark: '#c63e13',
    success: Colors.success,
    successLight: Colors.successLight,
    error: Colors.error,
    errorLight: '#f8c3c4',
    warning: Colors.warning,
    warningLight: '#ffecb3',
    info: Colors.info,
    infoLight: '#b3e0fc',
    neutral: {
      '100': '#ffffff',
      '200': '#f5f5f5',
      '300': '#eeeeee',
      '400': '#cccccc',
      '500': '#999999',
      '600': '#666666',
      '700': '#444444',
      '800': '#333333',
      '900': '#000000',
    },
    background: Colors.background,
    backgroundSecondary: Colors.backgroundSecondary,
    textPrimary: Colors.textPrimary,
    textSecondary: Colors.textSecondary,
    textMuted: Colors.textMuted,
    overlay: Colors.overlay,
    visaBackground: Colors.visaBackground,
    mastercardBackground: Colors.mastercardBackground,
    brandGray: Colors.brandGray,
  },
  spacing: {
    xs: Spacing.xs,
    sm: Spacing.sm,
    md: 12,
    base: Spacing.base,
    lg: Spacing.lg,
    xl: Spacing.xl,
    xxl: Spacing.xxl,
    xxxl: Spacing.xxxl,
  },
  radius: {
    sm: Radius.sm,
    md: Radius.md,
    lg: Radius.lg,
    xl: Radius.xl,
  },
  typography: {
    xs: Typography.xs,
    sm: Typography.sm,
    md: Typography.md,
    base: Typography.base,
    lg: Typography.lg,
    xl: Typography.xl,
    xxl: Typography.xxl,
    xxxl: Typography.xxxl,
    title: Typography.title,
    titleLarge: Typography.titleLarge,
    weights: {
      normal: '400',
      semibold: '600',
      bold: '700',
    },
  },
  shadows: Shadows,
  animation: AnimationConfig,
  sizes: Sizes,
} as const;
