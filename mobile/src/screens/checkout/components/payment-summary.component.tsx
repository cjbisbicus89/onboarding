import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ShoppingBag, User, CreditCard, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SIZES, useResponsiveDimensions } from '../../../infrastructure/theme';
import { makePaymentSummaryStyles } from './payment-summary.component.styles';

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
  const { width, height } = useResponsiveDimensions();
  const styles = useMemo(
    () => StyleSheet.create(makePaymentSummaryStyles({ width, height })),
    [width, height],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Pago</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ShoppingBag size={SIZES.iconBase} color={COLORS.primary} />
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
          <User size={SIZES.iconBase} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Cliente</Text>
        </View>
        <Text style={styles.infoText}>{customer.fullName}</Text>
        <Text style={styles.infoText}>{customer.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CreditCard size={SIZES.iconBase} color={COLORS.primary} />
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

      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          Al confirmar el pago, aceptas los{' '}
          <Text style={styles.legalLink}>Términos y Condiciones</Text> y el{' '}
          <Text style={styles.legalLink}>Aviso de Privacidad</Text> de la pasarela de pagos.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.disabledButton]}
        onPress={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <CheckCircle2 color={COLORS.white} size={SIZES.iconLarge} style={styles.buttonIcon} />
            <Text style={styles.confirmText}>Confirmar Pago</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

