import { configureStore } from '@reduxjs/toolkit';
import transactionReducer, {
  startCheckout,
  checkoutSuccess,
  checkoutFailure,
  resetTransactionState,
  processCheckout,
} from './transaction.slice';
import cartReducer, { addItem } from './cart.slice';
import { checkoutClient } from '../../services/api/checkout-client.service';

jest.mock('../../services/api/checkout-client.service');

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

  it('checkoutSuccess_whenPending_setsUnconfirmedTrue', () => {
    const state = transactionReducer(
      initialState,
      checkoutSuccess({ transactionId: 'tx-123', status: 'PENDING' }),
    );
    expect(state.isUnconfirmed).toBe(true);
    expect(state.status).toBe('PENDING');
  });

  describe('processCheckout thunk', () => {
    let store: any;

    beforeEach(() => {
      (checkoutClient.checkout as jest.Mock).mockReset();
      (checkoutClient.pollTransactionStatus as jest.Mock).mockReset();
      store = configureStore({
        reducer: {
          transaction: transactionReducer,
          cart: cartReducer,
        },
      });
      store.dispatch(addItem({
        productId: 'prod-1',
        name: 'Product 1',
        description: 'Desc',
        imageUrl: 'https://example.com/img.png',
        priceCentavos: 1000,
        currency: 'COP',
        stock: 10,
      } as any));
    });

    it('whenApproved_dispatchesSuccessAndClearsCart', async () => {
      (checkoutClient.checkout as jest.Mock).mockResolvedValue({
        transactionId: 'tx-1',
        status: 'APPROVED',
        totalAmountCentavos: 1000,
        currency: 'COP',
        assignedTo: 'a@b.com',
        timestamp: new Date().toISOString(),
      });

      await store.dispatch(processCheckout({
        localTransactionId: 'local-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        customer: { email: 'a@b.com', fullName: 'A B' },
        paymentMethod: {
          cardNumber: '4242424242424242',
          expMonth: '12',
          expYear: '30',
          cvc: '123',
          holderName: 'A B',
        },
      }));

      const state = store.getState() as any;
      expect(state.transaction.status).toBe('APPROVED');
      expect(state.transaction.currentTransactionId).toBe('tx-1');
      expect(state.transaction.loading).toBe(false);
      expect(state.cart.items).toHaveLength(0);
    });

    it('whenPendingThenApproved_pollsAndDispatchesSuccess', async () => {
      (checkoutClient.checkout as jest.Mock).mockResolvedValue({
        transactionId: 'tx-1',
        status: 'PENDING',
        totalAmountCentavos: 1000,
        currency: 'COP',
        assignedTo: 'a@b.com',
        timestamp: new Date().toISOString(),
      });
      (checkoutClient.pollTransactionStatus as jest.Mock).mockResolvedValue({
        transactionId: 'tx-1',
        status: 'APPROVED',
        totalAmountCentavos: 1000,
        currency: 'COP',
        assignedTo: 'a@b.com',
        timestamp: new Date().toISOString(),
      });

      await store.dispatch(processCheckout({
        localTransactionId: 'local-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        customer: { email: 'a@b.com', fullName: 'A B' },
        paymentMethod: {
          cardNumber: '4242424242424242',
          expMonth: '12',
          expYear: '30',
          cvc: '123',
          holderName: 'A B',
        },
      }));

      const state = store.getState() as any;
      expect(state.transaction.status).toBe('APPROVED');
      expect(checkoutClient.pollTransactionStatus).toHaveBeenCalledWith('tx-1');
    });

    it('whenPendingAndStillPending_afterPollDoesNotClearCart', async () => {
      (checkoutClient.checkout as jest.Mock).mockResolvedValue({
        transactionId: 'tx-1',
        status: 'PENDING',
        totalAmountCentavos: 1000,
        currency: 'COP',
        assignedTo: 'a@b.com',
        timestamp: new Date().toISOString(),
      });
      (checkoutClient.pollTransactionStatus as jest.Mock).mockResolvedValue({
        transactionId: 'tx-1',
        status: 'PENDING',
        totalAmountCentavos: 1000,
        currency: 'COP',
        assignedTo: 'a@b.com',
        timestamp: new Date().toISOString(),
      });

      await (store.dispatch(processCheckout({
        localTransactionId: 'local-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        customer: { email: 'a@b.com', fullName: 'A B' },
        paymentMethod: {
          cardNumber: '4242424242424242',
          expMonth: '12',
          expYear: '30',
          cvc: '123',
          holderName: 'A B',
        },
      }) as any));

      const state = store.getState() as any;
      expect(state.transaction.status).toBe('PENDING');
      expect(state.transaction.isUnconfirmed).toBe(true);
      expect(state.cart.items).toHaveLength(1);
    });

    it('whenCheckoutFailsWithNonError_dispatchesFailureWithGenericMessage', async () => {
      (checkoutClient.checkout as jest.Mock).mockRejectedValue('network failure');

      const result = await (store.dispatch(processCheckout({
        localTransactionId: 'local-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        customer: { email: 'a@b.com', fullName: 'A B' },
        paymentMethod: {
          cardNumber: '4242424242424242',
          expMonth: '12',
          expYear: '30',
          cvc: '123',
          holderName: 'A B',
        },
      })) as any);

      expect(result.type).toContain('/rejected');
      expect(result.payload).toEqual({ transactionId: 'local-1', message: 'Error al procesar pago' });
      const state = store.getState() as any;
      expect(state.transaction.status).toBe('ERROR');
      expect(state.transaction.apiError).toBe('Error al procesar pago');
    });

    it('whenCheckoutFails_dispatchesFailureAndRejects', async () => {
      (checkoutClient.checkout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await store.dispatch(processCheckout({
        localTransactionId: 'local-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        customer: { email: 'a@b.com', fullName: 'A B' },
        paymentMethod: {
          cardNumber: '4242424242424242',
          expMonth: '12',
          expYear: '30',
          cvc: '123',
          holderName: 'A B',
        },
      }) as any);

      expect(result.type).toContain('/rejected');
      expect(result.payload).toEqual({ transactionId: 'local-1', message: 'Network error' });
      const state = store.getState() as any;
      expect(state.transaction.status).toBe('ERROR');
      expect(state.transaction.apiError).toBe('Network error');
    });
  });
});
