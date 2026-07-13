import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation.types';
import SplashScreen from '../screens/splash/splash.screen';
import HomeScreen from '../screens/home/home.screen';
import ProductDetailScreen from '../screens/product-detail/product-detail.screen';
import CheckoutScreen from '../screens/checkout/checkout.screen';
import ResultScreen from '../screens/result/result.screen';
import { COLORS } from '../infrastructure/theme';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Catálogo de Productos' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Detalle del Producto' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
