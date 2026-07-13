import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from '../adapters/persistence/typeorm/entities/audit-log.orm-entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity])],
  providers: [
    AuditService,
    { provide: 'AuditPort', useExisting: AuditService },
  ],
  exports: ['AuditPort'],
})
export class AuditModule {}
