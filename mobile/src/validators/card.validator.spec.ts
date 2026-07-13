import { CardValidator } from './card.validator';

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
      expect(CardValidator.detectBrand('4242424242424242')).toBe('VISA');
    });
    it('detects MASTERCARD', () => {
      expect(CardValidator.detectBrand('5555555555554444')).toBe('MASTERCARD');
    });
    it('returns UNKNOWN for other prefixes', () => {
      expect(CardValidator.detectBrand('9999999999999999')).toBe('UNKNOWN');
    });
  });

  describe('validateCard', () => {
    it('returns valid for a good VISA', () => {
      const result = CardValidator.validateCard('4242424242424242');
      expect(result.isValid).toBe(true);
      expect(result.brand).toBe('VISA');
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
});
