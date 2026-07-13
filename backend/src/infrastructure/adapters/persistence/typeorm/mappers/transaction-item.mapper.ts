import { TransactionItem } from '../../../../../domain/entities/transaction-item.entity';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { TransactionItemOrmEntity } from '../entities/transaction-item.orm-entity';

export class TransactionItemMapper {
  static toDomain(
    orm: TransactionItemOrmEntity,
    currency: string,
  ): TransactionItem {
    return TransactionItem.create({
      id: orm.id,
      productId: orm.productId,
      quantity: orm.quantity,
      unitPrice: MoneyVO.fromCents(orm.unitPriceCents, currency),
    });
  }

  static toOrm(
    domain: TransactionItem,
    transactionId: string,
  ): TransactionItemOrmEntity {
    const orm = new TransactionItemOrmEntity();
    orm.id = domain.id;
    orm.transactionId = transactionId;
    orm.productId = domain.productId;
    orm.quantity = domain.quantity;
    orm.unitPriceCents = domain.unitPrice.toCents();
    return orm;
  }
}
