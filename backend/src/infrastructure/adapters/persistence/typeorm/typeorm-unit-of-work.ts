import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  TransactionalRepositories,
  UnitOfWorkPort,
} from '../../../../domain/ports/unit-of-work.port';
import { CorrelationIdContext } from '../../../correlation/correlation-id.context';
import { CustomerTypeormRepository } from './repositories/customer-typeorm.repository';
import { ProductTypeormRepository } from './repositories/product-typeorm.repository';
import { TransactionTypeormRepository } from './repositories/transaction-typeorm.repository';

@Injectable()
export class TypeormUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(
    work: (repos: TransactionalRepositories) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const correlationId = CorrelationIdContext.get();
    if (correlationId !== undefined && correlationId.length > 0) {
      const safeCorrelationId = correlationId.replace(/'/g, "''");
      await queryRunner.query(
        `SET LOCAL application_name = '${safeCorrelationId}'`,
      );
    }

    await queryRunner.startTransaction();

    try {
      const repos: TransactionalRepositories = {
        products: new ProductTypeormRepository(
          this.dataSource,
          queryRunner.manager,
        ),
        customers: new CustomerTypeormRepository(
          this.dataSource,
          queryRunner.manager,
        ),
        transactions: new TransactionTypeormRepository(
          this.dataSource,
          queryRunner.manager,
        ),
      };

      const result = await work(repos);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
