import { AppException } from './app.exception';

export class PaymentGatewayTimeoutException extends AppException {
  readonly status = 500;

  constructor(message = 'Tiempo de espera agotado con el proveedor de pagos') {
    super(message);
    Object.setPrototypeOf(this, PaymentGatewayTimeoutException.prototype);
  }
}
