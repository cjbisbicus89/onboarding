import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from './slices/catalogSlice';
import cartReducer from './slices/cartSlice';
import customerReducer from './slices/customerSlice';
import checkoutReducer from './slices/checkoutSlice';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: cartReducer,
    customer: customerReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
