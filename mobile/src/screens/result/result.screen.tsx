import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { resetTransactionState } from '../../store/slices/transaction.slice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { RouteProp, useNavigation } from '@react-navigation/native';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Home,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, SIZES } from '../../infrastructure/theme';

const { width } = Dimensions.get('window');

const ICON_MARGIN_BOTTOM = SPACING.xxl;
const TITLE_MARGIN_BOTTOM = SPACING.md;
const SUBTITLE_MARGIN_BOTTOM = SPACING.xxl;
const TRANSACTION_ID_MARGIN_BOTTOM = SPACING.xxxl;
const BUTTON_ICON_MARGIN_RIGHT = SPACING.sm;

const RESULT_STATUS = {
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  ERROR: 'ERROR',
  PENDING: 'PENDING',
} as const;

type ResultStatus = keyof typeof RESULT_STATUS;

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  route: ResultScreenRouteProp;
}

interface ResultConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  primaryColor: string;
}

const getResultConfig = (status: ResultStatus): ResultConfig => {
  switch (status) {
    case RESULT_STATUS.APPROVED:
      return {
        icon: <CheckCircle2 color={COLORS.success} size={SIZES.iconXLarge} style={styles.icon} />,
        title: '¡Pago Exitoso!',
        subtitle: 'Tu pedido ha sido procesado correctamente.',
        primaryColor: COLORS.success,
      };
    case RESULT_STATUS.DECLINED:
      return {
        icon: <XCircle color={COLORS.error} size={SIZES.iconXLarge} style={styles.icon} />,
        title: 'Pago Rechazado',
        subtitle: 'La transacción fue rechazada por el banco emisor.',
        primaryColor: COLORS.error,
      };
    case RESULT_STATUS.PENDING:
      return {
        icon: <Clock color={COLORS.info} size={SIZES.iconXLarge} style={styles.icon} />,
        title: 'Pago en Proceso',
        subtitle: 'Estamos verificando el estado de tu transacción.',
        primaryColor: COLORS.info,
      };
    case RESULT_STATUS.ERROR:
    default:
      return {
        icon: <AlertTriangle color={COLORS.warning} size={SIZES.iconXLarge} style={styles.icon} />,
        title: 'Error en el Pago',
        subtitle: 'Ocurrió un problema técnico. Intenta nuevamente.',
        primaryColor: COLORS.warning,
      };
  }
};

const ResultScreen: React.FC<Props> = ({ route }) => {
  const { transactionId, status } = route.params;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const config = getResultConfig(status);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (event.data.action.type === 'GO_BACK') {
        event.preventDefault();
        dispatch(resetTransactionState());
        navigation.replace('Home');
      }
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  const handleBackToHome = () => {
    dispatch(resetTransactionState());
    navigation.replace('Home');
  };

  const handleRetry = () => {
    dispatch(resetTransactionState());
    navigation.replace('Checkout');
  };

  const canRetry = status === RESULT_STATUS.DECLINED || status === RESULT_STATUS.ERROR;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {config.icon}
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
        <Text style={styles.transactionId}>ID: {transactionId}</Text>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}
          activeOpacity={0.8}
        >
          <Home color={COLORS.white} size={SIZES.iconLarge} style={styles.buttonIcon} />
          <Text style={styles.homeButtonText}>Volver al Home</Text>
        </TouchableOpacity>

        {canRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: config.primaryColor }]}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <RefreshCw color={config.primaryColor} size={SIZES.iconBase} style={styles.buttonIcon} />
            <Text style={[styles.retryButtonText, { color: config.primaryColor }]}>
              Intentar nuevamente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
  },
  icon: {
    marginBottom: ICON_MARGIN_BOTTOM,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: TITLE_MARGIN_BOTTOM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SUBTITLE_MARGIN_BOTTOM,
    paddingHorizontal: SPACING.lg,
  },
  transactionId: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: TRANSACTION_ID_MARGIN_BOTTOM,
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: SIZES.buttonHeight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.default,
  },
  retryButton: {
    flexDirection: 'row',
    height: SIZES.buttonHeight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 2,
  },
  buttonIcon: {
    marginRight: BUTTON_ICON_MARGIN_RIGHT,
  },
  homeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  retryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
