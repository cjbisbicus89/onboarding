import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Transaction } from '../../../../../domain/entities/transaction.entity';
import { DomainException } from '../../../../../domain/exceptions/domain.exception';
import { TransactionRepositoryPort } from '../../../../../domain/ports/transaction-repository.port';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { TransactionMapper } from '../mappers/transaction.mapper';

@Injectable()
export class TransactionTypeormRepository implements TransactionRepositoryPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly manager?: EntityManager,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const orm = TransactionMapper.toOrm(transaction);
    const saved = await this.getManager().save(TransactionOrmEntity, orm);
    const loaded = await this.findById(saved.id);
    if (!loaded) {
      throw new DomainException(
        `No se encontró la transacción ${saved.id} después de guardar`,
      );
    }
    return loaded;
  }

  async findById(id: string): Promise<Transaction | null> {
    const orm = await this.getManager().findOne(TransactionOrmEntity, {
      where: { id },
      relations: { customer: true, items: true },
    });
    return orm ? TransactionMapper.toDomain(orm) : null;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Transaction | null> {
    const orm = await this.getManager().findOne(TransactionOrmEntity, {
      where: { idempotencyKey },
      relations: { customer: true, items: true },
    });
    return orm ? TransactionMapper.toDomain(orm) : null;
  }

  private getManager(): EntityManager {
    return this.manager ?? this.dataSource.manager;
  }
}
