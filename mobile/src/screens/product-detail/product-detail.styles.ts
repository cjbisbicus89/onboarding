import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES, SHADOWS } from '../../infrastructure/theme';

const PRODUCT_IMAGE_HEIGHT_RATIO = 0.4;
const QUANTITY_BUTTON_SIZE = 40;

export const makeProductDetailStyles = ({ width, height }: { width: number; height: number }) => ({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * PRODUCT_IMAGE_HEIGHT_RATIO,
    backgroundColor: COLORS.borderLight,
  },
  infoContainer: {
    padding: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  stock: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textDark,
    lineHeight: FONT_SIZES.xl,
    marginBottom: SPACING.lg,
  },
  quantityContainer: {
    marginBottom: SPACING.lg,
  },
  quantityLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: QUANTITY_BUTTON_SIZE,
    height: QUANTITY_BUTTON_SIZE,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledQtyButton: {
    borderColor: COLORS.border,
  },
  quantityValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    minWidth: SIZES.quantityMinWidth,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: SIZES.buttonHeight,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.default,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
} as const);
