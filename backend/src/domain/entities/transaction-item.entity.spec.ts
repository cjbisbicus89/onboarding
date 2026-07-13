import { DomainException } from '../exceptions/domain.exception';
import { MoneyVO } from '../value-objects/money.vo';
import { TransactionItem } from './transaction-item.entity';

describe('TransactionItem', () => {
  it('create_whenPropsAreValid_createsItem', () => {
    const item = TransactionItem.create({
      productId: '11111111-1111-1111-1111-111111111111',
      quantity: 3,
      unitPrice: MoneyVO.fromCents(10_000, 'COP'),
    });

    expect(item.productId).toBe('11111111-1111-1111-1111-111111111111');
    expect(item.quantity).toBe(3);
    expect(item.unitPrice.toCents()).toBe(10_000);
  });

  it('create_whenProductIdIsEmpty_throwsDomainException', () => {
    expect(() =>
      TransactionItem.create({
        productId: '   ',
        quantity: 1,
        unitPrice: MoneyVO.fromCents(10_000, 'COP'),
      }),
    ).toThrow(DomainException);
  });

  it('create_whenQuantityIsZero_throwsDomainException', () => {
    expect(() =>
      TransactionItem.create({
        productId: '11111111-1111-1111-1111-111111111111',
        quantity: 0,
        unitPrice: MoneyVO.fromCents(10_000, 'COP'),
      }),
    ).toThrow(DomainException);
  });

  it('calculateSubtotal_returnsUnitPriceMultipliedByQuantity', () => {
    const item = TransactionItem.create({
      productId: '11111111-1111-1111-1111-111111111111',
      quantity: 3,
      unitPrice: MoneyVO.fromCents(10_000, 'COP'),
    });

    expect(item.calculateSubtotal().toCents()).toBe(30_000);
  });
});
