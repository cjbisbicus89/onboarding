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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import catalogReducer, { type CatalogState } from '../application/state/slices/catalogSlice';
import cartReducer, { type CartState } from './slices/cart.slice';
import customerReducer, { type CustomerState } from '../application/state/slices/customerSlice';
import transactionReducer, { type TransactionState } from './slices/transaction.slice';
import checkoutReducer, { type CheckoutState } from '../application/state/slices/checkoutSlice';

const SECRET_KEY = process.env.EXPO_PUBLIC_REDUX_SECRET_KEY;

const MIN_SECRET_KEY_LENGTH = 8;

if (!SECRET_KEY || SECRET_KEY.length < MIN_SECRET_KEY_LENGTH) {
  throw new Error(
    'EXPO_PUBLIC_REDUX_SECRET_KEY no está definida o es muy corta. Revisa tu archivo .env',
  );
}

const createEncryptTransform = (label: string) =>
  encryptTransform({
    secretKey: SECRET_KEY,
    onError: (error) => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error(`Error al desencriptar ${label}:`, error);
      }
    },
  });

const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
  transforms: [createEncryptTransform('el carrito')],
};

const transactionPersistConfig = {
  key: 'transaction',
  storage: AsyncStorage,
  transforms: [createEncryptTransform('la transacción')],
};

const customerPersistConfig = {
  key: 'customer',
  storage: AsyncStorage,
  transforms: [createEncryptTransform('los datos del cliente')],
};

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: persistReducer(cartPersistConfig, cartReducer) as Reducer<any, AnyAction>,
    customer: persistReducer(customerPersistConfig, customerReducer) as Reducer<any, AnyAction>,
    transaction: persistReducer(transactionPersistConfig, transactionReducer) as Reducer<any, AnyAction>,
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
  customer: CustomerState;
  transaction: TransactionState & PersistedState;
  checkout: CheckoutState;
};

export type AppDispatch = typeof store.dispatch;
