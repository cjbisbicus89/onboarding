import { Test } from '@nestjs/testing';
import { FindTransactionByIdUseCase } from '../../../application/use-cases/find-transaction-by-id.usecase';
import { TransactionsController } from './transactions.controller';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Customer } from '../../../domain/entities/customer.entity';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { MoneyVO } from '../../../domain/value-objects/money.vo';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: FindTransactionByIdUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue(
              Transaction.create({
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
                    unitPrice: MoneyVO.fromCents(10_000, 'COP'),
                  }),
                ],
                createdAt: new Date(),
              }),
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('findById_whenTransactionExists_returnsTransactionResponse', async () => {
    const result = await controller.findById(
      '11111111-1111-1111-1111-111111111111',
    );

    expect(result.transactionId).toBeDefined();
    expect(result.status).toBe('PENDING');
    expect(result.assignedTo).toBe('customer@example.com');
    expect(result.items).toHaveLength(1);
  });
});
