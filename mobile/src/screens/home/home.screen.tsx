import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts, Product } from '../../application/state/slices/catalogSlice';
import { addItem } from '../../store/slices/cart.slice';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation.types';
import { ShoppingCart } from 'lucide-react-native';
import { COLORS, SIZES } from '../../infrastructure/theme';
import { homeStyles } from './home.styles';

const styles = StyleSheet.create(homeStyles);

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

export default HomeScreen;
