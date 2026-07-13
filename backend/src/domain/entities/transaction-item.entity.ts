import { randomUUID } from 'crypto';
import { DomainException } from '../exceptions/domain.exception';
import { MoneyVO } from '../value-objects/money.vo';

interface CreateTransactionItemProps {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: MoneyVO;
}

export class TransactionItem {
  private constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: MoneyVO,
  ) {}

  static create(props: CreateTransactionItemProps): TransactionItem {
    const id = props.id ?? randomUUID();

    if (!props.productId || props.productId.trim().length === 0) {
      throw new DomainException('El ID del producto del ítem es obligatorio');
    }
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new DomainException(
        'La cantidad del ítem debe ser un número entero positivo',
      );
    }

    return new TransactionItem(
      id,
      props.productId,
      props.quantity,
      props.unitPrice,
    );
  }

  calculateSubtotal(): MoneyVO {
    return this.unitPrice.multiply(this.quantity);
  }
}
