import { randomUUID } from 'crypto';
import { DomainException } from '../exceptions/domain.exception';
import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';
import { MoneyVO } from '../value-objects/money.vo';

interface CreateProductProps {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  price: MoneyVO;
  stock: number;
}

export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly imageUrl: string,
    public readonly price: MoneyVO,
    private _stock: number,
  ) {}

  static create(props: CreateProductProps): Product {
    const id = props.id ?? randomUUID();
    const name = props.name.trim();
    const description = props.description.trim();
    const imageUrl = props.imageUrl.trim();

    if (name.length === 0) {
      throw new DomainException('El nombre del producto es obligatorio');
    }
    if (!Number.isInteger(props.stock) || props.stock < 0) {
      throw new DomainException(
        'El inventario del producto debe ser un número entero no negativo',
      );
    }

    return new Product(
      id,
      name,
      description,
      imageUrl,
      props.price,
      props.stock,
    );
  }

  get stock(): number {
    return this._stock;
  }

  hasSufficientStock(quantity: number): boolean {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException(
        'La cantidad solicitada debe ser un número entero positivo',
      );
    }
    return this._stock >= quantity;
  }

  decreaseStock(quantity: number): Product {
    if (!this.hasSufficientStock(quantity)) {
      throw new InsufficientStockException(this.id);
    }
    return new Product(
      this.id,
      this.name,
      this.description,
      this.imageUrl,
      this.price,
      this._stock - quantity,
    );
  }
}
