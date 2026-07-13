import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'uuid', name: 'correlation_id' })
  @Index('idx_audit_correlation_id')
  correlationId: string;

  @Column({ type: 'varchar', length: 50 })
  actor: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  @Index('idx_audit_entity')
  entityType: string;

  @Column({ type: 'uuid', name: 'entity_id' })
  entityId: string;

  @Column({ type: 'jsonb', name: 'old_value', nullable: true })
  oldValue: Record<string, unknown> | null;

  @Column({ type: 'jsonb', name: 'new_value', nullable: true })
  newValue: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 20 })
  result: 'SUCCESS' | 'FAILURE';

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
