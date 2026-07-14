import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../infrastructure/theme';

const HORIZONTAL_PADDING_RATIO = 0.05;
const TITLE_FONT_SIZE_RATIO = 0.05;
const TITLE_MARGIN_BOTTOM_RATIO = 0.02;
const BUTTON_HEIGHT_RATIO = 0.07;
const LEGAL_LINE_HEIGHT = FONT_SIZES.lg;

export const makePaymentSummaryStyles = ({ width, height }: { width: number; height: number }) => ({
  container: {
    padding: width * HORIZONTAL_PADDING_RATIO,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: width * TITLE_FONT_SIZE_RATIO,
    fontWeight: 'bold',
    marginBottom: height * TITLE_MARGIN_BOTTOM_RATIO,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  itemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDark,
    marginBottom: SPACING.xs / 2,
  },
  legalSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  legalText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: LEGAL_LINE_HEIGHT,
  },
  legalLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    height: height * BUTTON_HEIGHT_RATIO,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  disabledButton: {
    backgroundColor: COLORS.successLight,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
} as const);
