import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holderName: string;
}

const initialState: PaymentState = {
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvc: '',
  holderName: '',
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentData: (state, action: PayloadAction<PaymentState>) => {
      Object.assign(state, action.payload);
    },
    clearPaymentData: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setPaymentData, clearPaymentData } = paymentSlice.actions;
export default paymentSlice.reducer;
