export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

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
      return 'VISA';
    }

    if (/^5[1-5]/.test(sanitized)) {
      return 'MASTERCARD';
    }

    return 'UNKNOWN';
  }

  static detectBrand(cardNumber: string): CardBrand {
    return this.detectCardBrand(cardNumber);
  }

  static assert(cardNumber: string, brand?: CardBrand): void {
    const result = this.validateCard(cardNumber);
    if (!result.isValid) {
      throw new Error(result.error);
    }
    if (brand && brand !== 'UNKNOWN' && result.brand !== brand) {
      throw new Error(`La tarjeta no parece ser ${brand}`);
    }
  }

  static validateCard(cardNumber: string): CardValidationResult {
    const sanitized = this.sanitizeCardNumber(cardNumber);

    if (!this.isValidLength(sanitized)) {
      return {
        isValid: false,
        brand: 'UNKNOWN',
        error: 'El número de tarjeta debe tener entre 13 y 19 dígitos',
      };
    }

    if (!/^\d+$/.test(sanitized)) {
      return {
        isValid: false,
        brand: 'UNKNOWN',
        error: 'El número de tarjeta solo debe contener dígitos',
      };
    }

    if (!this.luhnCheck(sanitized)) {
      return {
        isValid: false,
        brand: this.detectCardBrand(sanitized),
        error: 'El número de tarjeta no es válido (algoritmo Luhn)',
      };
    }

    return {
      isValid: true,
      brand: this.detectCardBrand(sanitized),
    };
  }
}
