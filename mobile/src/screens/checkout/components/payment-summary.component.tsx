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
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES } from '../../../infrastructure/theme';

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

const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(5),
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: responsiveWidth(5),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  itemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDark,
    marginBottom: SPACING.xs / 2,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    height: responsiveHeight(7),
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  disabledButton: {
    backgroundColor: COLORS.successLight,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});
