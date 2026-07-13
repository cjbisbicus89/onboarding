import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetTransactionState } from '../../store/slices/transaction.slice';
import { clearCart } from '../../store/slices/cart.slice';
import { checkoutClient } from '../../services/api/checkout-client.service';
import { COLORS, FONT_SIZES, SPACING } from '../../infrastructure/theme';

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    pollCount.current = 0;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isUnconfirmed && currentTransactionId) {
      setPolling(true);
      pollTransaction(currentTransactionId);
      return;
    }

    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        navigation.replace('Home');
      }
    }, SPLASH_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isUnconfirmed, currentTransactionId, navigation, dispatch]);

  const navigateToHome = () => {
    if (isMountedRef.current) {
      navigation.replace('Home');
    }
  };

  const pollTransaction = async (transactionId: string) => {
    try {
      const data = await checkoutClient.getTransaction(transactionId);

      if (!isMountedRef.current) {
        return;
      }

      if (data.status === 'PENDING' && pollCount.current < MAX_POLL_ATTEMPTS) {
        pollCount.current += 1;
        timerRef.current = setTimeout(() => pollTransaction(transactionId), POLL_INTERVAL_MS);
      } else if (data.status === 'APPROVED') {
        dispatch(clearCart());
        dispatch(resetTransactionState());
        navigateToHome();
      } else if (data.status === 'DECLINED' || data.status === 'ERROR') {
        dispatch(resetTransactionState());
        navigateToHome();
      } else {
        // Timeout de polling: asumir timeout y restaurar carrito
        dispatch(resetTransactionState());
        navigateToHome();
      }
    } catch (error) {
      if (isMountedRef.current) {
        dispatch(resetTransactionState());
        navigateToHome();
      }
    }
  };

  if (polling) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.title}>Verificando estado de transacción...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout App</Text>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.subtitle}>Cargando catálogo...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.titleLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    marginTop: SPACING.lg,
  },
});

export default SplashScreen;
