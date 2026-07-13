import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HealthService } from './health.service';

jest.mock('typeorm', () => ({
  DataSource: class {},
}));

jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

const { DataSource } = jest.requireMock('typeorm') as { DataSource: unknown };

describe('HealthService', () => {
  let service: HealthService;
  let httpService: { get: jest.Mock };
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    dataSource = { query: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: DataSource as never,
          useValue: dataSource,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () => 'https://example.com',
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('check_whenDependenciesAreHealthy_returnsUp', async () => {
    httpService.get.mockReturnValue(of({ data: {} }));
    dataSource.query.mockResolvedValue([{ now: new Date() }]);

    const result = await service.check();

    expect(result.status).toBe('UP');
  });

  it('check_whenDatabaseIsDown_returnsDown', async () => {
    httpService.get.mockReturnValue(of({ data: {} }));
    dataSource.query.mockRejectedValue(new Error('DB error'));

    const result = await service.check();

    expect(result.status).toBe('DOWN');
  });

  it('check_whenPaymentProviderIsDown_returnsDegraded', async () => {
    httpService.get.mockReturnValue(throwError(() => new Error('Timeout')));
    dataSource.query.mockResolvedValue([{ now: new Date() }]);

    const result = await service.check();

    expect(result.status).toBe('DEGRADED');
  });
});
