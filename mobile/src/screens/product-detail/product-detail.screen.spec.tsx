import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProductDetailScreen from './product-detail.screen';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addItem } from '../../store/slices/cart.slice';

jest.mock('../../store/hooks');
jest.mock('../../store/slices/cart.slice', () => ({
  addItem: jest.fn((item) => ({ type: 'addItem', payload: item })),
}));

describe('ProductDetailScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    navigate: jest.fn(),
  };
  const mockRoute = {
    params: { productId: '1' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('renders correctly when product is found', () => {
    const product = { id: '1', name: 'Product 1', priceCentavos: 1000, currency: 'COP', stock: 5, description: 'Desc', imageUrl: 'img1' };
    (useAppSelector as jest.Mock).mockReturnValue(product);

    const { getByText } = render(<ProductDetailScreen route={mockRoute as any} navigation={mockNavigation as any} />);
    expect(getByText('Product 1')).toBeTruthy();
    expect(getByText('Stock disponible: 5')).toBeTruthy();
  });

  it('shows not found message when product is missing', () => {
    (useAppSelector as jest.Mock).mockReturnValue(undefined);

    const { getByText } = render(<ProductDetailScreen route={mockRoute as any} navigation={mockNavigation as any} />);
    expect(getByText('Producto no encontrado')).toBeTruthy();
  });

  it('increases and decreases quantity correctly', () => {
    const product = { id: '1', name: 'Product 1', priceCentavos: 1000, currency: 'COP', stock: 2, description: 'Desc', imageUrl: 'img1' };
    (useAppSelector as jest.Mock).mockReturnValue(product);

    const { getByText } = render(<ProductDetailScreen route={mockRoute as any} navigation={mockNavigation as any} />);

    const minusButton = getByText('Minus');
    const plusButton = getByText('Plus');

    expect(getByText('1')).toBeTruthy();

    fireEvent.press(plusButton);
    expect(getByText('2')).toBeTruthy();

    // Try to increase beyond stock
    fireEvent.press(plusButton);
    expect(getByText('2')).toBeTruthy();

    fireEvent.press(minusButton);
    expect(getByText('1')).toBeTruthy();
  });

  it('adds item to cart and shows alert', () => {
    const product = { id: '1', name: 'Product 1', priceCentavos: 1000, currency: 'COP', stock: 5, description: 'Desc', imageUrl: 'img1' };
    (useAppSelector as jest.Mock).mockReturnValue(product);
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText } = render(<ProductDetailScreen route={mockRoute as any} navigation={mockNavigation as any} />);
    fireEvent.press(getByText('Agregar al Carrito'));

    expect(mockDispatch).toHaveBeenCalledWith(addItem({ ...product, productId: '1', quantity: 1 }));
    expect(alertSpy).toHaveBeenCalledWith('Añadido', expect.any(String), expect.any(Array));

    const buttons = alertSpy.mock.calls[0][2] as any[];
    buttons[1].onPress();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Checkout');
  });
});
