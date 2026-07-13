import { Customer } from '../../../../../domain/entities/customer.entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { CustomerMapper } from './customer.mapper';

describe('CustomerMapper', () => {
  it('toDomain_whenOrmEntityIsValid_returnsCustomer', () => {
    const orm = new CustomerOrmEntity();
    orm.id = '11111111-1111-1111-1111-111111111111';
    orm.email = 'customer@example.com';
    orm.fullName = 'John Doe';

    const domain = CustomerMapper.toDomain(orm);

    expect(domain.id).toBe(orm.id);
    expect(domain.email).toBe(orm.email);
    expect(domain.fullName).toBe(orm.fullName);
  });

  it('toOrm_whenDomainEntityIsValid_returnsOrmEntity', () => {
    const domain = Customer.create({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'customer@example.com',
      fullName: 'John Doe',
    });

    const orm = CustomerMapper.toOrm(domain);

    expect(orm.id).toBe(domain.id);
    expect(orm.email).toBe(domain.email);
    expect(orm.fullName).toBe(domain.fullName);
  });
});
