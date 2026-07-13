import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule as AxiosHttpModule } from '@nestjs/axios';
import { ProcessCheckoutUseCase } from '../../application/use-cases/process-checkout.usecase';
import { FindTransactionByIdUseCase } from '../../application/use-cases/find-transaction-by-id.usecase';
import { FindAllProductsUseCase } from '../../application/use-cases/find-all-products.usecase';
import { FindProductByIdUseCase } from '../../application/use-cases/find-product-by-id.usecase';
import { CheckoutController } from './controllers/checkout.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { ProductsController } from './controllers/products.controller';
import { HealthController } from './controllers/health.controller';
import { CorrelationIdMiddleware } from './middlewares/correlation-id.middleware';
import { HealthService } from '../health/health.service';
import { AuditModule } from '../audit/audit.module';
import { CorrelationModule } from '../correlation/correlation.module';
import { TypeormDatabaseModule } from '../adapters/persistence/typeorm/typeorm-database.module';
import { PaymentProviderModule } from '../adapters/payment-provider/payment-provider.module';

@Module({
  imports: [
    AxiosHttpModule,
    TypeormDatabaseModule,
    PaymentProviderModule,
    AuditModule,
    CorrelationModule,
  ],
  controllers: [
    CheckoutController,
    TransactionsController,
    ProductsController,
    HealthController,
  ],
  providers: [
    HealthService,
    ProcessCheckoutUseCase,
    FindTransactionByIdUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
  ],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
