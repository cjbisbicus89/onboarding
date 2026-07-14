import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, SIZES } from '../../infrastructure/theme';

const QUANTITY_SPACING = 15;

export const checkoutStyles = {
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
    width: SIZES.headerIconSize,
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
    marginHorizontal: QUANTITY_SPACING,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: QUANTITY_SPACING,
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
    height: SIZES.buttonHeightLarge,
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
    marginTop: SPACING.huge,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
};
