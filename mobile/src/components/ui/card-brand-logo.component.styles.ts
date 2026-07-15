import { Theme } from '../../infrastructure/theme';

const BRAND_LOGO_LETTER_SPACING = 0.5;

export const makeCardBrandLogoStyles = () => ({
  badge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs / 2,
    borderRadius: Theme.spacing.xs,
    marginLeft: Theme.spacing.sm,
  },
  visaBadge: {
    backgroundColor: Theme.colors.visaBackground,
  },
  mastercardBadge: {
    backgroundColor: Theme.colors.mastercardBackground,
  },
  otherBadge: {
    backgroundColor: Theme.colors.brandGray,
  },
  text: {
    fontSize: Theme.typography.xs,
    fontWeight: Theme.typography.weights.bold,
    letterSpacing: BRAND_LOGO_LETTER_SPACING,
  },
  visaText: {
    color: Theme.colors.neutral['100'],
  },
  mastercardText: {
    color: Theme.colors.neutral['100'],
  },
  otherText: {
    color: Theme.colors.neutral['100'],
  },
} as const);
