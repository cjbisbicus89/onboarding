import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormDatabaseModule } from './infrastructure/adapters/persistence/typeorm/typeorm-database.module';
import { PaymentProviderModule } from './infrastructure/adapters/payment-provider/payment-provider.module';
import { HttpModule } from './infrastructure/http/http.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { validate } from './infrastructure/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    LoggingModule,
    TypeormDatabaseModule,
    PaymentProviderModule,
    HttpModule,
  ],
})
export class AppModule {}
