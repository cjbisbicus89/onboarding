import React from 'react';
import { Text } from 'react-native';

const createIcon = (name: string) => {
  const Icon: React.FC<{ size?: number; color?: string }> = () => {
    return React.createElement(Text, null, name);
  };
  Icon.displayName = name;
  return Icon;
};

export const ShoppingCart = createIcon('ShoppingCart');
export const Plus = createIcon('Plus');
export const Minus = createIcon('Minus');
export const ShoppingBasket = createIcon('ShoppingBasket');
export const Trash2 = createIcon('Trash2');
export const CreditCard = createIcon('CreditCard');
export const ArrowLeft = createIcon('ArrowLeft');
export const Calendar = createIcon('Calendar');
export const Lock = createIcon('Lock');
export const User = createIcon('User');
export const ShoppingBag = createIcon('ShoppingBag');
export const Mail = createIcon('Mail');
export const CheckCircle2 = createIcon('CheckCircle2');
export const XCircle = createIcon('XCircle');
export const AlertTriangle = createIcon('AlertTriangle');
export const Clock = createIcon('Clock');
export const Home = createIcon('Home');
export const RefreshCw = createIcon('RefreshCw');
