import { TransactionStatus } from '../enums/transaction-status.enum';
import { DomainException } from '../exceptions/domain.exception';
import { MoneyVO } from '../value-objects/money.vo';
import { Customer } from './customer.entity';
import { Transaction } from './transaction.entity';
import { TransactionItem } from './transaction-item.entity';

describe('Transaction', () => {
  const createCustomer = (): Customer =>
    Customer.create({
      email: 'customer@example.com',
      fullName: 'John Doe',
    });

  const createItem = (unitPriceCents = 10_000, quantity = 2): TransactionItem =>
    TransactionItem.create({
      productId: '11111111-1111-1111-1111-111111111111',
      quantity,
      unitPrice: MoneyVO.fromCents(unitPriceCents, 'COP'),
    });

  describe('create', () => {
    it('create_whenItemsAreValid_createsPendingTransaction', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });

      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.totalAmount.toCents()).toBe(20_000);
      expect(transaction.merchantReference).toBe(transaction.id);
    });

    it('create_whenItemsAreEmpty_throwsDomainException', () => {
      expect(() =>
        Transaction.create({
          customer: createCustomer(),
          items: [],
        }),
      ).toThrow(DomainException);
    });

    it('create_whenTotalAmountDoesNotMatch_throwsDomainException', () => {
      expect(() =>
        Transaction.create({
          customer: createCustomer(),
          items: [createItem()],
          totalAmount: MoneyVO.fromCents(1_000, 'COP'),
        }),
      ).toThrow(DomainException);
    });
  });

  describe('approve', () => {
    it('approve_whenPending_updatesStatusAndProviderReference', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });

      transaction.approve('ref-123');

      expect(transaction.status).toBe(TransactionStatus.APPROVED);
      expect(transaction.providerReference).toBe('ref-123');
    });

    it('approve_whenAlreadyApproved_throwsDomainException', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });
      transaction.approve('ref-123');

      expect(() => transaction.approve('ref-456')).toThrow(DomainException);
    });

    it('approve_whenProviderReferenceIsEmpty_throwsDomainException', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });

      expect(() => transaction.approve('   ')).toThrow(DomainException);
    });
  });

  describe('decline', () => {
    it('decline_whenPending_updatesStatusToDeclined', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });

      transaction.decline('Card declined');

      expect(transaction.status).toBe(TransactionStatus.DECLINED);
      expect(transaction.errorReason).toBe('Card declined');
    });

    it('decline_whenAlreadyApproved_throwsDomainException', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });
      transaction.approve('ref-123');

      expect(() => transaction.decline('Card declined')).toThrow(
        DomainException,
      );
    });
  });

  describe('markAsError', () => {
    it('markAsError_whenPending_updatesStatusToError', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });

      transaction.markAsError('Gateway timeout');

      expect(transaction.status).toBe(TransactionStatus.ERROR);
      expect(transaction.errorReason).toBe('Gateway timeout');
    });

    it('markAsError_whenAlreadyDeclined_throwsDomainException', () => {
      const transaction = Transaction.create({
        customer: createCustomer(),
        items: [createItem()],
      });
      transaction.decline('Card declined');

      expect(() => transaction.markAsError('Gateway timeout')).toThrow(
        DomainException,
      );
    });
  });
});
