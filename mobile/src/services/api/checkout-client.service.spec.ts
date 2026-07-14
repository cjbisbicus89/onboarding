import axios, { AxiosError } from 'axios';
import { CheckoutClientService, CheckoutPayload } from './checkout-client.service';

jest.mock('axios');

describe('CheckoutClientService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedClient = {
    post: jest.fn(),
    get: jest.fn(),
  };

  let service: CheckoutClientService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedClient as any);
    jest.spyOn(CheckoutClientService.prototype as any, 'sleep').mockResolvedValue(undefined);
    service = new CheckoutClientService();
  });

  const payload: CheckoutPayload = {
    items: [{ productId: 'p1', quantity: 1 }],
    customer: { email: 'a@b.com', fullName: 'A B' },
    paymentMethod: {
      cardNumber: '4111111111111111',
      expMonth: '12',
      expYear: '2030',
      cvc: '123',
      holderName: 'A B',
    },
  };

  it('checkout_whenSuccessful_returnsResponseData', async () => {
    const responseData = {
      transactionId: 'tx-1',
      status: 'APPROVED',
      totalAmountCentavos: 1000,
      currency: 'COP',
      assignedTo: 'a@b.com',
      timestamp: new Date().toISOString(),
    };
    mockedClient.post.mockResolvedValue({ data: responseData });

    const result = await service.checkout(payload, 'key-1', 'corr-1');

    expect(result.transactionId).toBe('tx-1');
    expect(mockedClient.post).toHaveBeenCalledWith(
      '/checkout',
      payload,
      expect.objectContaining({
        headers: {
          'Idempotency-Key': 'key-1',
          'Correlation-ID': 'corr-1',
        },
      }),
    );
  });

  it('checkout_whenAxiosError_throwsNormalizedError', async () => {
    const error = new AxiosError('Network error');
    (error as any).response = { data: { message: 'Backend error' } };
    mockedClient.post.mockRejectedValue(error);

    await expect(service.checkout(payload, 'key-1', 'corr-1')).rejects.toThrow('Backend error');
  });

  it('checkout_whenAxiosErrorWithoutResponseMessage_throwsAxiosMessage', async () => {
    const error = new AxiosError('Network error');
    (error as any).message = 'Network error';
    (error as any).response = { data: {} };
    mockedClient.post.mockRejectedValue(error);

    await expect(service.checkout(payload, 'key-1', 'corr-1')).rejects.toThrow('Network error');
  });

  it('getTransaction_whenPlainError_throwsSameError', async () => {
    const error = new Error('Plain error');
    mockedClient.get.mockRejectedValue(error);

    await expect(service.getTransaction('tx-1')).rejects.toThrow('Plain error');
  });

  it('getTransaction_whenSuccessful_returnsResponseData', async () => {
    const responseData = {
      transactionId: 'tx-1',
      status: 'APPROVED',
      totalAmountCentavos: 1000,
      currency: 'COP',
      assignedTo: 'a@b.com',
      providerReference: null,
      createdAt: new Date().toISOString(),
      items: [],
    };
    mockedClient.get.mockResolvedValue({ data: responseData });

    const result = await service.getTransaction('tx-1');

    expect(result.transactionId).toBe('tx-1');
    expect(mockedClient.get).toHaveBeenCalledWith('/transactions/tx-1');
  });

  it('pollTransactionStatus_whenAlreadyApproved_returnsImmediately', async () => {
    const responseData = {
      transactionId: 'tx-1',
      status: 'APPROVED',
      totalAmountCentavos: 1000,
      currency: 'COP',
      assignedTo: 'a@b.com',
      providerReference: null,
      createdAt: new Date().toISOString(),
      items: [],
    };
    mockedClient.get.mockResolvedValue({ data: responseData });

    const result = await service.pollTransactionStatus('tx-1', 3, 10);

    expect(result.status).toBe('APPROVED');
    expect(mockedClient.get).toHaveBeenCalledTimes(1);
  });

  it('getTransaction_whenError_throwsNormalizedError', async () => {
    const error = new AxiosError('Server error');
    (error as any).response = { data: { message: 'Not found' } };
    mockedClient.get.mockRejectedValue(error);

    await expect(service.getTransaction('tx-1')).rejects.toThrow('Not found');
  });

  it('getTransaction_whenNonError_throwsUnknownError', async () => {
    mockedClient.get.mockRejectedValue('plain string');

    await expect(service.getTransaction('tx-1')).rejects.toThrow('Error desconocido');
  });

  it('pollTransactionStatus_whenMaxAttemptsReached_returnsLastStatus', async () => {
    const pendingResponse = {
      transactionId: 'tx-1',
      status: 'PENDING',
      totalAmountCentavos: 1000,
      currency: 'COP',
      assignedTo: 'a@b.com',
      providerReference: null,
      createdAt: new Date().toISOString(),
      items: [],
    };
    const finalResponse = { ...pendingResponse, status: 'ERROR' };
    mockedClient.get
      .mockResolvedValueOnce({ data: pendingResponse })
      .mockResolvedValueOnce({ data: finalResponse });

    (CheckoutClientService.prototype as any).sleep.mockRestore();

    const result = await service.pollTransactionStatus('tx-1', 1, 10);

    expect(result.status).toBe('ERROR');
    expect(mockedClient.get).toHaveBeenCalledTimes(2);
  });

  it('pollTransactionStatus_whenPendingThenApproved_pollsAndReturns', async () => {
    const pendingResponse = {
      transactionId: 'tx-1',
      status: 'PENDING',
      totalAmountCentavos: 1000,
      currency: 'COP',
      assignedTo: 'a@b.com',
      providerReference: null,
      createdAt: new Date().toISOString(),
      items: [],
    };
    const approvedResponse = { ...pendingResponse, status: 'APPROVED' };
    mockedClient.get
      .mockResolvedValueOnce({ data: pendingResponse })
      .mockResolvedValueOnce({ data: approvedResponse });

    jest.useFakeTimers();
    const promise = service.pollTransactionStatus('tx-1', 3, 10);
    jest.runAllTimers();
    const result = await promise;
    jest.useRealTimers();

    expect(result.status).toBe('APPROVED');
    expect(mockedClient.get).toHaveBeenCalledTimes(2);
  });
});
