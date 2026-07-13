import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCentavos: number;
  currency: string;
  stock: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmountCentavos: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  totalAmountCentavos: 0,
  itemCount: 0,
};

function recalculateTotals(state: CartState): void {
  state.totalAmountCentavos = state.items.reduce(
    (sum, item) => sum + item.priceCentavos * item.quantity,
    0,
  );
  state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>,
    ) => {
      const { quantity: requestedQuantity = 1, ...itemPayload } = action.payload;
      const quantityToAdd = Math.max(1, requestedQuantity);
      const existingItem = state.items.find((item) => item.productId === itemPayload.productId);

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantityToAdd, existingItem.stock);
        existingItem.quantity = newQuantity;
      } else {
        const quantity = Math.min(quantityToAdd, itemPayload.stock);
        state.items.push({ ...itemPayload, quantity });
      }
      recalculateTotals(state);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      recalculateTotals(state);
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      recalculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmountCentavos = 0;
      state.itemCount = 0;
    },
  },
});

export const { addItem, removeItem, updateItemQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
