import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';

@Injectable()
export class FindTransactionByIdUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }
}
