import { Request, Response } from 'express';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { CorrelationIdContext } from '../../correlation/correlation-id.context';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('use_whenHeaderIsPresent_propagatesCorrelationId', (done) => {
    const correlationId = '11111111-1111-4111-a111-111111111111';
    const req = {
      headers: { 'correlation-id': correlationId },
    } as unknown as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;

    middleware.use(req, res, () => {
      expect(CorrelationIdContext.get()).toBe(correlationId);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Correlation-ID',
        correlationId,
      );
      done();
    });
  });

  it('use_whenHeaderIsMissing_generatesNewCorrelationId', (done) => {
    const req = { headers: {} } as unknown as Request;
    const res = {
      setHeader: jest.fn(),
    } as unknown as Response;

    middleware.use(req, res, () => {
      const generated = CorrelationIdContext.get();
      expect(generated).toBeDefined();
      expect(generated).toHaveLength(36);
      expect(res.setHeader).toHaveBeenCalledWith('Correlation-ID', generated);
      done();
    });
  });
});
