import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLogOrmEntity } from '../adapters/persistence/typeorm/entities/audit-log.orm-entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue({}),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLogOrmEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('logTransactionCreated_callsRepositorySave', async () => {
    await service.logTransactionCreated('tx-1', 'corr-1', { foo: 'bar' });

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 'tx-1',
        correlationId: 'corr-1',
        action: 'transaction_created',
      }),
    );
  });

  it('logStatusChanged_callsRepositorySave', async () => {
    await service.logStatusChanged(
      'tx-1',
      'corr-1',
      'PENDING',
      'APPROVED',
      'system',
    );

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'corr-1',
        actor: 'system',
        action: 'status_changed',
        entityId: 'tx-1',
        oldValue: { status: 'PENDING' },
        newValue: { status: 'APPROVED' },
      }),
    );
  });

  it('logPaymentFailed_callsRepositorySave', async () => {
    await service.logPaymentFailed('tx-1', 'corr-1', 'Timeout');

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'corr-1',
        actor: 'system',
        action: 'payment_failed',
        entityId: 'tx-1',
        result: 'FAILURE',
        errorMessage: 'Timeout',
      }),
    );
  });
});
