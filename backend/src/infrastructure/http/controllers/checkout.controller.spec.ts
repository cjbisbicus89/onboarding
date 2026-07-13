import { Test } from '@nestjs/testing';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { ProcessCheckoutUseCase } from '../../../application/use-cases/process-checkout.usecase';
import { CheckoutController } from './checkout.controller';
import {
  CheckoutItemDto,
  CheckoutRequestDto,
  CustomerDto,
  PaymentMethodDto,
} from '../dtos/checkout-request.dto';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Customer } from '../../../domain/entities/customer.entity';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { MoneyVO } from '../../../domain/value-objects/money.vo';

const MOCK_TIMESTAMP = '2026-01-01T00:00:00.000Z';

function createMockTransaction(): Transaction {
  return Transaction.create({
    id: '11111111-1111-1111-1111-111111111111',
    customer: Customer.create({
      id: '22222222-2222-2222-2222-222222222222',
      email: 'customer@example.com',
      fullName: 'John Doe',
    }),
    items: [
      TransactionItem.create({
        id: '33333333-3333-3333-3333-333333333333',
        productId: '11111111-1111-1111-1111-111111111111',
        quantity: 1,
        unitPrice: MoneyVO.fromCents(150_000, 'COP'),
      }),
    ],
    status: TransactionStatus.APPROVED,
    createdAt: new Date(MOCK_TIMESTAMP),
  });
}

function createCheckoutRequestDto(): CheckoutRequestDto {
  return Object.assign(new CheckoutRequestDto(), {
    items: [
      Object.assign(new CheckoutItemDto(), {
        productId: '11111111-1111-4111-a111-111111111111',
        quantity: 1,
      }),
    ],
    customer: Object.assign(new CustomerDto(), {
      email: 'customer@example.com',
      fullName: 'John Doe',
    }),
    paymentMethod: Object.assign(new PaymentMethodDto(), {
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '2027',
      holderName: 'John Doe',
    }),
  } as CheckoutRequestDto);
}

describe('CheckoutController', () => {
  let controller: CheckoutController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: ProcessCheckoutUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue(createMockTransaction()),
          },
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  it('checkout_whenHeadersAreValid_returnsCheckoutResponse', async () => {
    const result = await controller.checkout(
      createCheckoutRequestDto(),
      '11111111-1111-4111-a111-111111111111',
      '22222222-2222-4222-b222-222222222222',
    );

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.assignedTo).toBe('customer@example.com');
  });

  it('checkout_whenIdempotencyKeyIsMissing_throwsBadRequest', async () => {
    const emptyDto = Object.assign(new CheckoutRequestDto(), {});
    await expect(controller.checkout(emptyDto, '', '')).rejects.toThrow(
      "El encabezado 'Idempotency-Key' es obligatorio",
    );
  });
});
