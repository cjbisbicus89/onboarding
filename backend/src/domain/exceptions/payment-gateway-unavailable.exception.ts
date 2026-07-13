import { AppException } from './app.exception';

export class PaymentGatewayUnavailableException extends AppException {
  readonly status = 503;

  constructor(
    message = 'El proveedor de pagos no está disponible temporalmente',
  ) {
    super(message);
    Object.setPrototypeOf(this, PaymentGatewayUnavailableException.prototype);
  }
}
