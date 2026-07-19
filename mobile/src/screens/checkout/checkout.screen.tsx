import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeItem, updateItemQuantity, CartItem } from '../../store/slices/cart.slice';
import { processCheckout } from '../../store/slices/transaction.slice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { Trash2, Plus, Minus, CreditCard, ArrowLeft } from 'lucide-react-native';
import { Backdrop } from '../../components/ui/backdrop.component';
import { CardFormComponent } from './components/card-form.component';
import { CustomerFormComponent } from './components/customer-form.component';
import { PaymentSummaryComponent } from './components/payment-summary.component';
import { setCustomerData } from '../../application/state/slices/customerSlice';
import { v4 as uuidv4 } from 'uuid';
import { Toast, useToast } from '../../components/shared/toast.component';
import { COLORS, useResponsiveDimensions } from '../../infrastructure/theme';
import { makeCheckoutStyles } from './checkout.styles';

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
  const { width, height } = useResponsiveDimensions();
  const styles = useMemo(
    () => StyleSheet.create(makeCheckoutStyles({ width, height })),
    [width, height],
  );

  const iconSmall = width * 0.04;
  const iconBase = width * 0.05;
  const iconLarge = width * 0.06;

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
    const transactionId = uuidv4();

    try {
      const result = await dispatch(
        processCheckout({
          localTransactionId: transactionId,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customer: {
            email: customer.email,
            fullName: customer.fullName,
          },
          paymentMethod,
        })
      ).unwrap();

      if (result.status === 'APPROVED') {
        setShowSummaryBackdrop(false);
        navigation.navigate('Result', {
          transactionId: result.transactionId,
          status: 'APPROVED',
          message: result.message,
        });
      } else {
        const statusMsg =
          result.message ||
          (result.status === 'DECLINED'
            ? 'Transacción rechazada por el banco emisor'
            : result.status === 'PENDING'
            ? 'El pago está siendo procesado, verificaremos su estado al reiniciar la app'
            : 'Error técnico al procesar el pago');
        const toastType = result.status === 'PENDING' ? 'warning' : 'error';
        showToast(statusMsg, toastType);
        setTimeout(() => {
          setShowSummaryBackdrop(false);
          navigation.navigate('Result', {
            transactionId: result.transactionId,
            status: result.status,
            message: statusMsg,
          });
        }, ERROR_NAVIGATION_DELAY_MS);
      }
    } catch (error) {
      const rejected = error as { transactionId?: string; message?: string } | undefined;
      const finalTransactionId = rejected?.transactionId ?? transactionId;
      const msg = rejected?.message ?? getErrorMessage(error);
      showToast(msg, 'error');
      setTimeout(() => {
        setShowSummaryBackdrop(false);
        setIsProcessing(false);
        navigation.navigate('Result', {
          transactionId: finalTransactionId,
          status: 'ERROR',
          message: msg,
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
        <Pressable
          onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
          style={({ pressed }) => [styles.qtyButton, pressed && styles.pressedButton]}
        >
          <Minus size={iconSmall} color={COLORS.primary} />
        </Pressable>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Pressable
          onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
          style={({ pressed }) => [styles.qtyButton, pressed && styles.pressedButton]}
        >
          <Plus size={iconSmall} color={COLORS.primary} />
        </Pressable>
        <Pressable
          onPress={() => dispatch(removeItem(item.productId))}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressedButton]}
        >
          <Trash2 size={iconBase} color={COLORS.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [pressed && styles.pressedButton]}>
          <ArrowLeft size={iconLarge} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={styles.headerRightSpacer} />
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
          <Pressable style={({ pressed }) => [styles.payButton, pressed && styles.pressedButton]} onPress={handleStartPayment}>
            <CreditCard color={COLORS.white} size={iconLarge} />
            <Text style={styles.payButtonText}>Pagar con tarjeta de crédito</Text>
          </Pressable>
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

export default CheckoutScreen;
