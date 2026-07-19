import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CheckoutScreen from './checkout.screen';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeItem, updateItemQuantity } from '../../store/slices/cart.slice';
import { processCheckout } from '../../store/slices/transaction.slice';
import { setCustomerData } from '../../application/state/slices/customerSlice';
import { Toast, useToast } from '../../components/shared/toast.component';

jest.mock('../../store/hooks');
jest.mock('../../store/slices/cart.slice', () => ({
  removeItem: jest.fn((productId) => ({ type: 'removeItem', payload: productId })),
  updateItemQuantity: jest.fn((payload) => ({ type: 'updateItemQuantity', payload })),
  CartItem: jest.fn(),
}));
jest.mock('../../store/slices/transaction.slice', () => ({
  processCheckout: jest.fn((payload) => ({ type: 'processCheckout', payload })),
}));
jest.mock('../../application/state/slices/customerSlice', () => ({
  setCustomerData: jest.fn((payload) => ({ type: 'setCustomerData', payload })),
}));
jest.mock('uuid', () => ({ v4: jest.fn(() => 'mock-uuid') }));

jest.mock('../../components/ui/backdrop.component', () => ({
  Backdrop: ({ visible, children }: any) => (visible ? children : null),
}));

jest.mock('./components/card-form.component', () => ({
  CardFormComponent: ({ onComplete }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        onPress={() =>
          onComplete({
            cardNumber: '4111111111111111',
            expMonth: '12',
            expYear: '2030',
            cvc: '123',
            holderName: 'John Doe',
          })
        }
      >
        <Text>CardFormSubmit</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('./components/customer-form.component', () => ({
  CustomerFormComponent: ({ onComplete }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={() => onComplete({ email: 'test@example.com', fullName: 'John Doe' })}>
        <Text>CustomerFormSubmit</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('./components/payment-summary.component', () => ({
  PaymentSummaryComponent: ({ onConfirm }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onConfirm}>
        <Text>ConfirmPayment</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('../../components/shared/toast.component', () => ({
  Toast: jest.fn(),
  useToast: jest.fn(),
}));

describe('CheckoutScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
  let checkoutResponse: any = { status: 'APPROVED', transactionId: 'tx' };
  let checkoutReject = false;
  let mockShowToast: jest.Mock;
  let currentToast: any = null;

  const baseCart = {
    items: [{ productId: '1', name: 'Product 1', priceCentavos: 1000, quantity: 2, currency: 'COP' }],
    totalAmountCentavos: 2000,
    itemCount: 1,
  };

  const baseCustomer = { email: 'test@example.com', fullName: 'John Doe' };
  let currentCustomer = baseCustomer;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    checkoutReject = false;
    checkoutResponse = { status: 'APPROVED', transactionId: 'tx' };
    currentCustomer = baseCustomer;
    mockShowToast = jest.fn();
    currentToast = null;
    (useToast as jest.Mock).mockImplementation(() => ({ toast: currentToast, show: mockShowToast }));
    (Toast as jest.Mock).mockImplementation(() => null);
    mockDispatch.mockImplementation((action: any) => {
      if (action?.type === 'setCustomerData') currentCustomer = action.payload;
      return {
        unwrap: () => {
          if (checkoutReject) throw checkoutResponse;
          return checkoutResponse;
        },
      };
    });
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockImplementation((selector) => selector({ cart: baseCart, customer: currentCustomer }));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders empty cart message', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({ cart: { items: [], totalAmountCentavos: 0, itemCount: 0 }, customer: baseCustomer })
    );
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);
    expect(getByText('Tu carrito está vacío')).toBeTruthy();
  });

  it('handles generic error message when checkout rejection has no message', async () => {
    checkoutReject = true;
    checkoutResponse = undefined;
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);

    await act(async () => { fireEvent.press(getByText('Pagar con tarjeta de crédito')); await Promise.resolve(); });
    await act(async () => { fireEvent.press(getByText('CardFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    await act(async () => { fireEvent.press(getByText('ConfirmPayment')); await Promise.resolve(); jest.advanceTimersByTime(2000); });

    expect(mockShowToast).toHaveBeenCalledWith('Error al procesar pago', 'error');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Result', { transactionId: 'mock-uuid', status: 'ERROR', message: 'Error al procesar pago' });
  });

  it('renders and dismisses toast when a toast is present', () => {
    currentToast = { message: 'Toast message', type: 'info' };
    (Toast as jest.Mock).mockImplementation(({ onDismiss, message }: any) => {
      const { TouchableOpacity, Text } = require('react-native');
      return (
        <TouchableOpacity onPress={onDismiss}>
          <Text>{message}</Text>
        </TouchableOpacity>
      );
    });

    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);
    fireEvent.press(getByText('Toast message'));

    expect(mockShowToast).toHaveBeenCalledWith('', 'info');
  });

  it('updates quantity and removes item', () => {
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);
    fireEvent.press(getByText('Plus'));
    fireEvent.press(getByText('Minus'));
    fireEvent.press(getByText('Trash2'));

    expect(updateItemQuantity).toHaveBeenCalledWith({ productId: '1', quantity: 3 });
    expect(updateItemQuantity).toHaveBeenCalledWith({ productId: '1', quantity: 1 });
    expect(removeItem).toHaveBeenCalledWith('1');
  });

  it('goes back when back arrow is pressed', () => {
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);
    fireEvent.press(getByText('ArrowLeft'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('starts payment with customer form when customer is missing', async () => {
    currentCustomer = { email: '', fullName: '' };
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);

    await act(async () => { fireEvent.press(getByText('Pagar con tarjeta de crédito')); await Promise.resolve(); });
    expect(getByText('CustomerFormSubmit')).toBeTruthy();

    await act(async () => { fireEvent.press(getByText('CustomerFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    expect(getByText('CardFormSubmit')).toBeTruthy();

    await act(async () => { fireEvent.press(getByText('CardFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    expect(getByText('ConfirmPayment')).toBeTruthy();

    await act(async () => { fireEvent.press(getByText('ConfirmPayment')); await Promise.resolve(); });

    expect(setCustomerData).toHaveBeenCalledWith({ email: 'test@example.com', fullName: 'John Doe' });
    expect(processCheckout).toHaveBeenCalledWith({
      localTransactionId: 'mock-uuid',
      items: [{ productId: '1', quantity: 2 }],
      customer: { email: 'test@example.com', fullName: 'John Doe' },
      paymentMethod: {
        cardNumber: '4111111111111111',
        expMonth: '12',
        expYear: '2030',
        cvc: '123',
        holderName: 'John Doe',
      },
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Result', {
      transactionId: 'tx',
      status: 'APPROVED',
    });
  });

  it('starts payment with existing customer and completes approved purchase', async () => {
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);

    await act(async () => { fireEvent.press(getByText('Pagar con tarjeta de crédito')); await Promise.resolve(); });
    expect(getByText('CardFormSubmit')).toBeTruthy();

    await act(async () => { fireEvent.press(getByText('CardFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    expect(getByText('ConfirmPayment')).toBeTruthy();

    await act(async () => { fireEvent.press(getByText('ConfirmPayment')); await Promise.resolve(); });

    expect(processCheckout).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Result', { transactionId: 'tx', status: 'APPROVED' });
  });

  it('handles declined payment and navigates after delay', async () => {
    checkoutResponse = { status: 'DECLINED', transactionId: 'tx' };
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);

    await act(async () => { fireEvent.press(getByText('Pagar con tarjeta de crédito')); await Promise.resolve(); });
    await act(async () => { fireEvent.press(getByText('CardFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    await act(async () => { fireEvent.press(getByText('ConfirmPayment')); await Promise.resolve(); jest.advanceTimersByTime(2000); });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Result', { transactionId: 'tx', status: 'DECLINED', message: 'Transacción rechazada por el banco emisor' });
  });

  it('handles pending payment and navigates after delay', async () => {
    checkoutResponse = { status: 'PENDING', transactionId: 'tx' };
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);

    await act(async () => { fireEvent.press(getByText('Pagar con tarjeta de crédito')); await Promise.resolve(); });
    await act(async () => { fireEvent.press(getByText('CardFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    await act(async () => { fireEvent.press(getByText('ConfirmPayment')); await Promise.resolve(); jest.advanceTimersByTime(2000); });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Result', { transactionId: 'tx', status: 'PENDING', message: 'El pago está siendo procesado, verificaremos su estado al reiniciar la app' });
  });

  it('handles payment error and navigates after delay', async () => {
    checkoutReject = true;
    checkoutResponse = { transactionId: 'err-tx', message: 'Bank error' };
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation as any} />);

    await act(async () => { fireEvent.press(getByText('Pagar con tarjeta de crédito')); await Promise.resolve(); });
    await act(async () => { fireEvent.press(getByText('CardFormSubmit')); await Promise.resolve(); jest.advanceTimersByTime(300); });
    await act(async () => { fireEvent.press(getByText('ConfirmPayment')); await Promise.resolve(); jest.advanceTimersByTime(2000); });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Result', { transactionId: 'err-tx', status: 'ERROR', message: 'Bank error' });
  });
});
