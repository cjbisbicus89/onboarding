import { Injectable } from '@nestjs/common';
import { PaymentGatewayUnavailableException } from '../../domain/exceptions/payment-gateway-unavailable.exception';

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
}

@Injectable()
export class CircuitBreakerService {
  private readonly FAILURE_THRESHOLD = 5;
  private readonly COOLDOWN_MS = 60_000;

  private state: CircuitBreakerState = {
    state: 'CLOSED',
    failureCount: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
  };

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime!.getTime()) {
        throw new PaymentGatewayUnavailableException(
          'El proveedor de pagos no está disponible temporalmente (circuit breaker abierto)',
        );
      }
      this.state.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failureCount = 0;
    this.state.state = 'CLOSED';
    this.state.lastFailureTime = null;
    this.state.nextAttemptTime = null;
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = new Date();

    if (this.state.failureCount >= this.FAILURE_THRESHOLD) {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = new Date(Date.now() + this.COOLDOWN_MS);
    }
  }
}
