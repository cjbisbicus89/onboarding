import { TransactionStatus } from '../../../../../domain/enums/transaction-status.enum';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { TransactionItemOrmEntity } from '../entities/transaction-item.orm-entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { TransactionMapper } from './transaction.mapper';

describe('TransactionMapper', () => {
  const createOrm = (): TransactionOrmEntity => {
    const customer = new CustomerOrmEntity();
    customer.id = '22222222-2222-2222-2222-222222222222';
    customer.email = 'customer@example.com';
    customer.fullName = 'John Doe';

    const item = new TransactionItemOrmEntity();
    item.id = '33333333-3333-3333-3333-333333333333';
    item.transactionId = '11111111-1111-1111-1111-111111111111';
    item.productId = '44444444-4444-4444-4444-444444444444';
    item.quantity = 2;
    item.unitPriceCents = 50_000;

    const transaction = new TransactionOrmEntity();
    transaction.id = '11111111-1111-1111-1111-111111111111';
    transaction.customer = customer;
    transaction.customerId = customer.id;
    transaction.items = [item];
    transaction.status = TransactionStatus.APPROVED;
    transaction.totalAmountCents = 100_000;
    transaction.currency = 'COP';
    transaction.providerReference = 'provider-ref';
    transaction.idempotencyKey = null;
    transaction.errorReason = null;
    transaction.createdAt = new Date('2026-01-01T00:00:00.000Z');

    return transaction;
  };

  it('toResponseDto_whenTransactionIsValid_returnsDto', () => {
    const transaction = TransactionMapper.toDomain(createOrm());
    const dto = TransactionMapper.toResponseDto(transaction);

    expect(dto.transactionId).toBe(transaction.id);
    expect(dto.status).toBe(transaction.status);
    expect(dto.totalAmountCentavos).toBe(100_000);
    expect(dto.currency).toBe('COP');
    expect(dto.assignedTo).toBe('customer@example.com');
    expect(dto.timestamp).toBe(transaction.createdAt.toISOString());
  });

  it('toTransactionResponseDto_whenTransactionIsValid_returnsDto', () => {
    const transaction = TransactionMapper.toDomain(createOrm());
    const dto = TransactionMapper.toTransactionResponseDto(transaction);

    expect(dto.transactionId).toBe(transaction.id);
    expect(dto.status).toBe(transaction.status);
    expect(dto.totalAmountCentavos).toBe(100_000);
    expect(dto.currency).toBe('COP');
    expect(dto.assignedTo).toBe('customer@example.com');
    expect(dto.providerReference).toBe('provider-ref');
    expect(dto.createdAt).toBe(transaction.createdAt.toISOString());
    expect(dto.items).toHaveLength(1);
    expect(dto.items[0].unitPriceCentavos).toBe(50_000);
  });

  it('toDomain_whenOrmEntityIsValid_returnsTransaction', () => {
    const transaction = TransactionMapper.toDomain(createOrm());

    expect(transaction.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(transaction.status).toBe(TransactionStatus.APPROVED);
    expect(transaction.items).toHaveLength(1);
    expect(transaction.customer.email).toBe('customer@example.com');
  });

  it('toOrm_whenDomainEntityIsValid_returnsOrmEntity', () => {
    const transaction = TransactionMapper.toDomain(createOrm());
    const orm = TransactionMapper.toOrm(transaction);

    expect(orm.id).toBe(transaction.id);
    expect(orm.status).toBe(transaction.status);
    expect(orm.totalAmountCents).toBe(100_000);
    expect(orm.customerId).toBe(transaction.customer.id);
    expect(orm.items).toHaveLength(1);
  });

  it('toDomain_whenRelationsAreMissing_throwsDomainException', () => {
    const orm = createOrm();
    orm.customer = undefined as any;

    expect(() => TransactionMapper.toDomain(orm)).toThrow('Se deben cargar las relaciones de la transacción');
  });

  it('toDomain_whenStatusIsInvalid_throwsDomainException', () => {
    const orm = createOrm();
    orm.status = 'INVALID';

    expect(() => TransactionMapper.toDomain(orm)).toThrow('Estado de transacción inválido');
  });
});
