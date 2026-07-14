import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from './entities/audit-log.orm-entity';
import { CustomerOrmEntity } from './entities/customer.orm-entity';
import { ProductOrmEntity } from './entities/product.orm-entity';
import { TransactionItemOrmEntity } from './entities/transaction-item.orm-entity';
import { TransactionOrmEntity } from './entities/transaction.orm-entity';
import { CustomerTypeormRepository } from './repositories/customer-typeorm.repository';
import { ProductTypeormRepository } from './repositories/product-typeorm.repository';
import { TransactionTypeormRepository } from './repositories/transaction-typeorm.repository';
import { TypeormUnitOfWork } from './typeorm-unit-of-work';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [
          CustomerOrmEntity,
          ProductOrmEntity,
          TransactionOrmEntity,
          TransactionItemOrmEntity,
          AuditLogOrmEntity,
        ],
        // Schema is owned exclusively by explicit migration files (see
        // src/infrastructure/adapters/persistence/typeorm/migrations).
        // `synchronize` should be false in production, but enabled for this test context.
        synchronize: true,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([
      CustomerOrmEntity,
      ProductOrmEntity,
      TransactionOrmEntity,
      TransactionItemOrmEntity,
      AuditLogOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: 'CustomerRepositoryPort',
      useClass: CustomerTypeormRepository,
    },
    {
      provide: 'ProductRepositoryPort',
      useClass: ProductTypeormRepository,
    },
    {
      provide: 'TransactionRepositoryPort',
      useClass: TransactionTypeormRepository,
    },
    {
      provide: 'UnitOfWorkPort',
      useClass: TypeormUnitOfWork,
    },
  ],
  exports: [
    'CustomerRepositoryPort',
    'ProductRepositoryPort',
    'TransactionRepositoryPort',
    'UnitOfWorkPort',
    TypeOrmModule,
  ],
})
export class TypeormDatabaseModule {}
