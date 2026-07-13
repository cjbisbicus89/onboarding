import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
