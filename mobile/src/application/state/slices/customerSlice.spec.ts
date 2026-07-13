import customerReducer, { setCustomerData, clearCustomerData } from './customerSlice';

describe('customerSlice', () => {
  const initialState = {
    email: '',
    fullName: '',
  };

  it('should handle initial state', () => {
    expect(customerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCustomerData', () => {
    const data = { email: 'test@example.com', fullName: 'John Doe' };
    const state = customerReducer(initialState, setCustomerData(data));
    expect(state).toEqual(data);
  });

  it('should handle clearCustomerData', () => {
    const data = { email: 'test@example.com', fullName: 'John Doe' };
    let state = customerReducer(initialState, setCustomerData(data));
    state = customerReducer(state, clearCustomerData());
    expect(state).toEqual(initialState);
  });
});
