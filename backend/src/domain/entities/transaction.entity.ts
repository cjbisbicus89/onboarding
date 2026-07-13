import { randomUUID } from 'crypto';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { DomainException } from '../exceptions/domain.exception';
import { MoneyVO } from '../value-objects/money.vo';
import { Customer } from './customer.entity';
import { TransactionItem } from './transaction-item.entity';

interface CreateTransactionProps {
  id?: string;
  customer: Customer;
  items: TransactionItem[];
  totalAmount?: MoneyVO;
  idempotencyKey?: string | null;
  createdAt?: Date;
  status?: TransactionStatus;
  providerReference?: string | null;
  errorReason?: string | null;
}

export class Transaction {
  private constructor(
    public readonly id: string,
    public readonly customer: Customer,
    public readonly items: readonly TransactionItem[],
    private _status: TransactionStatus,
    private _providerReference: string | null,
    private _idempotencyKey: string | null,
    private _errorReason: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateTransactionProps): Transaction {
    const id = props.id ?? randomUUID();
    const createdAt = props.createdAt ?? new Date();
    const status = props.status ?? TransactionStatus.PENDING;

    if (!Array.isArray(props.items) || props.items.length === 0) {
      throw new DomainException('Una transacción requiere al menos un ítem.');
    }

    const transaction = new Transaction(
      id,
      props.customer,
      Object.freeze([...props.items]),
      status,
      props.providerReference ?? null,
      props.idempotencyKey ?? null,
      props.errorReason ?? null,
      createdAt,
    );

    if (props.totalAmount) {
      const calculatedTotal = transaction.calculateTotal();
      if (!props.totalAmount.equals(calculatedTotal)) {
        throw new DomainException(
          'El monto total guardado no coincide con la suma de los ítems de la transacción',
        );
      }
    }

    return transaction;
  }

  public calculateTotal(): MoneyVO {
    const currency = this.items[0]?.unitPrice.currency ?? 'COP';
    return this.items.reduce(
      (acc, item) => acc.add(item.unitPrice.multiply(item.quantity)),
      MoneyVO.zero(currency),
    );
  }

  get totalAmount(): MoneyVO {
    return this.calculateTotal();
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get providerReference(): string | null {
    return this._providerReference;
  }

  get idempotencyKey(): string | null {
    return this._idempotencyKey;
  }

  get errorReason(): string | null {
    return this._errorReason;
  }

  get merchantReference(): string {
    return this.id;
  }

  approve(providerReference: string): void {
    this.assertPending();
    if (!providerReference || providerReference.trim().length === 0) {
      throw new DomainException(
        'Se requiere la referencia del proveedor para aprobar la transacción.',
      );
    }
    this._status = TransactionStatus.APPROVED;
    this._providerReference = providerReference;
  }

  decline(reason: string): void {
    this.assertPending();
    this._status = TransactionStatus.DECLINED;
    this._errorReason = reason;
  }

  markAsError(reason: string): void {
    this.assertPending();
    this._status = TransactionStatus.ERROR;
    this._errorReason = reason;
  }

  private assertPending(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new DomainException(
        `Transición inválida: la transacción ${this.id} ya está en estado ${this._status}`,
      );
    }
  }
}
