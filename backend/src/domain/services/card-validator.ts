import { DomainException } from '../exceptions/domain.exception';
import { CardBrand } from '../../../../shared/enums/card-brand.enum';
import { CardValidator as SharedCardValidator, CardValidationResult } from '../../../../shared/utils/card-validator';

export class CardValidator {
  static sanitizeCardNumber(cardNumber: string): string {
    return SharedCardValidator.sanitizeCardNumber(cardNumber);
  }

  static isValidLength(cardNumber: string): boolean {
    return SharedCardValidator.isValidLength(cardNumber);
  }

  static luhnCheck(cardNumber: string): boolean {
    return SharedCardValidator.luhnCheck(cardNumber);
  }

  static detectCardBrand(cardNumber: string): CardBrand {
    return SharedCardValidator.detectCardBrand(cardNumber);
  }

  static validateCard(cardNumber: string): CardValidationResult {
    return SharedCardValidator.validateCard(cardNumber);
  }

  static validateExpiry(expiry: string): { isValid: boolean; error?: string } {
    return SharedCardValidator.validateExpiry(expiry);
  }

  static isValidCvc(cvc: string): boolean {
    return SharedCardValidator.isValidCvc(cvc);
  }

  static assertValid(card: { number: string; expMonth: string; expYear: string; cvc: string }): void {
    const cardResult = this.validateCard(card.number);
    if (!cardResult.isValid) {
      throw new DomainException(cardResult.error ?? 'Número de tarjeta inválido');
    }

    const expiryStr = `${card.expMonth}/${card.expYear.slice(-2)}`;
    const expiryResult = this.validateExpiry(expiryStr);
    if (!expiryResult.isValid) {
      throw new DomainException(expiryResult.error ?? 'Fecha de expiración inválida');
    }

    if (!this.isValidCvc(card.cvc)) {
      throw new DomainException('Código de seguridad (CVC) inválido');
    }
  }
}
