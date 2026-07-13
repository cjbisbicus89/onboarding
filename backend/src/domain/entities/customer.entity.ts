import { randomUUID } from 'crypto';
import { DomainException } from '../exceptions/domain.exception';

interface CreateCustomerProps {
  id?: string;
  email: string;
  fullName: string;
}

export class Customer {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
  ) {}

  static create(props: CreateCustomerProps): Customer {
    const id = props.id ?? randomUUID();
    const email = props.email.trim();
    const fullName = props.fullName.trim();

    if (!Customer.isValidEmail(email)) {
      throw new DomainException(
        'El formato del correo electrónico del cliente no es válido',
      );
    }
    if (fullName.length === 0) {
      throw new DomainException(
        'El nombre completo del cliente es obligatorio',
      );
    }

    return new Customer(id, email, fullName);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
