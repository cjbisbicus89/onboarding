import { Module } from '@nestjs/common';
import { CorrelationIdContext } from './correlation-id.context';

@Module({
  providers: [
    { provide: CorrelationIdContext, useValue: CorrelationIdContext },
  ],
  exports: [CorrelationIdContext],
})
export class CorrelationModule {}
