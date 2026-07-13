import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart, CartItem } from './cartSlice';
import { Product } from './catalogSlice';

describe('cartSlice', () => {
  const initialState = {
    items: [],
    totalAmount: 0,
  };

  const mockProduct: Product = {
    id: '1',
    name: 'Product 1',
    description: 'Desc 1',
    imageUrl: 'img1',
    priceCentavos: 100,
    currency: 'USD',
    stock: 10,
  };

  it('should handle initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addToCart (new item)', () => {
    const state = cartReducer(initialState, addToCart(mockProduct));
    expect(state.items.length).toBe(1);
    expect(state.items[0]).toEqual({ ...mockProduct, quantity: 1 });
    expect(state.totalAmount).toBe(100);
  });

  it('should handle addToCart (existing item)', () => {
    let state = cartReducer(initialState, addToCart(mockProduct));
    state = cartReducer(state, addToCart(mockProduct));
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.totalAmount).toBe(200);
  });

  it('should handle removeFromCart', () => {
    let state = cartReducer(initialState, addToCart(mockProduct));
    state = cartReducer(state, removeFromCart('1'));
    expect(state.items.length).toBe(0);
    expect(state.totalAmount).toBe(0);
  });

  it('should handle updateQuantity', () => {
    let state = cartReducer(initialState, addToCart(mockProduct));
    state = cartReducer(state, updateQuantity({ id: '1', quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalAmount).toBe(500);
  });

  it('should handle clearCart', () => {
    let state = cartReducer(initialState, addToCart(mockProduct));
    state = cartReducer(state, clearCart());
    expect(state.items.length).toBe(0);
    expect(state.totalAmount).toBe(0);
  });
});
