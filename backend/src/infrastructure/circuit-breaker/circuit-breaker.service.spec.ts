import { PaymentGatewayUnavailableException } from '../../domain/exceptions/payment-gateway-unavailable.exception';
import { CircuitBreakerService } from './circuit-breaker.service';

describe('CircuitBreakerService', () => {
  it('execute_whenOperationSucceeds_returnsResult', async () => {
    const service = new CircuitBreakerService();

    const result = await service.execute(async () => 'ok');

    expect(result).toBe('ok');
  });

  it('execute_whenFailuresReachThreshold_opensCircuit', async () => {
    const service = new CircuitBreakerService();

    for (let i = 0; i < 5; i++) {
      await expect(
        service.execute(async () => {
          throw new Error('failure');
        }),
      ).rejects.toThrow('failure');
    }

    await expect(service.execute(async () => 'ok')).rejects.toThrow(
      PaymentGatewayUnavailableException,
    );
  });

  it('execute_whenCircuitRecovers_allowsRequestsAgain', async () => {
    const service = new CircuitBreakerService();

    for (let i = 0; i < 5; i++) {
      await expect(
        service.execute(async () => {
          throw new Error('failure');
        }),
      ).rejects.toThrow('failure');
    }

    await expect(service.execute(async () => 'ok')).rejects.toThrow(
      PaymentGatewayUnavailableException,
    );
  });
});
