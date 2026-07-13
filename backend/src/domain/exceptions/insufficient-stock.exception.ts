import { AppException } from './app.exception';

interface InsufficientStockDetails {
  readonly productId: string;
  readonly productName?: string;
  readonly available: number;
  readonly requested: number;
}

export class InsufficientStockException extends AppException {
  readonly status = 422;

  constructor(details: string | InsufficientStockDetails) {
    super(InsufficientStockException.buildMessage(details));
    Object.setPrototypeOf(this, InsufficientStockException.prototype);
  }

  private static buildMessage(
    details: string | InsufficientStockDetails,
  ): string {
    if (typeof details === 'string') {
      return `Stock insuficiente para el producto ${details}`;
    }

    const identifier = details.productName ?? details.productId;
    return `Stock insuficiente para el producto '${identifier}'. Disponible: ${details.available}, solicitado: ${details.requested}`;
  }
}
