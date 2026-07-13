import { DomainException } from '../exceptions/domain.exception';

export class MoneyVO {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (!Number.isInteger(amount)) {
      throw new DomainException(
        'El monto debe ser un número entero en unidades menores',
      );
    }
    if (amount < 0) {
      throw new DomainException('El monto no puede ser negativo');
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new DomainException('La moneda debe ser un código ISO 4217 válido');
    }
  }

  static fromCents(amount: number, currency: string): MoneyVO {
    return new MoneyVO(amount, currency);
  }

  static zero(currency: string): MoneyVO {
    return new MoneyVO(0, currency);
  }

  add(other: MoneyVO): MoneyVO {
    this.assertSameCurrency(other);
    return new MoneyVO(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): MoneyVO {
    if (!Number.isInteger(factor) || factor < 0) {
      throw new DomainException(
        'El multiplicador del monto debe ser un número entero no negativo',
      );
    }
    return new MoneyVO(this.amount * factor, this.currency);
  }

  toCents(): number {
    return this.amount;
  }

  equals(other: MoneyVO): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private assertSameCurrency(other: MoneyVO): void {
    if (this.currency !== other.currency) {
      throw new DomainException('No se pueden operar con monedas diferentes');
    }
  }
}
