import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from './logging.module';
import { StructuredLogger } from './structured-logger.service';

describe('LoggingModule', () => {
  it('module_compilesAndProvidesStructuredLogger', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, validate: () => ({}) as any }), LoggingModule],
    }).compile();

    const logger = module.get(StructuredLogger);

    expect(logger).toBeDefined();
  });
});
