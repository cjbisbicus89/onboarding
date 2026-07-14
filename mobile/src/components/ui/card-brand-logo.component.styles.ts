import { COLORS, FONT_SIZES, SPACING } from '../../infrastructure/theme';

const BRAND_LOGO_LETTER_SPACING = 0.5;

export const makeCardBrandLogoStyles = () => ({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  visaBadge: {
    backgroundColor: COLORS.visaBackground,
  },
  mastercardBadge: {
    backgroundColor: COLORS.mastercardBackground,
  },
  otherBadge: {
    backgroundColor: COLORS.brandGray,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    letterSpacing: BRAND_LOGO_LETTER_SPACING,
  },
  visaText: {
    color: COLORS.white,
  },
  mastercardText: {
    color: COLORS.white,
  },
  otherText: {
    color: COLORS.white,
  },
} as const);
