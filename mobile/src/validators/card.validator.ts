import { CardBrand } from '../../../shared/enums/card-brand.enum';
import {
  CardValidator as SharedCardValidator,
  CardValidationResult,
  ExpiryValidationResult,
  MIN_CARD_NUMBER_LENGTH,
  MAX_CARD_NUMBER_LENGTH,
  MIN_CVC_LENGTH,
  MAX_CVC_LENGTH,
} from '../../../shared/utils/card-validator';

export type {
  CardValidationResult,
  ExpiryValidationResult,
};

export {
  MIN_CARD_NUMBER_LENGTH,
  MAX_CARD_NUMBER_LENGTH,
  MIN_CVC_LENGTH,
  MAX_CVC_LENGTH,
  CardBrand,
};

export class CardValidator {
  static sanitizeCardNumber(cardNumber: string): string {
    return SharedCardValidator.sanitizeCardNumber(cardNumber);
  }

  static isValidLength(cardNumber: string): boolean {
    return SharedCardValidator.isValidLength(cardNumber);
  }

  static isValidCvc(cvc: string): boolean {
    return SharedCardValidator.isValidCvc(cvc);
  }

  static validateExpiry(expiry: string): ExpiryValidationResult {
    return SharedCardValidator.validateExpiry(expiry);
  }

  static luhnCheck(cardNumber: string): boolean {
    return SharedCardValidator.luhnCheck(cardNumber);
  }

  static detectCardBrand(cardNumber: string): CardBrand {
    return SharedCardValidator.detectCardBrand(cardNumber);
  }

  static detectBrand(cardNumber: string): CardBrand {
    return this.detectCardBrand(cardNumber);
  }

  static assert(cardNumber: string, brand?: CardBrand): void {
    const result = this.validateCard(cardNumber);
    if (!result.isValid) {
      throw new Error(result.error);
    }
    if (brand && brand !== CardBrand.UNKNOWN && result.brand !== brand) {
      throw new Error(`La tarjeta no parece ser ${brand}`);
    }
  }

  static validateCard(cardNumber: string): CardValidationResult {
    return SharedCardValidator.validateCard(cardNumber);
  }
}
