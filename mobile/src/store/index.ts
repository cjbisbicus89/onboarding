import { configureStore } from '@reduxjs/toolkit';
import { type Reducer, type AnyAction } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import EncryptedStorage from 'react-native-encrypted-storage';
import catalogReducer, { type CatalogState } from '../application/state/slices/catalogSlice';
import cartReducer, { type CartState } from './slices/cart.slice';
import customerReducer, { type CustomerState } from '../application/state/slices/customerSlice';
import transactionReducer, { type TransactionState } from './slices/transaction.slice';
import checkoutReducer, { type CheckoutState } from '../application/state/slices/checkoutSlice';

const cartPersistConfig = {
  key: 'cart',
  storage: EncryptedStorage,
};

const transactionPersistConfig = {
  key: 'transaction',
  storage: EncryptedStorage,
};

const customerPersistConfig = {
  key: 'customer',
  storage: EncryptedStorage,
};

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: persistReducer(cartPersistConfig, cartReducer) as Reducer<CartState & PersistedState, AnyAction>,
    customer: persistReducer(customerPersistConfig, customerReducer) as Reducer<CustomerState & PersistedState, AnyAction>,
    transaction: persistReducer(transactionPersistConfig, transactionReducer) as Reducer<TransactionState & PersistedState, AnyAction>,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export interface PersistedState {
  _persist: { version: number; rehydrated: boolean };
}

export type RootState = {
  catalog: CatalogState;
  cart: CartState & PersistedState;
  customer: CustomerState & PersistedState;
  transaction: TransactionState & PersistedState;
  checkout: CheckoutState;
};

export type AppDispatch = typeof store.dispatch;
