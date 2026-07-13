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

const { width } = Dimensions.get('window');

const ICON_SIZE = 100;
const HOME_BUTTON_HEIGHT = 56;
const HOME_BUTTON_RADIUS = 28;
const TRANSACTION_ID_FONT_SIZE = 14;
const TITLE_FONT_SIZE = 28;
const SUBTITLE_FONT_SIZE = 16;
const BUTTON_TEXT_FONT_SIZE = 18;

const ICON_MARGIN_BOTTOM = 30;
const TITLE_MARGIN_BOTTOM = 15;
const SUBTITLE_MARGIN_BOTTOM = 30;
const TRANSACTION_ID_MARGIN_BOTTOM = 40;
const BUTTON_ICON_MARGIN_RIGHT = 10;

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
  navigation: StackNavigationProp<RootStackParamList, 'Result'>;
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
        icon: <CheckCircle2 color="#4CAF50" size={ICON_SIZE} style={styles.icon} />,
        title: '¡Pago Exitoso!',
        subtitle: 'Tu pedido ha sido procesado correctamente.',
        primaryColor: '#4CAF50',
      };
    case RESULT_STATUS.DECLINED:
      return {
        icon: <XCircle color="#f4511e" size={ICON_SIZE} style={styles.icon} />,
        title: 'Pago Rechazado',
        subtitle: 'La transacción fue rechazada por el banco emisor.',
        primaryColor: '#f4511e',
      };
    case RESULT_STATUS.PENDING:
      return {
        icon: <Clock color="#2196F3" size={ICON_SIZE} style={styles.icon} />,
        title: 'Pago en Proceso',
        subtitle: 'Estamos verificando el estado de tu transacción.',
        primaryColor: '#2196F3',
      };
    case RESULT_STATUS.ERROR:
    default:
      return {
        icon: <AlertTriangle color="#FFC107" size={ICON_SIZE} style={styles.icon} />,
        title: 'Error en el Pago',
        subtitle: 'Ocurrió un problema técnico. Intenta nuevamente.',
        primaryColor: '#FFC107',
      };
  }
};

const ResultScreen: React.FC<Props> = ({ route }) => {
  const { transactionId, status } = route.params;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const config = getResultConfig(status as ResultStatus);

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
          <Home color="#fff" size={24} style={styles.buttonIcon} />
          <Text style={styles.homeButtonText}>Volver al Home</Text>
        </TouchableOpacity>

        {canRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: config.primaryColor }]}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <RefreshCw color={config.primaryColor} size={20} style={styles.buttonIcon} />
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
    backgroundColor: '#fff',
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
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: TITLE_MARGIN_BOTTOM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SUBTITLE_FONT_SIZE,
    color: '#666',
    textAlign: 'center',
    marginBottom: SUBTITLE_MARGIN_BOTTOM,
    paddingHorizontal: 20,
  },
  transactionId: {
    fontSize: TRANSACTION_ID_FONT_SIZE,
    color: '#999',
    marginBottom: TRANSACTION_ID_MARGIN_BOTTOM,
  },
  homeButton: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    height: HOME_BUTTON_HEIGHT,
    borderRadius: HOME_BUTTON_RADIUS,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButton: {
    flexDirection: 'row',
    height: HOME_BUTTON_HEIGHT,
    borderRadius: HOME_BUTTON_RADIUS,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
  },
  buttonIcon: {
    marginRight: BUTTON_ICON_MARGIN_RIGHT,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: BUTTON_TEXT_FONT_SIZE,
    fontWeight: 'bold',
  },
  retryButtonText: {
    fontSize: BUTTON_TEXT_FONT_SIZE,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
