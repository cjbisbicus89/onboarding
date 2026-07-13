import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Customer } from '../../../../../domain/entities/customer.entity';
import { CustomerRepositoryPort } from '../../../../../domain/ports/customer-repository.port';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { CustomerMapper } from '../mappers/customer.mapper';

@Injectable()
export class CustomerTypeormRepository implements CustomerRepositoryPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly manager?: EntityManager,
  ) {}

  async findByEmail(email: string): Promise<Customer | null> {
    const orm = await this.getManager().findOneBy(CustomerOrmEntity, { email });
    return orm ? CustomerMapper.toDomain(orm) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const orm = CustomerMapper.toOrm(customer);
    const saved = await this.getManager().save(CustomerOrmEntity, orm);
    return CustomerMapper.toDomain(saved);
  }

  private getManager(): EntityManager {
    return this.manager ?? this.dataSource.manager;
  }
}
