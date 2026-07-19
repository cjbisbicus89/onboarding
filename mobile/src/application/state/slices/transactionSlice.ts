import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { checkoutClient } from '../../../services/api/checkout-client.service';
import { clearCart } from './cartSlice';

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface ProcessCheckoutPayload {
  localTransactionId: string;
  items: CheckoutItem[];
  customer: { email: string; fullName: string };
  paymentMethod: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    holderName: string;
  };
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPriceCentavos: number;
}

export interface Transaction {
  transactionId: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  totalAmountCentavos: number;
  currency: string;
  assignedTo: string;
  providerReference: string | null;
  createdAt: string;
  items: TransactionItem[];
}

export interface TransactionState {
  currentTransactionId: string | null;
  loading: boolean;
  status: 'IDLE' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  apiError: string | null;
  isUnconfirmed: boolean;
}

const initialState: TransactionState = {
  currentTransactionId: null,
  loading: false,
  status: 'IDLE',
  apiError: null,
  isUnconfirmed: false,
};

export const processCheckout = createAsyncThunk<
  { transactionId: string; status: Exclude<TransactionState['status'], 'IDLE'>; message?: string },
  ProcessCheckoutPayload
>('transaction/processCheckout', async (payload, { dispatch, rejectWithValue }) => {
  const { localTransactionId, items, customer, paymentMethod } = payload;
  const correlationId = uuidv4();
  const idempotencyKey = uuidv4();

  dispatch(startCheckout(localTransactionId));

  try {
    const response = await checkoutClient.checkout(
      { items, customer, paymentMethod },
      idempotencyKey,
      correlationId,
    );

    const finalTransactionId = response.transactionId;
    const finalStatus = response.status;
    const finalMessage = response.errorReason;

    dispatch(checkoutSuccess({ transactionId: finalTransactionId, status: finalStatus }));

    if (finalStatus === 'APPROVED') {
      dispatch(clearCart());
    }

    return { transactionId: finalTransactionId, status: finalStatus, message: finalMessage };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar pago';
    dispatch(checkoutFailure(message));
    return rejectWithValue({ transactionId: localTransactionId, message });
  }
});

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    startCheckout: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.status = 'PENDING';
      state.isUnconfirmed = true;
      state.currentTransactionId = action.payload;
      state.apiError = null;
    },
    checkoutSuccess: (
      state,
      action: PayloadAction<{ transactionId: string; status: TransactionState['status'] }>,
    ) => {
      state.loading = false;
      state.isUnconfirmed = action.payload.status === 'PENDING';
      state.status = action.payload.status;
      state.currentTransactionId = action.payload.transactionId;
      state.apiError = null;
    },
    checkoutFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isUnconfirmed = false;
      state.status = 'ERROR';
      state.apiError = action.payload;
    },
    resetTransactionState: (state) => {
      state.currentTransactionId = null;
      state.loading = false;
      state.status = 'IDLE';
      state.apiError = null;
      state.isUnconfirmed = false;
    },
  },
});

export const {
  startCheckout,
  checkoutSuccess,
  checkoutFailure,
  resetTransactionState,
} = transactionSlice.actions;

export default transactionSlice.reducer;
