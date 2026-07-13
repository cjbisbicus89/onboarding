import { TransactionItem } from '../../../../../domain/entities/transaction-item.entity';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { TransactionItemOrmEntity } from '../entities/transaction-item.orm-entity';
import { TransactionItemMapper } from './transaction-item.mapper';

describe('TransactionItemMapper', () => {
  it('toDomain_whenOrmEntityIsValid_returnsTransactionItem', () => {
    const orm = new TransactionItemOrmEntity();
    orm.id = '11111111-1111-1111-1111-111111111111';
    orm.transactionId = '22222222-2222-2222-2222-222222222222';
    orm.productId = '33333333-3333-3333-3333-333333333333';
    orm.quantity = 2;
    orm.unitPriceCents = 50_000;

    const domain = TransactionItemMapper.toDomain(orm, 'COP');

    expect(domain.id).toBe(orm.id);
    expect(domain.productId).toBe(orm.productId);
    expect(domain.quantity).toBe(orm.quantity);
    expect(domain.unitPrice.toCents()).toBe(orm.unitPriceCents);
    expect(domain.unitPrice.currency).toBe('COP');
  });

  it('toOrm_whenDomainEntityIsValid_returnsOrmEntity', () => {
    const domain = TransactionItem.create({
      id: '11111111-1111-1111-1111-111111111111',
      productId: '33333333-3333-3333-3333-333333333333',
      quantity: 2,
      unitPrice: MoneyVO.fromCents(50_000, 'COP'),
    });

    const orm = TransactionItemMapper.toOrm(
      domain,
      '22222222-2222-2222-2222-222222222222',
    );

    expect(orm.id).toBe(domain.id);
    expect(orm.transactionId).toBe('22222222-2222-2222-2222-222222222222');
    expect(orm.productId).toBe(domain.productId);
    expect(orm.quantity).toBe(domain.quantity);
    expect(orm.unitPriceCents).toBe(domain.unitPrice.toCents());
  });
});
