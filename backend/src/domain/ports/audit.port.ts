type AuditActor = 'system' | 'user' | 'payment-provider';
type AuditEntityType = 'transaction' | 'product' | 'customer';
type AuditResult = 'SUCCESS' | 'FAILURE';

export interface AuditEvent {
  correlationId: string;
  actor: AuditActor;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  result: AuditResult;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditPort {
  log(event: AuditEvent): Promise<void>;
  logTransactionCreated(
    transactionId: string,
    correlationId: string,
    metadata: Record<string, unknown>,
  ): Promise<void>;
  logStatusChanged(
    transactionId: string,
    correlationId: string,
    oldStatus: string,
    newStatus: string,
    actor: AuditActor,
  ): Promise<void>;
  logPaymentFailed(
    transactionId: string,
    correlationId: string,
    errorMessage: string,
  ): Promise<void>;
  logStockUpdated(
    productId: string,
    correlationId: string,
    oldStock: number,
    newStock: number,
  ): Promise<void>;
}
