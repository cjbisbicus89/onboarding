import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../infrastructure/theme';

const PRODUCT_IMAGE_SIZE_RATIO = 0.22;
const CART_BUTTON_SIZE_RATIO = 0.14;
const CART_BADGE_SIZE_RATIO = 0.08;

export const makeHomeStyles = ({ width, height }: { width: number; height: number }) => {
  const productImageSize = width * PRODUCT_IMAGE_SIZE_RATIO;
  const cartButtonSize = width * CART_BUTTON_SIZE_RATIO;
  const cartBadgeSize = width * CART_BADGE_SIZE_RATIO;

  return {
    container: {
      flex: 1,
      backgroundColor: COLORS.backgroundLight,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    listContent: {
      padding: SPACING.md,
    },
    productCard: {
      backgroundColor: COLORS.background,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.md,
      overflow: 'hidden',
      ...SHADOWS.light,
      flexDirection: 'row',
    },
    productImage: {
      width: productImageSize,
      height: productImageSize,
      backgroundColor: COLORS.borderLight,
    },
    productInfo: {
      flex: 1,
      padding: SPACING.sm,
      justifyContent: 'center',
    },
    productName: {
      fontSize: FONT_SIZES.base,
      fontWeight: 'bold',
      marginBottom: SPACING.xs,
    },
    productPrice: {
      fontSize: FONT_SIZES.md,
      color: COLORS.primary,
      fontWeight: '600',
      marginBottom: SPACING.xs / 2,
    },
    productStock: {
      fontSize: FONT_SIZES.sm,
      color: COLORS.textSecondary,
    },
    errorText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.error,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm,
    },
    retryText: {
      color: COLORS.white,
      fontWeight: 'bold',
    },
    cartButton: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      backgroundColor: COLORS.primary,
      width: cartButtonSize,
      height: cartButtonSize,
      borderRadius: cartButtonSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.strong,
    },
    cartBadge: {
      position: 'absolute',
      top: -SPACING.xs,
      right: -SPACING.xs,
      backgroundColor: COLORS.error,
      borderRadius: cartBadgeSize / 2,
      minWidth: cartBadgeSize,
      height: cartBadgeSize,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xs,
    },
    cartBadgeText: {
      color: COLORS.white,
      fontSize: FONT_SIZES.sm,
      fontWeight: 'bold',
    },
  } as const;
};
