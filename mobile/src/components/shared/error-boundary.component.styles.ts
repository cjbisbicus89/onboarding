import { COLORS, FONT_SIZES, SPACING } from '../../infrastructure/theme';

export const makeErrorBoundaryStyles = () => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.errorBackground,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
} as const);
