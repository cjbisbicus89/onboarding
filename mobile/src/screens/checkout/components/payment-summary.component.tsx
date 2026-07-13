import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { ShoppingBag, User, CreditCard, CheckCircle2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const responsiveWidth = (p: number) => (width * p) / 100;
const responsiveHeight = (p: number) => (height * p) / 100;

interface Props {
  cart: {
    items: Array<{ productId: string; name: string; priceCentavos: number; quantity: number }>;
    totalAmountCentavos: number;
  };
  customer: {
    email: string;
    fullName: string;
  };
  paymentMethod: {
    cardNumber: string;
    holderName: string;
  } | null;
  onConfirm: () => void;
  loading?: boolean;
}

export const PaymentSummaryComponent: React.FC<Props> = ({
  cart,
  customer,
  paymentMethod,
  onConfirm,
  loading,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Pago</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ShoppingBag size={20} color="#f4511e" />
          <Text style={styles.sectionTitle}>Productos</Text>
        </View>
        {cart.items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.name} x {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              ${((item.priceCentavos * item.quantity) / 100).toLocaleString()}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${(cart.totalAmountCentavos / 100).toLocaleString()} COP
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color="#f4511e" />
          <Text style={styles.sectionTitle}>Cliente</Text>
        </View>
        <Text style={styles.infoText}>{customer.fullName}</Text>
        <Text style={styles.infoText}>{customer.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CreditCard size={20} color="#f4511e" />
          <Text style={styles.sectionTitle}>Pago</Text>
        </View>
        {paymentMethod ? (
          <>
            <Text style={styles.infoText}>
              Tarjeta terminada en {paymentMethod.cardNumber.slice(-4)}
            </Text>
            <Text style={styles.infoText}>{paymentMethod.holderName}</Text>
          </>
        ) : (
          <Text style={styles.infoText}>Método de pago no seleccionado</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.disabledButton]}
        onPress={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <CheckCircle2 color="#fff" size={24} style={styles.buttonIcon} />
            <Text style={styles.confirmText}>Confirmar Pago</Text>
          </>
        )}
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
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    height: responsiveHeight(7),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  buttonIcon: {
    marginRight: 10,
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
