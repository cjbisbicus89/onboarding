import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { CheckoutResponse } from '@shared/dtos/checkout-response.interface';

export class CheckoutResponseDto implements CheckoutResponse {
  @ApiProperty({
    description: 'UUID v4 de la transacción generada',
    format: 'uuid',
    example: 'txn-a1b2-c3d4-e5f6-7890',
  })
  readonly transactionId: string;

  @ApiProperty({
    description: 'Estado final del procesamiento del pago',
    enum: TransactionStatus,
    example: TransactionStatus.APPROVED,
  })
  readonly status: TransactionStatus;

  @ApiProperty({
    description: 'Monto total de la transacción en centavos',
    example: 150000,
  })
  readonly totalAmountCentavos: number;

  @ApiProperty({
    description: 'Moneda en formato ISO 4217',
    example: 'COP',
  })
  readonly currency: string;

  @ApiProperty({
    description: 'Identificador del comercio/procesador asignado',
    example: 'payment_provider_id_placeholder',
  })
  readonly assignedTo: string;

  @ApiProperty({
    description: 'Fecha y hora ISO 8601 de la transacción',
    example: '2026-07-11T21:14:47.336Z',
  })
  readonly timestamp: string;

  @ApiProperty({
    description: 'Razón del rechazo si el pago fue declinado',
    example: 'Fondos insuficientes',
    required: false,
  })
  readonly errorReason?: string;
}
