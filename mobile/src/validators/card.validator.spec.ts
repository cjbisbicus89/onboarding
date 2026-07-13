import { CardValidator, CardBrand } from './card.validator';

describe('CardValidator', () => {
  describe('sanitizeCardNumber', () => {
    it('removes spaces and dashes', () => {
      expect(CardValidator.sanitizeCardNumber('4111 1111-1111 1111')).toBe('4111111111111111');
    });
  });

  describe('isValidLength', () => {
    it('accepts length 16', () => {
      expect(CardValidator.isValidLength('4242424242424242')).toBe(true);
    });
    it('rejects length 12', () => {
      expect(CardValidator.isValidLength('411111111111')).toBe(false);
    });
    it('rejects length 20', () => {
      expect(CardValidator.isValidLength('41111111111111111111')).toBe(false);
    });
  });

  describe('luhnCheck', () => {
    it('validates a known VISA test number', () => {
      expect(CardValidator.luhnCheck('4242424242424242')).toBe(true);
    });
    it('validates a known Mastercard test number', () => {
      expect(CardValidator.luhnCheck('5555555555554444')).toBe(true);
    });
    it('rejects an invalid number', () => {
      expect(CardValidator.luhnCheck('4242424242424243')).toBe(false);
    });
    it('rejects alphanumeric input', () => {
      expect(CardValidator.luhnCheck('4111a1111b1111c1111')).toBe(false);
    });
  });

  describe('detectCardBrand', () => {
    it('detects VISA', () => {
      expect(CardValidator.detectBrand('4242424242424242')).toBe(CardBrand.VISA);
    });
    it('detects MASTERCARD', () => {
      expect(CardValidator.detectBrand('5555555555554444')).toBe(CardBrand.MASTERCARD);
    });
    it('returns UNKNOWN for other prefixes', () => {
      expect(CardValidator.detectBrand('9999999999999999')).toBe(CardBrand.UNKNOWN);
    });
  });

  describe('validateCard', () => {
    it('returns valid for a good VISA', () => {
      const result = CardValidator.validateCard('4242424242424242');
      expect(result.isValid).toBe(true);
      expect(result.brand).toBe(CardBrand.VISA);
    });
    it('returns invalid for wrong length', () => {
      const result = CardValidator.validateCard('411111111111');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('13 y 19');
    });
    it('returns invalid for alphanumeric', () => {
      const result = CardValidator.validateCard('4111a1111b1111c1111');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('solo debe contener dígitos');
    });
  });

  describe('isValidCvc', () => {
    it('accepts 3-digit CVC', () => {
      expect(CardValidator.isValidCvc('123')).toBe(true);
    });
    it('accepts 4-digit CVC', () => {
      expect(CardValidator.isValidCvc('1234')).toBe(true);
    });
    it('rejects letters', () => {
      expect(CardValidator.isValidCvc('12a')).toBe(false);
    });
    it('rejects 2-digit CVC', () => {
      expect(CardValidator.isValidCvc('12')).toBe(false);
    });
  });

  describe('validateExpiry', () => {
    it('accepts a valid future date', () => {
      const futureYear = new Date().getFullYear() + 1;
      const shortYear = futureYear % 100;
      const result = CardValidator.validateExpiry(`12/${shortYear}`);
      expect(result.isValid).toBe(true);
    });
    it('rejects expired date', () => {
      const result = CardValidator.validateExpiry('01/20');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('vencida');
    });
    it('rejects invalid month', () => {
      const result = CardValidator.validateExpiry('13/30');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Mes inválido');
    });
    it('rejects malformed date', () => {
      const result = CardValidator.validateExpiry('1230');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Fecha inválida');
    });
  });
});
