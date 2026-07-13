import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
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
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES } from '../../../infrastructure/theme';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (p: number) => (width * p) / 100;
const responsiveHeight = (p: number) => (height * p) / 100;

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
        <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
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
        <View style={[styles.inputContainer, { flex: 1 }]}>
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
        {errors.expiry && <Text style={[styles.errorText, { flex: 1 }]}>{errors.expiry}</Text>}
        {errors.cvc && <Text style={[styles.errorText, { flex: 1 }]}>{errors.cvc}</Text>}
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

const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(5),
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: responsiveWidth(5),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: responsiveHeight(6),
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: responsiveWidth(4),
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  brandText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: responsiveHeight(7),
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  disabledButton: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});
