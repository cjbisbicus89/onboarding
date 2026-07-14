import { QueryRunner } from 'typeorm';
import { InitialSchema1738000000000 } from './1738000000000-InitialSchema';
import { AuditLogs1738000000001 } from './1738000000001-AuditLogs';
import { SeedProducts1738000000002 } from './1738000000002-SeedProducts';
import { AddMoreSampleProducts1738000000003 } from './1738000000003-AddMoreSampleProducts';

describe('Migrations', () => {
  const createQueryRunner = (): QueryRunner => {
    return {
      query: jest.fn().mockResolvedValue(undefined),
    } as unknown as QueryRunner;
  };

  it('InitialSchema1738000000000 runs up and down', async () => {
    const queryRunner = createQueryRunner();
    const migration = new InitialSchema1738000000000();

    await migration.up(queryRunner);
    await migration.down(queryRunner);

    expect(queryRunner.query).toHaveBeenCalled();
  });

  it('AuditLogs1738000000001 runs up and down', async () => {
    const queryRunner = createQueryRunner();
    const migration = new AuditLogs1738000000001();

    await migration.up(queryRunner);
    await migration.down(queryRunner);

    expect(queryRunner.query).toHaveBeenCalled();
  });

  it('SeedProducts1738000000002 runs up and down', async () => {
    const queryRunner = createQueryRunner();
    const migration = new SeedProducts1738000000002();

    await migration.up(queryRunner);
    await migration.down(queryRunner);

    expect(queryRunner.query).toHaveBeenCalled();
  });

  it('AddMoreSampleProducts1738000000003 runs up and down', async () => {
    const queryRunner = createQueryRunner();
    const migration = new AddMoreSampleProducts1738000000003();

    await migration.up(queryRunner);
    await migration.down(queryRunner);

    expect(queryRunner.query).toHaveBeenCalled();
  });
});
