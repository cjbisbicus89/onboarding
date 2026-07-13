export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface CardValidationResult {
  readonly isValid: boolean;
  readonly brand: CardBrand;
  readonly error?: string;
}

export class CardValidator {
  static sanitizeCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\s/g, '').replace(/-/g, '');
  }

  static isValidLength(cardNumber: string): boolean {
    const sanitized = this.sanitizeCardNumber(cardNumber);
    return sanitized.length >= 13 && sanitized.length <= 19;
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
      return 'visa';
    }
    if (/^5[1-5]/.test(sanitized)) {
      return 'mastercard';
    }
    if (/^3[47]/.test(sanitized)) {
      return 'amex';
    }
    if (/^6011/.test(sanitized)) {
      return 'discover';
    }
    return 'unknown';
  }

  static validateCard(cardNumber: string): CardValidationResult {
    const sanitized = this.sanitizeCardNumber(cardNumber);

    if (!this.isValidLength(sanitized)) {
      return {
        isValid: false,
        brand: 'unknown',
        error: 'El número de tarjeta debe tener entre 13 y 19 dígitos',
      };
    }

    if (!/^\d+$/.test(sanitized)) {
      return {
        isValid: false,
        brand: 'unknown',
        error: 'El número de tarjeta debe contener solo dígitos',
      };
    }

    if (!this.luhnCheck(sanitized)) {
      return {
        isValid: false,
        brand: this.detectCardBrand(sanitized),
        error: 'El número de tarjeta no superó la verificación Luhn',
      };
    }

    return { isValid: true, brand: this.detectCardBrand(sanitized) };
  }
}
