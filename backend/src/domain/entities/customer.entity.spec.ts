import { DomainException } from '../exceptions/domain.exception';
import { Customer } from './customer.entity';

describe('Customer', () => {
  it('create_whenPropsAreValid_createsCustomer', () => {
    const customer = Customer.create({
      email: 'customer@example.com',
      fullName: 'John Doe',
    });

    expect(customer.email).toBe('customer@example.com');
    expect(customer.fullName).toBe('John Doe');
  });

  it('create_whenEmailIsInvalid_throwsDomainException', () => {
    expect(() =>
      Customer.create({
        email: 'not-an-email',
        fullName: 'John Doe',
      }),
    ).toThrow(DomainException);
  });

  it('create_whenFullNameIsEmpty_throwsDomainException', () => {
    expect(() =>
      Customer.create({
        email: 'customer@example.com',
        fullName: '   ',
      }),
    ).toThrow(DomainException);
  });
});
