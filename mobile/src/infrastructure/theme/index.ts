import { AnimationConfig } from '../../theme/animation';
import { Colors } from '../../theme/colors';
import { Radius } from '../../theme/radius';
import { Shadows } from '../../theme/shadows';
import { Sizes } from '../../theme/sizes';
import { Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { useResponsiveDimensions } from '../../theme/responsive';

export const COLORS = Colors;
export const SPACING = Spacing;
export const BORDER_RADIUS = Radius;
export const SHADOWS = Shadows;
export const SIZES = Sizes;
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
};
export { AnimationConfig, useResponsiveDimensions };
