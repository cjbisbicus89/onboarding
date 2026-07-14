import { DataSource, EntityManager } from 'typeorm';
import { Customer } from '../../../../../domain/entities/customer.entity';
import { Transaction } from '../../../../../domain/entities/transaction.entity';
import { TransactionItem } from '../../../../../domain/entities/transaction-item.entity';
import { TransactionStatus } from '../../../../../domain/enums/transaction-status.enum';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { TransactionTypeormRepository } from './transaction-typeorm.repository';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { TransactionItemOrmEntity } from '../entities/transaction-item.orm-entity';

describe('TransactionTypeormRepository', () => {
  const transactionId = '11111111-1111-1111-1111-111111111111';
  const customerId = '22222222-2222-2222-2222-222222222222';
  const itemId = '33333333-3333-3333-3333-333333333333';
  const productId = '44444444-4444-4444-4444-444444444444';

  const createCustomerOrm = (): CustomerOrmEntity => {
    const orm = new CustomerOrmEntity();
    orm.id = customerId;
    orm.email = 'test@example.com';
    orm.fullName = 'Test User';
    return orm;
  };

  const createItemOrm = (): TransactionItemOrmEntity => {
    const orm = new TransactionItemOrmEntity();
    orm.id = itemId;
    orm.transactionId = transactionId;
    orm.productId = productId;
    orm.quantity = 2;
    orm.unitPriceCents = 25_000;
    return orm;
  };

  const createTransactionOrm = (
    overrides: Partial<TransactionOrmEntity> = {},
  ): TransactionOrmEntity => {
    const orm = new TransactionOrmEntity();
    orm.id = transactionId;
    orm.customerId = customerId;
    orm.customer = createCustomerOrm();
    orm.status = 'PENDING';
    orm.totalAmountCents = 50_000;
    orm.currency = 'COP';
    orm.providerReference = null;
    orm.idempotencyKey = null;
    orm.errorReason = null;
    orm.createdAt = new Date();
    orm.items = [createItemOrm()];
    Object.assign(orm, overrides);
    return orm;
  };

  const createTransaction = (): Transaction => {
    const customer = Customer.create({
      id: customerId,
      email: 'test@example.com',
      fullName: 'Test User',
    });
    const item = TransactionItem.create({
      id: itemId,
      productId,
      quantity: 2,
      unitPrice: MoneyVO.fromCents(25_000, 'COP'),
    });
    return Transaction.create({
      id: transactionId,
      customer,
      items: [item],
      status: TransactionStatus.PENDING,
    });
  };

  const createManager = (overrides: Partial<EntityManager> = {}): EntityManager => {
    return {
      findOne: jest.fn(),
      save: jest.fn(),
      ...overrides,
    } as unknown as EntityManager;
  };

  it('findById_whenTransactionExists_returnsMappedTransaction', async () => {
    const manager = createManager({
      findOne: jest.fn().mockResolvedValue(createTransactionOrm()),
    });
    const repo = new TransactionTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findById(transactionId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(transactionId);
    expect(manager.findOne).toHaveBeenCalledWith(TransactionOrmEntity, {
      where: { id: transactionId },
      relations: { customer: true, items: true },
    });
  });

  it('findById_whenTransactionDoesNotExist_returnsNull', async () => {
    const manager = createManager({ findOne: jest.fn().mockResolvedValue(null) });
    const repo = new TransactionTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findById(transactionId);

    expect(result).toBeNull();
  });

  it('findByIdempotencyKey_whenTransactionExists_returnsMappedTransaction', async () => {
    const manager = createManager({
      findOne: jest.fn().mockResolvedValue(createTransactionOrm({ idempotencyKey: 'key-1' })),
    });
    const repo = new TransactionTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findByIdempotencyKey('key-1');

    expect(result).not.toBeNull();
    expect(result?.idempotencyKey).toBe('key-1');
    expect(manager.findOne).toHaveBeenCalledWith(TransactionOrmEntity, {
      where: { idempotencyKey: 'key-1' },
      relations: { customer: true, items: true },
    });
  });

  it('findByIdempotencyKey_whenTransactionDoesNotExist_returnsNull', async () => {
    const manager = createManager({ findOne: jest.fn().mockResolvedValue(null) });
    const repo = new TransactionTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findByIdempotencyKey('missing-key');

    expect(result).toBeNull();
  });

  it('save_persistsAndReturnsMappedTransaction', async () => {
    const transaction = createTransaction();
    const manager = createManager({
      save: jest.fn().mockResolvedValue(createTransactionOrm({ id: transactionId })),
      findOne: jest.fn().mockResolvedValue(createTransactionOrm({ id: transactionId })),
    });
    const repo = new TransactionTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.save(transaction);

    expect(result.id).toBe(transactionId);
    expect(manager.save).toHaveBeenCalledWith(TransactionOrmEntity, expect.any(TransactionOrmEntity));
  });

  it('save_whenReloadFails_throwsDomainException', async () => {
    const transaction = createTransaction();
    const manager = createManager({
      save: jest.fn().mockResolvedValue(createTransactionOrm({ id: transactionId })),
      findOne: jest.fn().mockResolvedValue(null),
    });
    const repo = new TransactionTypeormRepository({ manager } as unknown as DataSource, manager);

    await expect(repo.save(transaction)).rejects.toThrow('No se encontró la transacción');
  });

  it('fallsBackToDataSourceManager_whenNoManagerProvided', async () => {
    const manager = createManager({
      findOne: jest.fn().mockResolvedValue(createTransactionOrm()),
    });
    const dataSource = { manager } as unknown as DataSource;
    const repo = new TransactionTypeormRepository(dataSource);

    const result = await repo.findById(transactionId);

    expect(result).not.toBeNull();
    expect(manager.findOne).toHaveBeenCalled();
  });
});
