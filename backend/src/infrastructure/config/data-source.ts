import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { CustomerOrmEntity } from '../adapters/persistence/typeorm/entities/customer.orm-entity';
import { ProductOrmEntity } from '../adapters/persistence/typeorm/entities/product.orm-entity';
import { TransactionOrmEntity } from '../adapters/persistence/typeorm/entities/transaction.orm-entity';
import { TransactionItemOrmEntity } from '../adapters/persistence/typeorm/entities/transaction-item.orm-entity';
import { AuditLogOrmEntity } from '../adapters/persistence/typeorm/entities/audit-log.orm-entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    CustomerOrmEntity,
    ProductOrmEntity,
    TransactionOrmEntity,
    TransactionItemOrmEntity,
    AuditLogOrmEntity,
  ],
  migrations: [
    __dirname + '/../adapters/persistence/typeorm/migrations/*{.ts,.js}',
  ],
  synchronize: false,
});
