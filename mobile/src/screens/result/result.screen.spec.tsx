import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ResultScreen from './result.screen';
import { useAppDispatch } from '../../store/hooks';
import { useNavigation } from '@react-navigation/native';
import { resetTransactionState } from '../../store/slices/transaction.slice';

jest.mock('../../store/hooks');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('ResultScreen', () => {
  const mockDispatch = jest.fn();
  let beforeRemoveCallback: ((event: any) => void) | undefined;
  const mockNavigation = {
    replace: jest.fn(),
    addListener: jest.fn((event, callback) => {
      if (event === 'beforeRemove') {
        beforeRemoveCallback = callback;
      }
      return jest.fn();
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    beforeRemoveCallback = undefined;
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  });

  it('renders correctly for APPROVED status', () => {
    const route = {
      params: { transactionId: 'tx-123', status: 'APPROVED' },
    };

    const { getByText } = render(<ResultScreen route={route as any} />);
    expect(getByText('¡Pago Exitoso!')).toBeTruthy();
    expect(getByText('ID: tx-123')).toBeTruthy();
  });

  it('renders correctly for DECLINED status and shows retry button', () => {
    const route = {
      params: { transactionId: 'tx-123', status: 'DECLINED' },
    };

    const { getByText } = render(<ResultScreen route={route as any} />);
    expect(getByText('Pago Rechazado')).toBeTruthy();
    expect(getByText('Intentar nuevamente')).toBeTruthy();
  });

  it('navigates to Home when clicking Volver al Home', () => {
    const route = {
      params: { transactionId: 'tx-123', status: 'APPROVED' },
    };

    const { getByText } = render(<ResultScreen route={route as any} />);
    fireEvent.press(getByText('Volver al Home'));

    expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('navigates to Checkout when clicking Intentar nuevamente', () => {
    const route = {
      params: { transactionId: 'tx-123', status: 'ERROR' },
    };

    const { getByText } = render(<ResultScreen route={route as any} />);
    fireEvent.press(getByText('Intentar nuevamente'));

    expect(mockNavigation.replace).toHaveBeenCalledWith('Checkout');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders PENDING status without retry button', () => {
    const route = {
      params: { transactionId: 'tx-123', status: 'PENDING' },
    };

    const { getByText, queryByText } = render(<ResultScreen route={route as any} />);
    expect(getByText('Pago en Proceso')).toBeTruthy();
    expect(queryByText('Intentar nuevamente')).toBeNull();
  });

  it('prevents back navigation and resets transaction on beforeRemove GO_BACK', () => {
    const route = {
      params: { transactionId: 'tx-123', status: 'APPROVED' },
    };

    const event = {
      data: { action: { type: 'GO_BACK' } },
      preventDefault: jest.fn(),
    };

    render(<ResultScreen route={route as any} />);

    expect(mockNavigation.addListener).toHaveBeenCalledWith('beforeRemove', expect.any(Function));

    beforeRemoveCallback!(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(resetTransactionState());
    expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
  });
});
