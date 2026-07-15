import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../infrastructure/theme';

const QUANTITY_SPACING_RATIO = 0.04;
const PAY_BUTTON_HEIGHT_RATIO = 0.08;
const HEADER_ICON_SIZE_RATIO = 0.06;

export const makeCheckoutStyles = ({ width, height }: { width: number; height: number }) => {
  const quantitySpacing = width * QUANTITY_SPACING_RATIO;
  const headerIconSize = width * HEADER_ICON_SIZE_RATIO;
  const payButtonHeight = height * PAY_BUTTON_HEIGHT_RATIO;

  return {
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
    },
    headerTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    headerRightSpacer: {
      width: headerIconSize,
    },
    listContent: {
      padding: SPACING.lg,
    },
    cartItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
      paddingBottom: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLighter,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: FONT_SIZES.base,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
    },
    itemPrice: {
      fontSize: FONT_SIZES.md,
      color: COLORS.primary,
      fontWeight: '600',
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    qtyButton: {
      padding: SPACING.xs,
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: BORDER_RADIUS.sm,
    },
    quantity: {
      marginHorizontal: quantitySpacing,
      fontSize: FONT_SIZES.base,
      fontWeight: 'bold',
    },
    removeButton: {
      marginLeft: quantitySpacing,
    },
    pressedButton: {
      opacity: 0.7,
    },
    footer: {
      padding: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: COLORS.borderLight,
      backgroundColor: COLORS.backgroundSecondary,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.lg,
    },
    totalLabel: {
      fontSize: FONT_SIZES.lg,
      color: COLORS.textSecondary,
    },
    totalValue: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: 'bold',
      color: COLORS.primary,
    },
    payButton: {
      backgroundColor: COLORS.primary,
      flexDirection: 'row',
      height: payButtonHeight,
      borderRadius: BORDER_RADIUS.xl,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.subtle,
    },
    payButtonText: {
      color: COLORS.white,
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
      marginLeft: SPACING.sm,
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: height * 0.12,
    },
    emptyText: {
      fontSize: FONT_SIZES.lg,
      color: COLORS.textMuted,
    },
  } as const;
};
