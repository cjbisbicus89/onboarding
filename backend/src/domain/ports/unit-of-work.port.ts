import { CustomerRepositoryPort } from './customer-repository.port';
import { ProductRepositoryPort } from './product-repository.port';
import { TransactionRepositoryPort } from './transaction-repository.port';

export interface TransactionalRepositories {
  products: ProductRepositoryPort;
  customers: CustomerRepositoryPort;
  transactions: TransactionRepositoryPort;
}

export interface UnitOfWorkPort {
  runInTransaction<T>(
    work: (repos: TransactionalRepositories) => Promise<T>,
  ): Promise<T>;
}
