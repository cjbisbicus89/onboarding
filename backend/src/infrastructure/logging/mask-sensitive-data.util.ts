const SENSITIVE_KEYS = new Set([
  'cardNumber',
  'number',
  'cvc',
  'cvv',
  'token',
  'password',
  'providerReference',
  'paymentProviderPrivateKey',
  'paymentProviderIntegritySecret',
  'PAYMENT_PROVIDER_PRIVATE_KEY',
  'PAYMENT_PROVIDER_INTEGRITY_SECRET',
  'PAYMENT_PROVIDER_EVENTS_KEY',
]);

const PARTIALLY_MASKED_KEYS = new Set(['providerReference', 'token']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function maskValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;

  const text = typeof value === 'string' ? value : String(value);

  if (PARTIALLY_MASKED_KEYS.has(key) && text.length >= 4) {
    const prefixLength = Math.min(8, text.length - 4);
    return `${text.substring(0, prefixLength)}****${text.substring(text.length - 4)}`;
  }

  return '***REDACTED***';
}

export function maskSensitiveData(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(maskSensitiveData);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        SENSITIVE_KEYS.has(key) ? maskValue(key, val) : maskSensitiveData(val),
      ]),
    );
  }

  return value;
}
