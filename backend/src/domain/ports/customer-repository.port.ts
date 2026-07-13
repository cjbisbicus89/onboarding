import { Customer } from '../entities/customer.entity';

export interface CustomerRepositoryPort {
  findByEmail(email: string): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
}
