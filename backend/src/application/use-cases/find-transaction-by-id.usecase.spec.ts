import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Customer } from '../../domain/entities/customer.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { FindTransactionByIdUseCase } from './find-transaction-by-id.usecase';

class InMemoryTransactionRepository implements TransactionRepositoryPort {
  private transactions: Map<string, Transaction> = new Map();

  withTransaction(transaction: Transaction): void {
    this.transactions.set(transaction.id, transaction);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) ?? null;
  }

  async findByIdempotencyKey(): Promise<Transaction | null> {
    return null;
  }
}

describe('FindTransactionByIdUseCase', () => {
  it('execute_whenTransactionExists_returnsTransaction', async () => {
    const repository = new InMemoryTransactionRepository();
    const transaction = Transaction.create({
      customer: Customer.create({
        email: 'customer@example.com',
        fullName: 'John Doe',
      }),
      items: [
        TransactionItem.create({
          productId: '11111111-1111-1111-1111-111111111111',
          quantity: 1,
          unitPrice: MoneyVO.fromCents(10_000, 'COP'),
        }),
      ],
    });
    repository.withTransaction(transaction);

    const useCase = new FindTransactionByIdUseCase(repository);
    const result = await useCase.execute(transaction.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(transaction.id);
    expect(result?.status).toBe(TransactionStatus.PENDING);
  });

  it('execute_whenTransactionDoesNotExist_returnsNull', async () => {
    const repository = new InMemoryTransactionRepository();
    const useCase = new FindTransactionByIdUseCase(repository);

    const result = await useCase.execute(
      '11111111-1111-1111-1111-111111111111',
    );

    expect(result).toBeNull();
  });
});
