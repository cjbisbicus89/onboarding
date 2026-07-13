import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeItem, updateItemQuantity, clearCart, CartItem } from '../../store/slices/cart.slice';
import { startCheckout, checkoutSuccess, checkoutFailure } from '../../store/slices/transaction.slice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { Trash2, Plus, Minus, CreditCard, ArrowLeft } from 'lucide-react-native';
import { Backdrop } from '../../components/ui/backdrop.component';
import { CardFormComponent } from './components/card-form.component';
import { CustomerFormComponent } from './components/customer-form.component';
import { PaymentSummaryComponent } from './components/payment-summary.component';
import { setCustomerData } from '../../application/state/slices/customerSlice';
import { checkoutClient } from '../../services/api/checkout-client.service';
import { v4 as uuidv4 } from 'uuid';
import { Toast, useToast } from '../../components/shared/toast.component';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES, SHADOWS } from '../../infrastructure/theme';

const { width, height } = Dimensions.get('window');

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

interface PaymentMethodData {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holderName: string;
}

interface Props {
  navigation: CheckoutScreenNavigationProp;
}

const BACKDROP_TRANSITION_MS = 300;
const ERROR_NAVIGATION_DELAY_MS = 2000;
const QUANTITY_SPACING = 15;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error al procesar pago';
};

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const customer = useAppSelector((state) => state.customer);

  const [showCardBackdrop, setShowCardBackdrop] = useState(false);
  const [showCustomerBackdrop, setShowCustomerBackdrop] = useState(false);
  const [showSummaryBackdrop, setShowSummaryBackdrop] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast, show: showToast } = useToast();

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateItemQuantity({ productId: id, quantity }));
    }
  };

  const handleStartPayment = () => {
    if (cart.items.length === 0) {
      showToast('Agregue productos al carrito para continuar', 'warning');
      return;
    }

    if (!customer.email || !customer.fullName) {
      setShowCustomerBackdrop(true);
    } else {
      setShowCardBackdrop(true);
    }
  };

  const handleCustomerComplete = (data: { email: string; fullName: string }) => {
    dispatch(setCustomerData(data));
    setShowCustomerBackdrop(false);
    setTimeout(() => setShowCardBackdrop(true), BACKDROP_TRANSITION_MS);
  };

  const handleCardComplete = (data: PaymentMethodData) => {
    setPaymentMethod(data);
    setShowCardBackdrop(false);
    setTimeout(() => setShowSummaryBackdrop(true), BACKDROP_TRANSITION_MS);
  };

  const handleConfirmPayment = async () => {
    // Validar integridad de los datos antes de proceder (Unhappy Path: datos incompletos)
    if (!paymentMethod) {
      showToast('Por favor, complete los datos de su tarjeta', 'error');
      return;
    }

    if (!customer.email || !customer.fullName) {
      showToast('Datos del cliente incompletos. Por favor regrese e ingréselos.', 'error');
      return;
    }

    if (cart.items.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    setIsProcessing(true);
    const correlationId = uuidv4();
    const idempotencyKey = uuidv4();
    const transactionId = uuidv4();

    dispatch(startCheckout(transactionId));

    try {
      const response = await checkoutClient.checkout(
        {
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customer: {
            email: customer.email,
            fullName: customer.fullName,
          },
          paymentMethod,
        },
        idempotencyKey,
        correlationId,
      );

      let finalTransactionId = response.transactionId;
      let finalStatus = response.status;
      if (response.status === 'PENDING') {
        const polled = await checkoutClient.pollTransactionStatus(response.transactionId);
        finalTransactionId = polled.transactionId;
        finalStatus = polled.status;
      }

      dispatch(
        checkoutSuccess({
          transactionId: finalTransactionId,
          status: finalStatus,
        })
      );

      if (finalStatus === 'APPROVED') {
        dispatch(clearCart());
        setShowSummaryBackdrop(false);
        navigation.navigate('Result', {
          transactionId: finalTransactionId,
          status: 'APPROVED',
        });
      } else {
        const errorMsg =
          finalStatus === 'DECLINED'
            ? 'Transacción rechazada por el banco emisor'
            : finalStatus === 'PENDING'
            ? 'El pago está siendo procesado, verificaremos su estado al reiniciar la app'
            : 'Error técnico al procesar el pago';
        dispatch(checkoutFailure(errorMsg));
        showToast(errorMsg, 'error');
        setTimeout(() => {
          setShowSummaryBackdrop(false);
          navigation.navigate('Result', {
            transactionId: finalTransactionId,
            status: finalStatus,
          });
        }, ERROR_NAVIGATION_DELAY_MS);
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      dispatch(checkoutFailure(msg));
      showToast(msg, 'error');
      setTimeout(() => {
        setShowSummaryBackdrop(false);
        setIsProcessing(false);
        navigation.navigate('Result', {
          transactionId: transactionId,
          status: 'ERROR',
        });
      }, ERROR_NAVIGATION_DELAY_MS);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          ${(item.priceCentavos / 100).toLocaleString()} {item.currency}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
          style={styles.qtyButton}
        >
          <Minus size={SIZES.iconSmall} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
          style={styles.qtyButton}
        >
          <Plus size={SIZES.iconSmall} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => dispatch(removeItem(item.productId))}
          style={styles.removeButton}
        >
          <Trash2 size={SIZES.iconBase} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={SIZES.iconLarge} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={{ width: SIZES.headerIconSize }} />
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          </View>
        }
      />

      {cart.items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ${(cart.totalAmountCentavos / 100).toLocaleString()} COP
            </Text>
          </View>
          <TouchableOpacity style={styles.payButton} onPress={handleStartPayment}>
            <CreditCard color={COLORS.white} size={SIZES.iconLarge} />
            <Text style={styles.payButtonText}>Pagar con tarjeta de crédito</Text>
          </TouchableOpacity>
        </View>
      )}

      <Backdrop visible={showCardBackdrop} onClose={() => setShowCardBackdrop(false)}>
        <CardFormComponent onComplete={handleCardComplete} />
      </Backdrop>

      <Backdrop visible={showCustomerBackdrop} onClose={() => setShowCustomerBackdrop(false)}>
        <CustomerFormComponent initialData={customer} onComplete={handleCustomerComplete} />
      </Backdrop>

      <Backdrop visible={showSummaryBackdrop} onClose={() => setShowSummaryBackdrop(false)}>
        <PaymentSummaryComponent
          cart={cart}
          customer={customer}
          paymentMethod={paymentMethod}
          onConfirm={handleConfirmPayment}
          loading={isProcessing}
        />
      </Backdrop>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => showToast('', 'info')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLighter,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  quantity: {
    marginHorizontal: QUANTITY_SPACING,
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: QUANTITY_SPACING,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: SIZES.buttonHeightLarge,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: SPACING.huge,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
});

export default CheckoutScreen;
