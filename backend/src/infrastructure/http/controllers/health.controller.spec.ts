import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService, HealthCheckSummary } from '../../health/health.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  it('check_whenSystemIsUp_returnsSummary', async () => {
    const summary: HealthCheckSummary = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'UP', responseTimeMs: 12 },
        paymentProvider: { status: 'UP', responseTimeMs: 45 },
        storage: { status: 'UP', responseTimeMs: 3 },
      },
    };
    jest.spyOn(healthService, 'check').mockResolvedValue(summary);

    const result = await controller.check();
    expect(result).toEqual(summary);
  });

  it('check_whenSystemIsDown_throwsHttpException', async () => {
    const summary: HealthCheckSummary = {
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'DOWN', responseTimeMs: null, error: 'db down' },
        paymentProvider: { status: 'UNKNOWN', responseTimeMs: null },
        storage: { status: 'DOWN', responseTimeMs: null, error: 'storage down' },
      },
    };
    jest.spyOn(healthService, 'check').mockResolvedValue(summary);

    await expect(controller.check()).rejects.toThrow(
      new HttpException(summary, HttpStatus.SERVICE_UNAVAILABLE),
    );
  });
});
