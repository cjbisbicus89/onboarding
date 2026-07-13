import cartReducer, { addItem, removeItem, updateItemQuantity, clearCart, CartItem } from './cart.slice';

const mockItem: Omit<CartItem, 'quantity'> = {
  productId: 'prod-1',
  name: 'Product 1',
  description: 'Description',
  imageUrl: 'https://example.com/img.png',
  priceCentavos: 150000,
  currency: 'COP',
  stock: 10,
};

describe('cart.slice', () => {
  const initialState = {
    items: [] as CartItem[],
    totalAmountCentavos: 0,
    itemCount: 0,
  };

  it('should return initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should add a new item', () => {
    const state = cartReducer(initialState, addItem(mockItem));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.totalAmountCentavos).toBe(150000);
    expect(state.itemCount).toBe(1);
  });

  it('should increment quantity for an existing item', () => {
    let state = cartReducer(initialState, addItem(mockItem));
    state = cartReducer(state, addItem(mockItem));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.totalAmountCentavos).toBe(300000);
    expect(state.itemCount).toBe(2);
  });

  it('should add N items at once when quantity is provided', () => {
    const state = cartReducer(initialState, addItem({ ...mockItem, quantity: 5 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(5);
    expect(state.totalAmountCentavos).toBe(750000);
    expect(state.itemCount).toBe(5);
  });

  it('should not exceed stock when adding items', () => {
    const state = cartReducer(initialState, addItem({ ...mockItem, quantity: 15 }));
    expect(state.items[0].quantity).toBe(10);
  });

  it('should not exceed stock when adding to existing item', () => {
    let state = cartReducer(initialState, addItem({ ...mockItem, quantity: 8 }));
    state = cartReducer(state, addItem({ ...mockItem, quantity: 5 }));
    expect(state.items[0].quantity).toBe(10);
  });

  it('should remove an item', () => {
    let state = cartReducer(initialState, addItem(mockItem));
    state = cartReducer(state, removeItem(mockItem.productId));
    expect(state.items).toHaveLength(0);
    expect(state.totalAmountCentavos).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  it('should update item quantity', () => {
    let state = cartReducer(initialState, addItem(mockItem));
    state = cartReducer(state, updateItemQuantity({ productId: mockItem.productId, quantity: 3 }));
    expect(state.items[0].quantity).toBe(3);
    expect(state.totalAmountCentavos).toBe(450000);
    expect(state.itemCount).toBe(3);
  });

  it('should remove item when quantity is set to 0', () => {
    let state = cartReducer(initialState, addItem(mockItem));
    state = cartReducer(state, updateItemQuantity({ productId: mockItem.productId, quantity: 0 }));
    expect(state.items).toHaveLength(0);
  });

  it('should clear the cart', () => {
    let state = cartReducer(initialState, addItem(mockItem));
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
    expect(state.totalAmountCentavos).toBe(0);
    expect(state.itemCount).toBe(0);
  });
});
