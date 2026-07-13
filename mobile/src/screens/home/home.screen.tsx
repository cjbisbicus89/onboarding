import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts, Product } from '../../application/state/slices/catalogSlice';
import { addItem } from '../../store/slices/cart.slice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { ShoppingCart } from 'lucide-react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SIZES, SHADOWS } from '../../infrastructure/theme';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.catalog);
  const cartItemsCount = useAppSelector((state) => state.cart.itemCount);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      onLongPress={() => dispatch(addItem({ ...item, productId: item.id }))}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>
          ${(item.priceCentavos / 100).toLocaleString()} {item.currency}
        </Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchProducts())}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Checkout')}
      >
        <ShoppingCart color={COLORS.white} size={SIZES.iconLarge} />
        {cartItemsCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  listContent: {
    padding: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.light,
    flexDirection: 'row',
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.borderLight,
  },
  productInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  productStock: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    width: SIZES.buttonHeightLarge,
    height: SIZES.buttonHeightLarge,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.strong,
  },
  cartBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    minWidth: SPACING.lg,
    height: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
