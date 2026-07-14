import { corsConfig } from './cors.config';

describe('corsConfig', () => {
  const originCallback = corsConfig.origin as (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => void;

  it('whenOriginIsAllowedAndLocalhost_callsCallbackWithTrue', (done) => {
    const origin = 'http://localhost:3000';

    originCallback(origin, (error: Error | null, allow?: boolean) => {
      expect(error).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it('whenOriginIsAllowedButNotLocalhost_callsCallbackWithOrigin', (done) => {
    const origin = 'http://10.0.2.2:3000';

    originCallback(origin, (error: Error | null, allow?: boolean) => {
      expect(error).toBeNull();
      expect(allow).toBe(origin);
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

  it('whenDevelopmentMode_allowsAnyOrigin', (done) => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const origin = 'https://unknown.example.com';

    originCallback(origin, (error: Error | null, allow?: boolean) => {
      process.env.NODE_ENV = previous;
      expect(error).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it('whenOriginIsLocalhostNotInAllowedList_allowsRequest', (done) => {
    const origin = 'http://localhost:9999';

    originCallback(origin, (error: Error | null, allow?: boolean) => {
      expect(error).toBeNull();
      expect(allow).toBe(true);
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
