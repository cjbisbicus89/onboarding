import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { User, Mail } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (p: number) => (width * p) / 100;
const responsiveHeight = (p: number) => (height * p) / 100;

interface Props {
  initialData: {
    email: string;
    fullName: string;
  };
  onComplete: (data: { email: string; fullName: string }) => void;
}

export const CustomerFormComponent: React.FC<Props> = ({ initialData, onComplete }) => {
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
        <User size={20} color="#666" style={styles.icon} />
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
        <Mail size={20} color="#666" style={styles.icon} />
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
