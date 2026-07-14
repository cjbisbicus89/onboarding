import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, SIZES } from '../../infrastructure/theme';

export const resultStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  icon: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  transactionId: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxxl,
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: SIZES.buttonHeight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.default,
  },
  retryButton: {
    flexDirection: 'row',
    height: SIZES.buttonHeight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 2,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  homeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  retryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
} as const;
