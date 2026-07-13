import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { CorrelationIdContext } from '../../correlation/correlation-id.context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      req.headers['correlation-id']?.toString() ?? randomUUID();

    req['correlationId'] = correlationId;
    res.setHeader('Correlation-ID', correlationId);

    CorrelationIdContext.run(correlationId, next);
  }
}
