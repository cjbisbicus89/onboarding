import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum CheckoutStep {
  CATALOG = 0,
  DETAIL = 1,
  CART = 2,
  CUSTOMER = 3,
  PAYMENT = 4,
  SUMMARY = 5,
  CONFIRMATION = 6,
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  transactionId: string | null;
  status: 'IDLE' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  error: string | null;
}

const initialState: CheckoutState = {
  currentStep: CheckoutStep.CATALOG,
  transactionId: null,
  status: 'IDLE',
  error: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < CheckoutStep.CONFIRMATION) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > CheckoutStep.CATALOG) {
        state.currentStep -= 1;
      }
    },
    setStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.currentStep = action.payload;
    },
    setTransactionInfo: (state, action: PayloadAction<{ id: string; status: CheckoutState['status'] }>) => {
      state.transactionId = action.payload.id;
      state.status = action.payload.status;
    },
    resetCheckout: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { nextStep, previousStep, setStep, setTransactionInfo, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
