import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addItem } from '../../store/slices/cart.slice';
import { Product } from '../../application/state/slices/catalogSlice';
import { RootState } from '../../store';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { ShoppingBasket, Plus, Minus } from 'lucide-react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES, SHADOWS } from '../../infrastructure/theme';

const { width, height } = Dimensions.get('window');

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface Props {
  route: ProductDetailScreenRouteProp;
  navigation: ProductDetailScreenNavigationProp;
}

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const product = useAppSelector((state: RootState) =>
    state.catalog.products.find((p: Product) => p.id === productId)
  );

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Producto no encontrado</Text>
      </View>
    );
  }

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      Alert.alert('Sin stock', 'Este producto no está disponible actualmente.');
      return;
    }

    const quantityToAdd = Math.min(quantity, product.stock);
    dispatch(addItem({ ...product, productId: product.id, quantity: quantityToAdd }));

    Alert.alert(
      'Añadido',
      `${quantityToAdd} unidad(es) de ${product.name} se han añadido al carrito`,
      [
        { text: 'Seguir comprando', style: 'cancel' },
        { text: 'Ir al checkout', onPress: () => navigation.navigate('Checkout') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          ${(product.priceCentavos / 100).toLocaleString()} {product.currency}
        </Text>
        <Text style={styles.stock}>Stock disponible: {product.stock}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.qtyButton, quantity <= 1 && styles.disabledQtyButton]}
              onPress={handleDecrease}
              disabled={quantity <= 1}
            >
              <Minus size={SIZES.iconBase} color={quantity <= 1 ? COLORS.textMuted : COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyButton, quantity >= product.stock && styles.disabledQtyButton]}
              onPress={handleIncrease}
              disabled={quantity >= product.stock}
            >
              <Plus size={SIZES.iconBase} color={quantity >= product.stock ? COLORS.textMuted : COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, product.stock <= 0 && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingBasket color={COLORS.white} size={SIZES.iconBase} />
          <Text style={styles.addButtonText}>Agregar al Carrito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.4,
    backgroundColor: COLORS.borderLight,
  },
  infoContainer: {
    padding: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  stock: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textDark,
    lineHeight: FONT_SIZES.xl,
    marginBottom: SPACING.lg,
  },
  quantityContainer: {
    marginBottom: SPACING.lg,
  },
  quantityLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledQtyButton: {
    borderColor: COLORS.border,
  },
  quantityValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: SIZES.buttonHeight,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.default,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
});

export default ProductDetailScreen;
