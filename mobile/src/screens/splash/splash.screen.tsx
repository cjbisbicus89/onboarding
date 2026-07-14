import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetTransactionState } from '../../store/slices/transaction.slice';
import { clearCart } from '../../store/slices/cart.slice';
import { checkoutClient } from '../../services/api/checkout-client.service';
import { COLORS, useResponsiveDimensions } from '../../infrastructure/theme';
import { makeSplashStyles } from './splash.styles';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SPLASH_DELAY_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 3000;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useResponsiveDimensions();
  const styles = useMemo(() => StyleSheet.create(makeSplashStyles({ width })), [width]);
  const dispatch = useAppDispatch();
  const { currentTransactionId, isUnconfirmed } = useAppSelector((state) => state.transaction);
  const [polling, setPolling] = useState(false);
  const pollCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const navigateToHome = useCallback(() => {
    if (isMountedRef.current) {
      navigation.replace('Home');
    }
  }, [navigation]);

  const pollTransaction = useCallback(async (transactionId: string) => {
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
  }, [dispatch, navigateToHome]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

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
  }, [isUnconfirmed, currentTransactionId, navigation, dispatch, pollTransaction]);

  const subtitle = polling
    ? 'Verificando estado de transacción...'
    : 'Cargando catálogo...';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.logoText}>CB</Text>
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          C.B Store
        </Animated.Text>
        <Text style={styles.tagline}>Tu tienda, tu estilo</Text>
        <ActivityIndicator size="large" color={COLORS.white} style={styles.loader} />
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
