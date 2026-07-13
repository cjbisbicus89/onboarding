import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CustomerState {
  email: string;
  fullName: string;
}

const initialState: CustomerState = {
  email: '',
  fullName: '',
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerData: (state, action: PayloadAction<CustomerState>) => {
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
    },
    clearCustomerData: (state) => {
      state.email = '';
      state.fullName = '';
    },
  },
});

export const { setCustomerData, clearCustomerData } = customerSlice.actions;
export default customerSlice.reducer;
