import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardBrand } from '../../validators/card.validator';
import { makeCardBrandLogoStyles } from './card-brand-logo.component.styles';

interface CardBrandLogoProps {
  brand: CardBrand;
}

export const CardBrandLogo: React.FC<CardBrandLogoProps> = ({ brand }) => {
  const styles = StyleSheet.create(makeCardBrandLogoStyles());

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

