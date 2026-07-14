import { DataSource, EntityManager } from 'typeorm';
import { Customer } from '../../../../../domain/entities/customer.entity';
import { CustomerTypeormRepository } from './customer-typeorm.repository';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

describe('CustomerTypeormRepository', () => {
  const customerId = '11111111-1111-1111-1111-111111111111';

  const createOrm = (overrides: Partial<CustomerOrmEntity> = {}): CustomerOrmEntity => {
    const orm = new CustomerOrmEntity();
    orm.id = customerId;
    orm.email = 'test@example.com';
    orm.fullName = 'Test User';
    Object.assign(orm, overrides);
    return orm;
  };

  const createManager = (overrides: Partial<EntityManager> = {}): EntityManager => {
    return {
      findOneBy: jest.fn(),
      save: jest.fn(),
      ...overrides,
    } as unknown as EntityManager;
  };

  it('findByEmail_whenCustomerExists_returnsMappedCustomer', async () => {
    const manager = createManager({
      findOneBy: jest.fn().mockResolvedValue(createOrm()),
    });
    const repo = new CustomerTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findByEmail('test@example.com');

    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
    expect(manager.findOneBy).toHaveBeenCalledWith(CustomerOrmEntity, { email: 'test@example.com' });
  });

  it('findByEmail_whenCustomerDoesNotExist_returnsNull', async () => {
    const manager = createManager({ findOneBy: jest.fn().mockResolvedValue(null) });
    const repo = new CustomerTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findByEmail('missing@example.com');

    expect(result).toBeNull();
  });

  it('save_persistsAndReturnsMappedCustomer', async () => {
    const customer = Customer.create({ email: 'test@example.com', fullName: 'Test User' });
    const manager = createManager({
      save: jest.fn().mockResolvedValue(createOrm({ id: customerId })),
    });
    const repo = new CustomerTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.save(customer);

    expect(result.id).toBe(customerId);
    expect(manager.save).toHaveBeenCalledWith(CustomerOrmEntity, expect.any(CustomerOrmEntity));
  });

  it('fallsBackToDataSourceManager_whenNoManagerProvided', async () => {
    const manager = createManager({
      findOneBy: jest.fn().mockResolvedValue(createOrm()),
    });
    const dataSource = { manager } as unknown as DataSource;
    const repo = new CustomerTypeormRepository(dataSource);

    const result = await repo.findByEmail('test@example.com');

    expect(result).not.toBeNull();
    expect(manager.findOneBy).toHaveBeenCalled();
  });
});
