import { PaymentGatewayTimeoutException } from './payment-gateway-timeout.exception';

describe('PaymentGatewayTimeoutException', () => {
  it('constructs_withDefaultMessage', () => {
    const error = new PaymentGatewayTimeoutException();

    expect(error.status).toBe(500);
    expect(error.message).toBe('Tiempo de espera agotado con el proveedor de pagos');
  });

  it('constructs_withCustomMessage', () => {
    const error = new PaymentGatewayTimeoutException('custom timeout');

    expect(error.message).toBe('custom timeout');
    expect(error.status).toBe(500);
  });
});
