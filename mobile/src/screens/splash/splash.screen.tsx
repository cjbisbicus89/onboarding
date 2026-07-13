import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetTransactionState } from '../../store/slices/transaction.slice';
import { clearCart } from '../../store/slices/cart.slice';
import { checkoutClient } from '../../services/api/checkout-client.service';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SPLASH_DELAY_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 3000;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { currentTransactionId, isUnconfirmed } = useAppSelector((state) => state.transaction);
  const [polling, setPolling] = useState(false);
  const pollCount = useRef(0);

  useEffect(() => {
    if (isUnconfirmed && currentTransactionId) {
      setPolling(true);
      pollTransaction(currentTransactionId);
      return;
    }

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, SPLASH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isUnconfirmed, currentTransactionId, navigation, dispatch]);

  const pollTransaction = async (transactionId: string) => {
    try {
      const data = await checkoutClient.getTransaction(transactionId);

      if (data.status === 'PENDING' && pollCount.current < MAX_POLL_ATTEMPTS) {
        pollCount.current += 1;
        setTimeout(() => pollTransaction(transactionId), POLL_INTERVAL_MS);
      } else if (data.status === 'APPROVED') {
        dispatch(clearCart());
        dispatch(resetTransactionState());
        navigation.replace('Home');
      } else if (data.status === 'DECLINED' || data.status === 'ERROR') {
        dispatch(resetTransactionState());
        navigation.replace('Home');
      } else {
        // Timeout de polling: asumir timeout y restaurar carrito
        dispatch(resetTransactionState());
        navigation.replace('Home');
      }
    } catch (error) {
      dispatch(resetTransactionState());
      navigation.replace('Home');
    }
  };

  if (polling) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.title}>Verificando estado de transacción...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout App</Text>
      <ActivityIndicator size="large" color="#f4511e" />
      <Text style={styles.subtitle}>Cargando catálogo...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 20,
  },
});

export default SplashScreen;
