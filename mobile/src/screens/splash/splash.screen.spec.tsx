import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import SplashScreen from './splash.screen';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { checkoutClient } from '../../services/api/checkout-client.service';

jest.mock('../../store/hooks');
jest.mock('../../services/api/checkout-client.service');

describe('SplashScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigates to Home after delay when no unconfirmed transaction', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      currentTransactionId: null,
      isUnconfirmed: false,
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    act(() => {
      jest.advanceTimersByTime(2000); // SPLASH_DELAY_MS
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
  });

  it('polls transaction status when unconfirmed transaction exists', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      currentTransactionId: 'tx-123',
      isUnconfirmed: true,
    });

    (checkoutClient.getTransaction as jest.Mock).mockResolvedValue({
      status: 'APPROVED',
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(checkoutClient.getTransaction).toHaveBeenCalledWith('tx-123');
    });

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });

  it('retries polling when status is PENDING', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      currentTransactionId: 'tx-123',
      isUnconfirmed: true,
    });

    (checkoutClient.getTransaction as jest.Mock)
      .mockResolvedValueOnce({ status: 'PENDING' })
      .mockResolvedValueOnce({ status: 'APPROVED' });

    render(<SplashScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(checkoutClient.getTransaction).toHaveBeenCalledTimes(1);
    });

    act(() => {
      jest.advanceTimersByTime(3000); // POLL_INTERVAL_MS
    });

    await waitFor(() => {
      expect(checkoutClient.getTransaction).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });

  it('navigates to Home when polled status is DECLINED', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      currentTransactionId: 'tx-123',
      isUnconfirmed: true,
    });

    (checkoutClient.getTransaction as jest.Mock).mockResolvedValue({ status: 'DECLINED' });

    render(<SplashScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('navigates to Home when polling reaches max attempts', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      currentTransactionId: 'tx-123',
      isUnconfirmed: true,
    });

    (checkoutClient.getTransaction as jest.Mock).mockResolvedValue({ status: 'PENDING' });

    render(<SplashScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(checkoutClient.getTransaction).toHaveBeenCalledTimes(1);
    });

    for (let i = 0; i < 10; i += 1) {
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      await waitFor(() => {
        expect(checkoutClient.getTransaction).toHaveBeenCalledTimes(i + 2);
      });
    }

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });

  it('navigates to Home on polling error', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      currentTransactionId: 'tx-123',
      isUnconfirmed: true,
    });

    (checkoutClient.getTransaction as jest.Mock).mockRejectedValue(new Error('Fail'));

    render(<SplashScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });
});
