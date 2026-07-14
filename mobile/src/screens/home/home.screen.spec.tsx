import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './home.screen';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../application/state/slices/catalogSlice';

jest.mock('../../store/hooks');
jest.mock('../../application/state/slices/catalogSlice', () => ({
  fetchProducts: jest.fn(() => ({ type: 'fetchProducts' })),
}));

describe('HomeScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('renders loading state correctly', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        catalog: { products: [], loading: true, error: null },
        cart: { itemCount: 0 },
      });
    });

    const { toJSON } = render(<HomeScreen navigation={mockNavigation as any} />);
    const hasActivityIndicator = (node: any): boolean =>
      node?.type === 'ActivityIndicator' || (node?.children && node.children.some((child: any) => hasActivityIndicator(child)));
    expect(hasActivityIndicator(toJSON())).toBe(true);
  });

  it('renders error state correctly and retries', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        catalog: { products: [], loading: false, error: 'Load failed' },
        cart: { itemCount: 0 },
      });
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    expect(getByText('Load failed')).toBeTruthy();

    fireEvent.press(getByText('Reintentar'));
    expect(mockDispatch).toHaveBeenCalledWith(fetchProducts());
  });

  it('renders product list correctly', () => {
    const products = [
      { id: '1', name: 'Product 1', priceCentavos: 1000, currency: 'COP', stock: 5, imageUrl: 'img1' },
    ];
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        catalog: { products, loading: false, error: null },
        cart: { itemCount: 2 },
      });
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    expect(getByText('Product 1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // Cart badge
  });

  it('navigates to ProductDetail on product press', () => {
    const products = [
      { id: '1', name: 'Product 1', priceCentavos: 1000, currency: 'COP', stock: 5, imageUrl: 'img1' },
    ];
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        catalog: { products, loading: false, error: null },
        cart: { itemCount: 0 },
      });
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    fireEvent.press(getByText('Product 1'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductDetail', { productId: '1' });
  });

  it('navigates to Checkout on cart button press', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      return selector({
        catalog: { products: [], loading: false, error: null },
        cart: { itemCount: 0 },
      });
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    fireEvent.press(getByText('ShoppingCart'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Checkout');
  });
});
