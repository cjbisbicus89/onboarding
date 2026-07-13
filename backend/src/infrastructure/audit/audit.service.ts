import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogOrmEntity } from '../adapters/persistence/typeorm/entities/audit-log.orm-entity';
import { AuditEvent, AuditPort } from '../../domain/ports/audit.port';

@Injectable()
export class AuditService implements AuditPort {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly auditRepository: Repository<AuditLogOrmEntity>,
  ) {}

  async log(event: AuditEvent): Promise<void> {
    const auditLog = this.auditRepository.create({
      correlationId: event.correlationId,
      actor: event.actor,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      oldValue: event.oldValue,
      newValue: event.newValue,
      result: event.result,
      errorMessage: event.errorMessage,
      metadata: event.metadata,
    });

    await this.auditRepository.save(auditLog);
  }

  async logTransactionCreated(
    transactionId: string,
    correlationId: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      correlationId,
      actor: 'user',
      action: 'transaction_created',
      entityType: 'transaction',
      entityId: transactionId,
      newValue: { status: 'PENDING' },
      result: 'SUCCESS',
      metadata,
    });
  }

  async logStatusChanged(
    transactionId: string,
    correlationId: string,
    oldStatus: string,
    newStatus: string,
    actor: AuditEvent['actor'],
  ): Promise<void> {
    await this.log({
      correlationId,
      actor,
      action: 'status_changed',
      entityType: 'transaction',
      entityId: transactionId,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      result: 'SUCCESS',
    });
  }

  async logPaymentFailed(
    transactionId: string,
    correlationId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.log({
      correlationId,
      actor: 'system',
      action: 'payment_failed',
      entityType: 'transaction',
      entityId: transactionId,
      result: 'FAILURE',
      errorMessage,
    });
  }

  async logStockUpdated(
    productId: string,
    correlationId: string,
    oldStock: number,
    newStock: number,
  ): Promise<void> {
    await this.log({
      correlationId,
      actor: 'system',
      action: 'stock_updated',
      entityType: 'product',
      entityId: productId,
      oldValue: { stock: oldStock },
      newValue: { stock: newStock },
      result: 'SUCCESS',
    });
  }
}
