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
    setTimeout(() => setShowCardBackdrop(true), 300);
  };

  const handleCardComplete = (data: PaymentMethodData) => {
    setPaymentMethod(data);
    setShowCardBackdrop(false);
    setTimeout(() => setShowSummaryBackdrop(true), 300);
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
        }, 2000);
      }
    } catch (error: any) {
      const msg = error.message || 'Error al procesar pago';
      dispatch(checkoutFailure(msg));
      showToast(msg, 'error');
      setTimeout(() => {
        setShowSummaryBackdrop(false);
        setIsProcessing(false);
        navigation.navigate('Result', {
          transactionId: transactionId,
          status: 'ERROR',
        });
      }, 2000);
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
          <Minus size={16} color="#f4511e" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
          style={styles.qtyButton}
        >
          <Plus size={16} color="#f4511e" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => dispatch(removeItem(item.productId))}
          style={styles.removeButton}
        >
          <Trash2 size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
            <CreditCard color="#fff" size={24} />
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#f4511e',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#f4511e',
    borderRadius: 5,
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  payButton: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
});

export default CheckoutScreen;
