import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { CorrelationIdContext } from '../../../correlation/correlation-id.context';
import { TypeormUnitOfWork } from './typeorm-unit-of-work';

describe('TypeormUnitOfWork', () => {
  const createQueryRunner = (overrides: Partial<QueryRunner> = {}): QueryRunner => {
    return {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue(undefined),
      manager: {} as EntityManager,
      ...overrides,
    } as unknown as QueryRunner;
  };

  const createDataSource = (queryRunner: QueryRunner): DataSource => {
    return {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as DataSource;
  };

  it('runInTransaction_commitsAndReturnsResult', async () => {
    const queryRunner = createQueryRunner();
    const dataSource = createDataSource(queryRunner);
    const unitOfWork = new TypeormUnitOfWork(dataSource);

    const work = jest.fn().mockResolvedValue('result');
    const result = await unitOfWork.runInTransaction(work);

    expect(result).toBe('result');
    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
    expect(work).toHaveBeenCalled();
  });

  it('runInTransaction_whenCorrelationIdExists_setsApplicationName', async () => {
    const queryRunner = createQueryRunner();
    const dataSource = createDataSource(queryRunner);
    const unitOfWork = new TypeormUnitOfWork(dataSource);

    CorrelationIdContext.run('corr-123', async () => {
      await unitOfWork.runInTransaction(async () => 'ok');
    });

    await CorrelationIdContext.run('corr-123', async () => {
      await unitOfWork.runInTransaction(async () => 'ok');
    });

    expect(queryRunner.query).toHaveBeenCalledWith("SET LOCAL application_name = 'corr-123'");
  });

  it('runInTransaction_whenWorkFails_rollsBackAndReleases', async () => {
    const queryRunner = createQueryRunner();
    const dataSource = createDataSource(queryRunner);
    const unitOfWork = new TypeormUnitOfWork(dataSource);

    await expect(
      unitOfWork.runInTransaction(async () => {
        throw new Error('transaction failed');
      }),
    ).rejects.toThrow('transaction failed');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });
});
