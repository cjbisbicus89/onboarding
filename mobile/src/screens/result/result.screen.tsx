import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { resetTransactionState } from '../../store/slices/transaction.slice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { RouteProp } from '@react-navigation/native';
import { CheckCircle2, XCircle, AlertTriangle, Home } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;

interface Props {
  route: ResultScreenRouteProp;
  navigation: ResultScreenNavigationProp;
}

const ResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { transactionId, status } = route.params;
  const dispatch = useAppDispatch();

  const handleBackToHome = () => {
    dispatch(resetTransactionState());
    navigation.replace('Home');
  };

  const renderContent = () => {
    switch (status) {
      case 'APPROVED':
        return (
          <>
            <CheckCircle2 color="#4CAF50" size={100} style={styles.icon} />
            <Text style={styles.title}>¡Pago Exitoso!</Text>
            <Text style={styles.subtitle}>Tu pedido ha sido procesado correctamente.</Text>
          </>
        );
      case 'DECLINED':
        return (
          <>
            <XCircle color="#f4511e" size={100} style={styles.icon} />
            <Text style={styles.title}>Pago Rechazado</Text>
            <Text style={styles.subtitle}>La transacción fue rechazada por el banco emisor.</Text>
          </>
        );
      case 'ERROR':
      default:
        return (
          <>
            <AlertTriangle color="#FFC107" size={100} style={styles.icon} />
            <Text style={styles.title}>Error en el Pago</Text>
            <Text style={styles.subtitle}>Ocurrió un problema técnico. Intenta nuevamente.</Text>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <Text style={styles.transactionId}>ID: {transactionId}</Text>
      <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
        <Home color="#fff" size={24} style={styles.buttonIcon} />
        <Text style={styles.homeButtonText}>Volver al Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
    backgroundColor: '#fff',
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  transactionId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  homeButton: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
