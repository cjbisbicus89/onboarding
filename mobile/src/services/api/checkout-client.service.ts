import axios, { AxiosInstance, AxiosError } from 'axios';
import { CONFIG } from '../../infrastructure/api/config';

const CHECKOUT_TIMEOUT_MS = 18_000;

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
  customer: { email: string; fullName: string };
  paymentMethod: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    holderName: string;
  };
}

export interface CheckoutResponse {
  transactionId: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';
  totalAmountCentavos: number;
  currency: string;
  assignedTo: string;
  timestamp: string;
}

export interface TransactionResponse {
  transactionId: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';
  totalAmountCentavos: number;
  currency: string;
  assignedTo: string;
  providerReference: string | null;
  createdAt: string;
  items: Array<{ productId: string; quantity: number; unitPriceCentavos: number }>;
}

export class CheckoutClientService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CONFIG.API_BASE_URL,
      timeout: CHECKOUT_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async checkout(
    payload: CheckoutPayload,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<CheckoutResponse> {
    try {
      const response = await this.client.post<CheckoutResponse>(
        '/checkout',
        payload,
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
            'Correlation-ID': correlationId,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getTransaction(id: string): Promise<TransactionResponse> {
    try {
      const response = await this.client.get<TransactionResponse>(
        `/transactions/${id}`,
      );
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async pollTransactionStatus(
    id: string,
    maxAttempts = 10,
    intervalMs = 3000,
  ): Promise<TransactionResponse> {
    let attempts = 0;
    let response = await this.getTransaction(id);

    while (
      response.status === 'PENDING' &&
      attempts < maxAttempts
    ) {
      await this.sleep(intervalMs);
      response = await this.getTransaction(id);
      attempts++;
    }

    return response;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error de comunicación con el servidor';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Error desconocido');
  }
}

export const checkoutClient = new CheckoutClientService();
