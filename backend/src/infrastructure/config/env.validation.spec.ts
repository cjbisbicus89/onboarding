import 'reflect-metadata';
import { validate } from './env.validation';

describe('env.validation', () => {
  const validEnv = {
    PORT: '3000',
    DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
    PAYMENT_PROVIDER_BASE_URL: 'https://api.example.com',
    PAYMENT_PROVIDER_PUBLIC_KEY: 'pub-key',
    PAYMENT_PROVIDER_PRIVATE_KEY: 'prv-key',
    PAYMENT_PROVIDER_INTEGRITY_SECRET: 'integrity-secret',
    PAYMENT_PROVIDER_EVENTS_KEY: 'events-key',
  };

  it('validate_whenEnvironmentIsValid_returnsValidatedConfig', () => {
    const result = validate(validEnv);

    expect(result.PORT).toBe(3000);
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(result.PAYMENT_PROVIDER_MERCHANT_ID).toBe(validEnv.PAYMENT_PROVIDER_PUBLIC_KEY);
  });

  it('validate_whenMerchantIdIsProvided_usesProvidedValue', () => {
    const result = validate({ ...validEnv, PAYMENT_PROVIDER_MERCHANT_ID: 'merchant-123' });

    expect(result.PAYMENT_PROVIDER_MERCHANT_ID).toBe('merchant-123');
  });

  it('validate_whenPortIsMissing_defaultsTo3000', () => {
    const { PORT, ...envWithoutPort } = validEnv;

    const result = validate(envWithoutPort);

    expect(result.PORT).toBe(3000);
  });

  it('validate_whenRequiredUrlIsInvalid_throwsError', () => {
    const invalidEnv = { ...validEnv, PAYMENT_PROVIDER_BASE_URL: 'not-a-url' };

    expect(() => validate(invalidEnv)).toThrow();
  });

  it('validate_whenRequiredSecretIsMissing_throwsError', () => {
    const invalidEnv = { ...validEnv, PAYMENT_PROVIDER_PRIVATE_KEY: undefined };

    expect(() => validate(invalidEnv)).toThrow();
  });
});
