import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES, SHADOWS } from '../../infrastructure/theme';

export const homeStyles = {
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
    width: SIZES.productImage,
    height: SIZES.productImage,
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
    width: SIZES.buttonHeightLarge,
    height: SIZES.buttonHeightLarge,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.strong,
  },
  cartBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    minWidth: SPACING.lg,
    height: SPACING.lg,
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
