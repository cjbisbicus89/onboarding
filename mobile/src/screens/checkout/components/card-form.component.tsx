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
import { CardValidator } from '../../../validators/card.validator';
import { CreditCard, Calendar, Lock, User } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (p: number) => (width * p) / 100;
const responsiveHeight = (p: number) => (height * p) / 100;

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
  const [brand, setBrand] = useState<'VISA' | 'MASTERCARD' | 'UNKNOWN'>('UNKNOWN');

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
    } catch (e: any) {
      newErrors.cardNumber = e.message;
    }

    if (!expiry || expiry.length !== 5) {
      newErrors.expiry = 'Fecha inválida (MM/YY)';
    } else {
      const [m, y] = expiry.split('/');
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);
      if (month < 1 || month > 12) newErrors.expiry = 'Mes inválido';
    }

    if (!cvc || cvc.length < 3) newErrors.cvc = 'CVC inválido';
    if (!holderName) newErrors.holderName = 'Nombre requerido';

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
        <CreditCard size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Número de tarjeta"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={19}
          editable={!loading}
        />
        {brand !== 'UNKNOWN' && (
          <Text style={styles.brandText}>{brand}</Text>
        )}
      </View>
      {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Calendar size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            value={expiry}
            onChangeText={handleExpiryChange}
            keyboardType="numeric"
            maxLength={5}
            editable={!loading}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Lock size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="CVC"
            value={cvc}
            onChangeText={setCvc}
            keyboardType="numeric"
            maxLength={4}
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
        <User size={20} color="#666" style={styles.icon} />
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
          <ActivityIndicator color="#fff" />
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: responsiveWidth(5),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: responsiveHeight(6),
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: responsiveWidth(4),
    color: '#333',
  },
  row: {
    flexDirection: 'row',
  },
  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#f4511e',
    height: responsiveHeight(7),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ffab91',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
