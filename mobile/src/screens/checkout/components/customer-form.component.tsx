import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { User, Mail } from 'lucide-react-native';
import { COLORS, SIZES, useResponsiveDimensions } from '../../../infrastructure/theme';
import { makeCustomerFormStyles } from './customer-form.component.styles';

interface Props {
  initialData: {
    email: string;
    fullName: string;
  };
  onComplete: (data: { email: string; fullName: string }) => void;
}

export const CustomerFormComponent: React.FC<Props> = ({ initialData, onComplete }) => {
  const { width, height } = useResponsiveDimensions();
  const styles = useMemo(
    () => StyleSheet.create(makeCustomerFormStyles({ width, height })),
    [width, height],
  );
  const [email, setEmail] = useState(initialData.email);
  const [fullName, setFullName] = useState(initialData.fullName);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Correo electrónico no válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onComplete({ email, fullName });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos del Cliente</Text>
      <View style={styles.inputContainer}>
        <User size={SIZES.iconBase} color={COLORS.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      </View>
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <View style={styles.inputContainer}>
        <Mail size={SIZES.iconBase} color={COLORS.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continuar al Pago</Text>
      </TouchableOpacity>
    </View>
  );
};

