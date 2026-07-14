import { ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { RateLimitingMiddleware } from './rate-limiting.middleware';

describe('RateLimitingMiddleware', () => {
  let middleware: RateLimitingMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new RateLimitingMiddleware();
    res = {};
    next = jest.fn();
  });

  const createRequest = (ip?: string): Partial<Request> =>
    Object.assign({}, { ip } as Partial<Request>);

  it('use_whenRequestsAreWithinLimit_callsNext', () => {
    req = createRequest('127.0.0.1');

    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }

    expect(next).toHaveBeenCalledTimes(10);
  });

  it('use_whenMinuteLimitIsExceeded_throwsForbiddenException', () => {
    req = createRequest();

    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }

    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
      ForbiddenException,
    );
  });

  it('use_whenHourLimitIsExceeded_throwsForbiddenException', () => {
    let now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    req = createRequest();

    for (let batch = 0; batch < 5; batch++) {
      for (let i = 0; i < 10; i++) {
        middleware.use(req as Request, res as Response, next);
      }
      now += 61_000;
    }

    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
      ForbiddenException,
    );

    jest.restoreAllMocks();
  });

  it('use_whenIpIsMissing_usesUnknownIdentifier', () => {
    req = createRequest(undefined);

    middleware.use(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('use_whenDayLimitIsExceeded_throwsForbiddenException', () => {
    let now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    req = createRequest();

    for (let batch = 0; batch < 10; batch++) {
      for (let i = 0; i < 10; i++) {
        middleware.use(req as Request, res as Response, next);
      }
      now += 3_600_001;
    }

    expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
      ForbiddenException,
    );

    jest.restoreAllMocks();
  });
});
