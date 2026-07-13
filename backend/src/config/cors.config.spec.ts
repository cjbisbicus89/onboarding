import { corsConfig } from './cors.config';

describe('corsConfig', () => {
  const originCallback = corsConfig.origin as (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => void;

  it('whenOriginIsAllowed_callsCallbackWithTrue', (done) => {
    const origin = 'http://localhost:3000';

    originCallback(origin, (error: Error | null, allow?: boolean) => {
      expect(error).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it('whenOriginIsNotAllowed_callsCallbackWithError', (done) => {
    const origin = 'https://unknown.example.com';

    originCallback(origin, (error: Error | null) => {
      expect(error).toBeInstanceOf(Error);
      done();
    });
  });

  it('whenOriginIsUndefined_allowsRequest', (done) => {
    originCallback(undefined, (error: Error | null, allow?: boolean) => {
      expect(error).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it('includesRequiredHeaders', () => {
    expect(corsConfig.allowedHeaders).toContain('Idempotency-Key');
    expect(corsConfig.allowedHeaders).toContain('Correlation-ID');
  });
});
