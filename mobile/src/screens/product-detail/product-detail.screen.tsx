import React from 'react';
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
import { ShoppingBasket } from 'lucide-react-native';

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

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Este producto no está disponible actualmente.');
      } else {
        Alert.alert('Sin stock', 'Este producto no está disponible actualmente.');
      }
      return;
    }

    dispatch(addItem({ ...product, productId: product.id }));

    if (Platform.OS === 'web') {
      if (window.confirm(`${product.name} se ha añadido al carrito. ¿Deseas ir al checkout?`)) {
        navigation.navigate('Checkout');
      }
    } else {
      Alert.alert(
        'Añadido',
        `${product.name} se ha añadido al carrito`,
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
    marginBottom: 30,
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
