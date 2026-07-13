import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardBrand } from '../../validators/card.validator';
import { COLORS, FONT_SIZES, SPACING } from '../../infrastructure/theme';

const VISA_BACKGROUND = '#1A1F71';
const MASTERCARD_BACKGROUND = '#EB001B';
const BRAND_GRAY = '#666666';

interface CardBrandLogoProps {
  brand: CardBrand;
}

export const CardBrandLogo: React.FC<CardBrandLogoProps> = ({ brand }) => {
  if (brand === CardBrand.UNKNOWN) {
    return null;
  }

  const isVisa = brand === CardBrand.VISA;
  const isMastercard = brand === CardBrand.MASTERCARD;

  // Solo mostramos logos para VISA y MASTERCARD según el requerimiento plus
  if (!isVisa && !isMastercard) {
    return (
      <View style={[styles.badge, styles.otherBadge]}>
        <Text style={[styles.text, styles.otherText]}>{brand}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, isVisa ? styles.visaBadge : styles.mastercardBadge]}>
      <Text style={[styles.text, isVisa ? styles.visaText : styles.mastercardText]}>
        {brand}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  visaBadge: {
    backgroundColor: VISA_BACKGROUND,
  },
  mastercardBadge: {
    backgroundColor: MASTERCARD_BACKGROUND,
  },
  otherBadge: {
    backgroundColor: BRAND_GRAY,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
});
