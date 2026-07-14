import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  CardValidator,
  MAX_CARD_NUMBER_LENGTH,
  MIN_CVC_LENGTH,
  MAX_CVC_LENGTH,
  CardBrand,
} from '../../../validators/card.validator';
import { CardBrandLogo } from '../../../components/ui/card-brand-logo.component';
import { CreditCard, Calendar, Lock, User } from 'lucide-react-native';
import { COLORS, SIZES, useResponsiveDimensions } from '../../../infrastructure/theme';
import { makeCardFormStyles } from './card-form.component.styles';

const EXPIRY_MAX_LENGTH = 5;

interface Props {
  onComplete: (data: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    holderName: string;
  }) => void;
  loading?: boolean;
}

export const CardFormComponent: React.FC<Props> = ({ onComplete, loading }) => {
  const { width, height } = useResponsiveDimensions();
  const styles = useMemo(
    () => StyleSheet.create(makeCardFormStyles({ width, height })),
    [width, height],
  );
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [holderName, setHolderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brand, setBrand] = useState<CardBrand>(CardBrand.UNKNOWN);

  useEffect(() => {
    const detected = CardValidator.detectBrand(cardNumber);
    setBrand(detected);
  }, [cardNumber]);

  const handleExpiryChange = (text: string) => {
    let formatted = text.replace(/\D/g, '');
    if (formatted.length > 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
    }
    setExpiry(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    try {
      CardValidator.assert(cardNumber, brand);
    } catch (error) {
      newErrors.cardNumber = error instanceof Error ? error.message : 'Número de tarjeta inválido';
    }

    const expiryValidation = CardValidator.validateExpiry(expiry);
    if (!expiryValidation.isValid) {
      newErrors.expiry = expiryValidation.error ?? 'Fecha inválida';
    }

    if (!CardValidator.isValidCvc(cvc)) {
      newErrors.cvc = `CVC inválido: debe tener ${MIN_CVC_LENGTH} o ${MAX_CVC_LENGTH} dígitos`;
    }

    if (!holderName.trim()) {
      newErrors.holderName = 'Nombre requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const [expMonth, expYear] = expiry.split('/');
      onComplete({
        cardNumber: cardNumber.replace(/\s/g, ''),
        expMonth,
        expYear: `20${expYear}`,
        cvc,
        holderName,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos de la Tarjeta</Text>
      <View style={styles.inputContainer}>
        <CreditCard size={SIZES.iconBase} color={COLORS.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Número de tarjeta"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={MAX_CARD_NUMBER_LENGTH}
          editable={!loading}
        />
        <CardBrandLogo brand={brand} />
      </View>
      {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfInputContainer]}>
          <Calendar size={SIZES.iconBase} color={COLORS.textSecondary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            value={expiry}
            onChangeText={handleExpiryChange}
            keyboardType="numeric"
            maxLength={EXPIRY_MAX_LENGTH}
            editable={!loading}
          />
        </View>
        <View style={[styles.inputContainer, styles.halfInputContainerLast]}>
          <Lock size={SIZES.iconBase} color={COLORS.textSecondary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="CVC"
            value={cvc}
            onChangeText={setCvc}
            keyboardType="numeric"
            maxLength={MAX_CVC_LENGTH}
            secureTextEntry
            editable={!loading}
          />
        </View>
      </View>
      <View style={styles.row}>
        {errors.expiry && <Text style={[styles.errorText, styles.halfErrorText]}>{errors.expiry}</Text>}
        {errors.cvc && <Text style={[styles.errorText, styles.halfErrorText]}>{errors.cvc}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <User size={SIZES.iconBase} color={COLORS.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre del titular"
          value={holderName}
          onChangeText={setHolderName}
          autoCapitalize="words"
          editable={!loading}
        />
      </View>
      {errors.holderName && <Text style={styles.errorText}>{errors.holderName}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Continuar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

