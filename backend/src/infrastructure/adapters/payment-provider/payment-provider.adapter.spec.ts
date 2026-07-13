import { AxiosError } from 'axios';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Customer } from '../../../domain/entities/customer.entity';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { MoneyVO } from '../../../domain/value-objects/money.vo';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';
import { StructuredLogger } from '../../logging/structured-logger.service';
import { PaymentProviderAdapter } from './payment-provider.adapter';

jest.mock('../../correlation/correlation-id.context', () => ({
  CorrelationIdContext: {
    get: jest.fn().mockReturnValue('corr-123'),
  },
}));

describe('PaymentProviderAdapter', () => {
  let adapter: PaymentProviderAdapter;
  let httpService: { post: jest.Mock; get: jest.Mock };

  const createTransaction = (): Transaction =>
    Transaction.create({
      customer: Customer.create({
        email: 'customer@example.com',
        fullName: 'John Doe',
      }),
      items: [
        TransactionItem.create({
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 1,
          unitPrice: MoneyVO.fromCents(50_000, 'COP'),
        }),
      ],
    });

  beforeEach(async () => {
    httpService = { post: jest.fn(), get: jest.fn() };

    httpService.post.mockImplementation((url: string) => {
      if (url.includes('/tokens/cards')) {
        return of({
          data: { data: { id: 'token-123' } },
        });
      }
      if (url.includes('/transactions')) {
        return of({
          data: { data: { id: 'tx-123', status: 'APPROVED' } },
        });
      }
      return throwError(() => new Error('Unknown POST'));
    });

    httpService.get.mockReturnValue(
      of({
        data: {
          data: {
            presigned_acceptance: { acceptance_token: 'accept-token' },
          },
        },
      }),
    );

    const module = await Test.createTestingModule({
      providers: [
        PaymentProviderAdapter,
        CircuitBreakerService,
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => `value-for-${key}`,
          },
        },
        {
          provide: StructuredLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<PaymentProviderAdapter>(PaymentProviderAdapter);
  });

  it('processPayment_whenProviderApproves_returnsApprovedResult', async () => {
    const result = await adapter.processPayment(createTransaction(), {
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '2027',
      holderName: 'John Doe',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('APPROVED');
    expect(result.providerReference).toBe('tx-123');
  });

  it('processPayment_whenProviderDeclines_returnsDeclinedResult', async () => {
    httpService.post.mockImplementation((url: string) => {
      if (url.includes('/tokens/cards')) {
        return of({
          data: { data: { id: 'token-123' } },
        });
      }
      if (url.includes('/transactions')) {
        return of({
          data: { data: { id: 'tx-456', status: 'DECLINED' } },
        });
      }
      return throwError(() => new Error('Unknown POST'));
    });

    const result = await adapter.processPayment(createTransaction(), {
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '2027',
      holderName: 'John Doe',
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('DECLINED');
  });

  it('processPayment_whenHttpFails_propagatesError', async () => {
    const error = new AxiosError('Bad request');
    error.response = { status: 400 } as never;

    httpService.post.mockReturnValue(throwError(() => error));

    await expect(
      adapter.processPayment(createTransaction(), {
        cardNumber: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2027',
        holderName: 'John Doe',
      }),
    ).rejects.toThrow('Bad request');
  });
});
