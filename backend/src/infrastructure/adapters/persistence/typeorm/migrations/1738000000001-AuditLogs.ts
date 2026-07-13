import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogs1738000000001 implements MigrationInterface {
  name = 'AuditLogs1738000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        correlation_id UUID NOT NULL,
        actor VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        old_value JSONB,
        new_value JSONB,
        result VARCHAR(20) NOT NULL,
        error_message TEXT,
        metadata JSONB
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_audit_correlation_id ON audit_logs(correlation_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);
  }
}
