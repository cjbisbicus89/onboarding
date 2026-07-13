import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';
import { PaymentProviderAdapter } from './payment-provider.adapter';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    CircuitBreakerService,
    {
      provide: 'PaymentGatewayPort',
      useClass: PaymentProviderAdapter,
    },
  ],
  exports: ['PaymentGatewayPort'],
})
export class PaymentProviderModule {}
