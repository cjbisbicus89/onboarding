import { Customer } from '../../../../../domain/entities/customer.entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

export class CustomerMapper {
  static toDomain(orm: CustomerOrmEntity): Customer {
    return Customer.create({
      id: orm.id,
      email: orm.email,
      fullName: orm.fullName,
    });
  }

  static toOrm(domain: Customer): CustomerOrmEntity {
    const orm = new CustomerOrmEntity();
    orm.id = domain.id;
    orm.email = domain.email;
    orm.fullName = domain.fullName;
    return orm;
  }
}
