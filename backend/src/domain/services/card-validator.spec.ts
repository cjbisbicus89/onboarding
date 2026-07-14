import { DomainException } from '../exceptions/domain.exception';
import { CardBrand } from '../../../../shared/enums/card-brand.enum';
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

  describe('sanitizeCardNumber', () => {
    it('sanitizeCardNumber_whenInputHasSpacesAndDashes_returnsOnlyDigits', () => {
      expect(CardValidator.sanitizeCardNumber('4111 1111-1111 1111')).toBe('4111111111111111');
    });
  });

  describe('isValidLength', () => {
    it('isValidLength_whenLengthIsBetween13And19_returnsTrue', () => {
      expect(CardValidator.isValidLength('4111111111111')).toBe(true);
    });

    it('isValidLength_whenLengthIsTooShort_returnsFalse', () => {
      expect(CardValidator.isValidLength('4111111111')).toBe(false);
    });
  });

  describe('detectCardBrand', () => {
    it('detectCardBrand_whenStartsWith4_returnsVisa', () => {
      expect(CardValidator.detectCardBrand('4111111111111111')).toBe('VISA');
    });

    it('detectCardBrand_whenStartsWithMasterPrefix_returnsMasterCard', () => {
      expect(CardValidator.detectCardBrand('5111111111111111')).toBe('MASTERCARD');
    });

    it('detectCardBrand_whenUnknownPrefix_returnsUnknown', () => {
      expect(CardValidator.detectCardBrand('9111111111111111')).toBe('UNKNOWN');
    });
  });

  describe('isValidCvc', () => {
    it('isValidCvc_when3Digits_returnsTrue', () => {
      expect(CardValidator.isValidCvc('123')).toBe(true);
    });

    it('isValidCvc_whenLetters_returnsFalse', () => {
      expect(CardValidator.isValidCvc('12a')).toBe(false);
    });
  });

  describe('validateCard', () => {
    it('validateCard_whenValid_returnsValidWithBrand', () => {
      const result = CardValidator.validateCard('4111111111111111');

      expect(result.isValid).toBe(true);
      expect(result.brand).toBe('VISA');
    });

    it('validateCard_whenInvalid_returnsInvalidWithError', () => {
      const result = CardValidator.validateCard('1234567890123456');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateExpiry', () => {
    it('validateExpiry_whenValid_returnsValid', () => {
      const futureYear = (new Date().getFullYear() + 1).toString().slice(-2);
      const result = CardValidator.validateExpiry(`12/${futureYear}`);

      expect(result.isValid).toBe(true);
    });

    it('validateExpiry_whenExpired_returnsInvalid', () => {
      const result = CardValidator.validateExpiry('01/20');

      expect(result.isValid).toBe(false);
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

    it('assertValid_whenCvcIsInvalid_throwsDomainException', () => {
      expect(() =>
        CardValidator.assertValid({
          number: '4111111111111111',
          expMonth: '12',
          expYear: '2030',
          cvc: '12',
        }),
      ).toThrow(DomainException);
    });

    it('assertValid_whenValidateCardReturnsNoErrorMessage_usesDefaultMessage', () => {
      jest.spyOn(CardValidator, 'validateCard').mockReturnValue({ isValid: false, brand: CardBrand.UNKNOWN });

      expect(() =>
        CardValidator.assertValid({
          number: '1234567890123456',
          expMonth: '12',
          expYear: '2030',
          cvc: '123',
        }),
      ).toThrow('Número de tarjeta inválido');
    });

    it('assertValid_whenValidateExpiryReturnsNoErrorMessage_usesDefaultMessage', () => {
      jest.spyOn(CardValidator, 'validateCard').mockReturnValue({ isValid: true, brand: CardBrand.VISA });
      jest.spyOn(CardValidator, 'validateExpiry').mockReturnValue({ isValid: false });

      expect(() =>
        CardValidator.assertValid({
          number: '4111111111111111',
          expMonth: '12',
          expYear: '2030',
          cvc: '123',
        }),
      ).toThrow('Fecha de expiración inválida');
    });
  });
});
