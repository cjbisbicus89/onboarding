import { COLORS, FONT_SIZES, SPACING, SHADOWS } from '../../infrastructure/theme';

const LOGO_SIZE_RATIO = 0.35;
const MAX_LOGO_SIZE = 160;
const CIRCLE_TOP_SIZE_RATIO = 0.65;
const CIRCLE_TOP_TOP_RATIO = -0.25;
const CIRCLE_TOP_LEFT_RATIO = -0.2;
const CIRCLE_BOTTOM_SIZE_RATIO = 0.75;
const CIRCLE_BOTTOM_BOTTOM_RATIO = -0.3;
const CIRCLE_BOTTOM_RIGHT_RATIO = -0.2;

export const makeSplashStyles = ({ width }: { width: number }) => {
  const logoSize = Math.min(width * LOGO_SIZE_RATIO, MAX_LOGO_SIZE);
  return {
    container: {
      flex: 1,
      backgroundColor: COLORS.primary,
    },
    circleTop: {
      position: 'absolute',
      top: width * CIRCLE_TOP_TOP_RATIO,
      left: width * CIRCLE_TOP_LEFT_RATIO,
      width: width * CIRCLE_TOP_SIZE_RATIO,
      height: width * CIRCLE_TOP_SIZE_RATIO,
      borderRadius: (width * CIRCLE_TOP_SIZE_RATIO) / 2,
      backgroundColor: COLORS.primaryLight,
      opacity: 0.2,
    },
    circleBottom: {
      position: 'absolute',
      bottom: width * CIRCLE_BOTTOM_BOTTOM_RATIO,
      right: width * CIRCLE_BOTTOM_RIGHT_RATIO,
      width: width * CIRCLE_BOTTOM_SIZE_RATIO,
      height: width * CIRCLE_BOTTOM_SIZE_RATIO,
      borderRadius: (width * CIRCLE_BOTTOM_SIZE_RATIO) / 2,
      backgroundColor: COLORS.white,
      opacity: 0.1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    logoContainer: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      backgroundColor: COLORS.white,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.strong,
      marginBottom: SPACING.xl,
    },
    logoText: {
      fontSize: logoSize * 0.45,
      fontWeight: 'bold',
      color: COLORS.primary,
    },
    title: {
      fontSize: FONT_SIZES.titleLarge,
      fontWeight: 'bold',
      color: COLORS.white,
      textAlign: 'center',
    },
    tagline: {
      fontSize: FONT_SIZES.lg,
      color: COLORS.white,
      opacity: 0.9,
      marginTop: SPACING.sm,
    },
    loader: {
      marginTop: SPACING.xxl,
    },
    subtitle: {
      fontSize: FONT_SIZES.base,
      color: COLORS.white,
      opacity: 0.9,
      marginTop: SPACING.md,
    },
  } as const;
};
