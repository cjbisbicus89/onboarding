import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CardBrand } from '../../validators/card.validator';
import { makeCardBrandLogoStyles } from './card-brand-logo.component.styles';

interface CardBrandLogoProps {
  brand: CardBrand;
}

const LOGO_FADE_DURATION_MS = 150;

export const CardBrandLogo: React.FC<CardBrandLogoProps> = ({ brand }) => {
  const styles = StyleSheet.create(makeCardBrandLogoStyles());
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (brand === CardBrand.UNKNOWN) {
      return;
    }
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: LOGO_FADE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [brand, opacity]);

  if (brand === CardBrand.UNKNOWN) {
    return null;
  }

  const isVisa = brand === CardBrand.VISA;
  const isMastercard = brand === CardBrand.MASTERCARD;

  // Solo mostramos logos para VISA y MASTERCARD según el requerimiento plus
  if (!isVisa && !isMastercard) {
    return (
      <Animated.View style={[styles.badge, styles.otherBadge, { opacity }]}>
        <Text style={[styles.text, styles.otherText]}>{brand}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.badge, isVisa ? styles.visaBadge : styles.mastercardBadge, { opacity }]}>
      <Text style={[styles.text, isVisa ? styles.visaText : styles.mastercardText]}>
        {brand}
      </Text>
    </Animated.View>
  );
};

