import { maskSensitiveData } from './mask-sensitive-data.util';

describe('maskSensitiveData', () => {
  it('whenValueIsPrimitive_returnsValue', () => {
    expect(maskSensitiveData('plain')).toBe('plain');
    expect(maskSensitiveData(42)).toBe(42);
  });

  it('whenObjectContainsCardNumber_redactsValue', () => {
    const result = maskSensitiveData({ cardNumber: '4111111111111111' });

    expect(result).toEqual({ cardNumber: '***REDACTED***' });
  });

  it('whenObjectContainsProviderReference_partiallyMasksValue', () => {
    const result = maskSensitiveData({
      providerReference: 'tok_sec_1234567890',
    });

    expect(result).toEqual({
      providerReference: 'tok_sec_****7890',
    });
  });

  it('whenObjectContainsToken_partiallyMasksValue', () => {
    const result = maskSensitiveData({ token: 'tok_sec_1234567890' });

    expect(result).toEqual({ token: 'tok_sec_****7890' });
  });

  it('whenNestedObjectContainsSensitiveKey_redactsNestedValue', () => {
    const result = maskSensitiveData({
      payload: { cvc: '123' },
    });

    expect(result).toEqual({ payload: { cvc: '***REDACTED***' } });
  });

  it('whenArrayContainsSensitiveObjects_redactsEachElement', () => {
    const result = maskSensitiveData([{ number: '4111111111111111' }]);

    expect(result).toEqual([{ number: '***REDACTED***' }]);
  });
});
