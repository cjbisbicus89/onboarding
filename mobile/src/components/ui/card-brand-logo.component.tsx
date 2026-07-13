import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardBrand } from '../../validators/card.validator';

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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  visaBadge: {
    backgroundColor: '#1A1F71',
  },
  mastercardBadge: {
    backgroundColor: '#EB001B',
  },
  otherBadge: {
    backgroundColor: '#666666',
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  visaText: {
    color: '#FFFFFF',
  },
  mastercardText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#FFFFFF',
  },
});
