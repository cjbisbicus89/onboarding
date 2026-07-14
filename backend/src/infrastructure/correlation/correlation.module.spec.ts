import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationModule } from './correlation.module';
import { CorrelationIdContext } from './correlation-id.context';

describe('CorrelationModule', () => {
  it('module_compilesAndProvidesCorrelationIdContext', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CorrelationModule],
    }).compile();

    const context = module.get(CorrelationIdContext);

    expect(context).toBeDefined();
  });
});
