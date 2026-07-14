import { CardBrand } from '../enums/card-brand.enum';

export const MIN_CARD_NUMBER_LENGTH = 13;
export const MAX_CARD_NUMBER_LENGTH = 19;
export const MIN_CVC_LENGTH = 3;
export const MAX_CVC_LENGTH = 4;

export interface CardValidationResult {
  readonly isValid: boolean;
  readonly brand: CardBrand;
  readonly error?: string;
}

export interface ExpiryValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

export class CardValidator {
  static sanitizeCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\s/g, '').replace(/-/g, '');
  }

  static isValidLength(cardNumber: string): boolean {
    const sanitized = this.sanitizeCardNumber(cardNumber);
    return (
      sanitized.length >= MIN_CARD_NUMBER_LENGTH &&
      sanitized.length <= MAX_CARD_NUMBER_LENGTH
    );
  }

  static isValidCvc(cvc: string): boolean {
    return new RegExp(`^\\d{${MIN_CVC_LENGTH},${MAX_CVC_LENGTH}}$`).test(cvc);
  }

  static validateExpiry(expiry: string): ExpiryValidationResult {
    if (!expiry || expiry.length !== 5) {
      return { isValid: false, error: 'Fecha inválida. Usa el formato MM/YY' };
    }

    const [monthPart, yearPart] = expiry.split('/');
    const month = parseInt(monthPart, 10);
    const yearShort = parseInt(yearPart, 10);

    if (Number.isNaN(month) || Number.isNaN(yearShort)) {
      return { isValid: false, error: 'Fecha inválida. Usa el formato MM/YY' };
    }

    if (month < 1 || month > 12) {
      return { isValid: false, error: 'Mes inválido' };
    }

    const fullYear = 2000 + yearShort;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (
      fullYear < currentYear ||
      (fullYear === currentYear && month < currentMonth)
    ) {
      return { isValid: false, error: 'La tarjeta está vencida' };
    }

    if (yearShort > 99) {
      return { isValid: false, error: 'Año de expiración inválido' };
    }

    return { isValid: true };
  }

  static luhnCheck(cardNumber: string): boolean {
    const sanitized = this.sanitizeCardNumber(cardNumber);

    if (!/^\d+$/.test(sanitized)) {
      return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  static detectCardBrand(cardNumber: string): CardBrand {
    const sanitized = this.sanitizeCardNumber(cardNumber);

    if (/^4/.test(sanitized)) {
      return CardBrand.VISA;
    }

    if (/^5[1-5]/.test(sanitized)) {
      return CardBrand.MASTERCARD;
    }

    if (/^3[47]/.test(sanitized)) {
      return CardBrand.AMEX;
    }

    if (/^6011/.test(sanitized)) {
      return CardBrand.DISCOVER;
    }

    return CardBrand.UNKNOWN;
  }

  static validateCard(cardNumber: string): CardValidationResult {
    const sanitized = this.sanitizeCardNumber(cardNumber);

    if (!this.isValidLength(sanitized)) {
      return {
        isValid: false,
        brand: CardBrand.UNKNOWN,
        error: 'El número de tarjeta debe tener entre 13 y 19 dígitos',
      };
    }

    if (!/^\d+$/.test(sanitized)) {
      return {
        isValid: false,
        brand: CardBrand.UNKNOWN,
        error: 'El número de tarjeta solo debe contener dígitos',
      };
    }

    if (!this.luhnCheck(sanitized)) {
      return {
        isValid: false,
        brand: this.detectCardBrand(sanitized),
        error: 'Número de tarjeta inválido',
      };
    }

    return {
      isValid: true,
      brand: this.detectCardBrand(sanitized),
    };
  }
}
