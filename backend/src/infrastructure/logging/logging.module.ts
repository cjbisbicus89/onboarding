import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredLogger } from './structured-logger.service';

@Global()
@Module({
  providers: [
    {
      provide: StructuredLogger,
      useFactory: (configService: ConfigService) =>
        new StructuredLogger(configService.get<string>('NODE_ENV')),
      inject: [ConfigService],
    },
  ],
  exports: [StructuredLogger],
})
export class LoggingModule {}
