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
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addItem } from '../../store/slices/cart.slice';
import { Product } from '../../application/state/slices/catalogSlice';
import { RootState } from '../../store';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation.types';
import { StackNavigationProp } from '@react-navigation/stack';
import { ShoppingBasket, Plus, Minus } from 'lucide-react-native';

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
      if (Platform.OS === 'web') {
        window.alert('Este producto no está disponible actualmente.');
      } else {
        Alert.alert('Sin stock', 'Este producto no está disponible actualmente.');
      }
      return;
    }

    const quantityToAdd = Math.min(quantity, product.stock);
    dispatch(addItem({ ...product, productId: product.id, quantity: quantityToAdd }));

    if (Platform.OS === 'web') {
      if (window.confirm(`${quantityToAdd} unidad(es) de ${product.name} se han añadido al carrito. ¿Deseas ir al checkout?`)) {
        navigation.navigate('Checkout');
      }
    } else {
      Alert.alert(
        'Añadido',
        `${quantityToAdd} unidad(es) de ${product.name} se han añadido al carrito`,
        [
          { text: 'Seguir comprando', style: 'cancel' },
          { text: 'Ir al checkout', onPress: () => navigation.navigate('Checkout') },
        ]
      );
    }
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
              <Minus size={20} color={quantity <= 1 ? '#999' : '#f4511e'} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyButton, quantity >= product.stock && styles.disabledQtyButton]}
              onPress={handleIncrease}
              disabled={quantity >= product.stock}
            >
              <Plus size={20} color={quantity >= product.stock ? '#999' : '#f4511e'} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, product.stock <= 0 && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingBasket color="#fff" size={20} />
          <Text style={styles.addButtonText}>Agregar al Carrito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.4,
    backgroundColor: '#eee',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    color: '#f4511e',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stock: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#f4511e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledQtyButton: {
    borderColor: '#ddd',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#f4511e',
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProductDetailScreen;
