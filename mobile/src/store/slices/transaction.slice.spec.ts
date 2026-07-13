import transactionReducer, {
  startCheckout,
  checkoutSuccess,
  checkoutFailure,
  resetTransactionState,
} from './transaction.slice';

describe('transaction.slice', () => {
  const initialState = transactionReducer(undefined, { type: 'unknown' });

  it('should return initial state', () => {
    expect(initialState.currentTransactionId).toBeNull();
    expect(initialState.status).toBe('IDLE');
    expect(initialState.loading).toBe(false);
    expect(initialState.isUnconfirmed).toBe(false);
  });

  it('should start checkout', () => {
    const state = transactionReducer(initialState, startCheckout('tx-123'));
    expect(state.loading).toBe(true);
    expect(state.isUnconfirmed).toBe(true);
    expect(state.status).toBe('PENDING');
    expect(state.currentTransactionId).toBe('tx-123');
  });

  it('should handle checkout success', () => {
    let state = transactionReducer(initialState, startCheckout('tx-123'));
    state = transactionReducer(
      state,
      checkoutSuccess({ transactionId: 'tx-123', status: 'APPROVED' }),
    );
    expect(state.loading).toBe(false);
    expect(state.isUnconfirmed).toBe(false);
    expect(state.currentTransactionId).toBe('tx-123');
    expect(state.status).toBe('APPROVED');
    expect(state.apiError).toBeNull();
  });

  it('should handle checkout failure', () => {
    let state = transactionReducer(initialState, startCheckout('tx-123'));
    state = transactionReducer(state, checkoutFailure('Gateway timeout'));
    expect(state.loading).toBe(false);
    expect(state.isUnconfirmed).toBe(false);
    expect(state.apiError).toBe('Gateway timeout');
    expect(state.status).toBe('ERROR');
  });

  it('should reset transaction state', () => {
    let state = transactionReducer(initialState, startCheckout('tx-123'));
    state = transactionReducer(
      state,
      checkoutSuccess({ transactionId: 'tx-123', status: 'APPROVED' }),
    );
    state = transactionReducer(state, resetTransactionState());
    expect(state.currentTransactionId).toBeNull();
    expect(state.status).toBe('IDLE');
    expect(state.loading).toBe(false);
    expect(state.isUnconfirmed).toBe(false);
    expect(state.apiError).toBeNull();
  });
});
