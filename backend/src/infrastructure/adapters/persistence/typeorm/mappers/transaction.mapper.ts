import { TransactionStatus } from '../../../../../domain/enums/transaction-status.enum';
import { Transaction } from '../../../../../domain/entities/transaction.entity';
import { DomainException } from '../../../../../domain/exceptions/domain.exception';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { CustomerMapper } from './customer.mapper';
import { TransactionItemMapper } from './transaction-item.mapper';
import { TransactionResponseDto } from '../../../../http/dtos/transaction-response.dto';
import { CheckoutResponseDto } from '../../../../http/dtos/checkout-response.dto';

export class TransactionMapper {
  static toResponseDto(transaction: Transaction): CheckoutResponseDto {
    const totalAmount = transaction.calculateTotal();
    return {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmountCentavos: totalAmount.toCents(),
      currency: totalAmount.currency,
      assignedTo: transaction.customer.email,
      timestamp: transaction.createdAt.toISOString(),
      errorReason: transaction.errorReason || undefined,
    };
  }

  static toTransactionResponseDto(
    transaction: Transaction,
  ): TransactionResponseDto {
    const totalAmount = transaction.calculateTotal();
    return {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmountCentavos: totalAmount.toCents(),
      currency: totalAmount.currency,
      assignedTo: transaction.customer.email,
      providerReference: transaction.providerReference,
      createdAt: transaction.createdAt.toISOString(),
      items: transaction.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCentavos: item.unitPrice.toCents(),
      })),
    };
  }

  static toOrmEntity(transaction: Transaction): TransactionOrmEntity {
    const totalAmount = transaction.calculateTotal();
    const orm = new TransactionOrmEntity();
    orm.id = transaction.id;
    orm.status = transaction.status;
    orm.totalAmountCents = totalAmount.toCents();
    orm.currency = totalAmount.currency;
    orm.customerId = transaction.customer.id;
    orm.providerReference = transaction.providerReference;
    orm.idempotencyKey = transaction.idempotencyKey;
    orm.errorReason = transaction.errorReason;
    orm.createdAt = transaction.createdAt;
    orm.items = transaction.items.map((item) =>
      TransactionItemMapper.toOrm(item, transaction.id),
    );
    return orm;
  }

  static toDomain(orm: TransactionOrmEntity): Transaction {
    if (orm.customer === undefined || orm.items === undefined) {
      throw new DomainException(
        'Se deben cargar las relaciones de la transacción',
      );
    }

    const currency = orm.currency;
    return Transaction.create({
      id: orm.id,
      customer: CustomerMapper.toDomain(orm.customer),
      items: orm.items.map((item) =>
        TransactionItemMapper.toDomain(item, currency),
      ),
      totalAmount: MoneyVO.fromCents(orm.totalAmountCents, currency),
      status: parseTransactionStatus(orm.status),
      providerReference: orm.providerReference,
      idempotencyKey: orm.idempotencyKey,
      errorReason: orm.errorReason,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Transaction): TransactionOrmEntity {
    return this.toOrmEntity(domain);
  }
}

function parseTransactionStatus(status: string): TransactionStatus {
  switch (status) {
    case TransactionStatus.PENDING:
    case TransactionStatus.APPROVED:
    case TransactionStatus.DECLINED:
    case TransactionStatus.ERROR:
      return status;
    default:
      throw new DomainException(`Estado de transacción inválido: ${status}`);
  }
}
