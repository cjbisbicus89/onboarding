import { DomainException } from '../exceptions/domain.exception';
import { CardValidator } from './card-validator';

describe('CardValidator', () => {
  describe('luhnCheck', () => {
    it('luhnCheck_whenCardNumberIsValid_returnsTrue', () => {
      expect(CardValidator.luhnCheck('4111111111111111')).toBe(true);
      expect(CardValidator.luhnCheck('4532015112830366')).toBe(true);
      expect(CardValidator.luhnCheck('6011514433546201')).toBe(true);
    });

    it('luhnCheck_whenCardNumberIsInvalid_returnsFalse', () => {
      expect(CardValidator.luhnCheck('4111111111111112')).toBe(false);
      expect(CardValidator.luhnCheck('1234567890123456')).toBe(false);
    });

    it('luhnCheck_whenCardNumberContainsLetters_returnsFalse', () => {
      expect(CardValidator.luhnCheck('411111111111111a')).toBe(false);
      expect(CardValidator.luhnCheck('abc')).toBe(false);
    });

    it('luhnCheck_whenCardNumberIsEmpty_returnsFalse', () => {
      expect(CardValidator.luhnCheck('')).toBe(false);
    });

    it('luhnCheck_whenSingleDigitZero_returnsTrue', () => {
      expect(CardValidator.luhnCheck('0')).toBe(true);
    });
  });

  describe('assertValid', () => {
    it('assertValid_whenCardNumberIsValid_doesNotThrow', () => {
      expect(() =>
        CardValidator.assertValid({
          number: '4111111111111111',
          expMonth: '12',
          expYear: '2030',
          cvc: '123',
        }),
      ).not.toThrow();
    });

    it('assertValid_whenCardNumberIsInvalid_throwsDomainException', () => {
      expect(() =>
        CardValidator.assertValid({
          number: '4111111111111112',
          expMonth: '12',
          expYear: '2030',
          cvc: '123',
        }),
      ).toThrow(DomainException);
    });

    it('assertValid_whenExpiryIsInvalid_throwsDomainException', () => {
      expect(() =>
        CardValidator.assertValid({
          number: '4111111111111111',
          expMonth: '13',
          expYear: '2030',
          cvc: '123',
        }),
      ).toThrow(DomainException);
    });
  });
});
