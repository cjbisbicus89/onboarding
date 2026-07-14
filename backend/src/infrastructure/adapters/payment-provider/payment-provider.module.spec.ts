import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '../../logging/logging.module';
import { PaymentProviderModule } from './payment-provider.module';

describe('PaymentProviderModule', () => {
  it('module_compilesAndProvidesPaymentGatewayPort', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate: () =>
            ({
              NODE_ENV: 'test',
              PAYMENT_PROVIDER_BASE_URL: 'https://api.example.com',
              PAYMENT_PROVIDER_PUBLIC_KEY: 'pub-key',
              PAYMENT_PROVIDER_PRIVATE_KEY: 'prv-key',
              PAYMENT_PROVIDER_INTEGRITY_SECRET: 'integrity-secret',
              PAYMENT_PROVIDER_MERCHANT_ID: 'merchant-id',
            }) as any,
        }),
        LoggingModule,
        PaymentProviderModule,
      ],
    }).compile();

    const provider = module.get('PaymentGatewayPort');

    expect(provider).toBeDefined();
  });
});
