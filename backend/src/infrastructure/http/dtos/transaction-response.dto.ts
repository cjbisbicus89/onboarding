import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { TransactionItemResponse } from '@shared/dtos/transaction-item.interface';
import { TransactionResponse } from '@shared/dtos/transaction-response.interface';

export class TransactionItemResponseDto implements TransactionItemResponse {
  @ApiProperty({
    description: 'UUID v4 del producto',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  readonly productId: string;

  @ApiProperty({
    description: 'Cantidad comprada',
    example: 2,
  })
  readonly quantity: number;

  @ApiProperty({
    description: 'Precio unitario en centavos',
    example: 75000,
  })
  readonly unitPriceCentavos: number;
}

export class TransactionResponseDto implements TransactionResponse {
  @ApiProperty({
    description: 'UUID v4 de la transacción',
    format: 'uuid',
    example: 'txn-a1b2-c3d4-e5f6-7890',
  })
  readonly transactionId: string;

  @ApiProperty({
    description: 'Estado actual de la transacción',
    enum: TransactionStatus,
    example: TransactionStatus.APPROVED,
  })
  readonly status: TransactionStatus;

  @ApiProperty({
    description: 'Monto total pagado en centavos',
    example: 150000,
  })
  readonly totalAmountCentavos: number;

  @ApiProperty({
    description: 'Moneda en formato ISO 4217',
    example: 'COP',
  })
  readonly currency: string;

  @ApiProperty({
    description: 'Comercio/procesador asignado',
    example: 'payment_provider_id_placeholder',
  })
  readonly assignedTo: string;

  @ApiProperty({
    description: 'Referencia externa del proveedor de pagos',
    type: 'string',
    nullable: true,
    example: 'ref-123456789',
  })
  readonly providerReference: string | null;

  @ApiProperty({
    description: 'Fecha de creación ISO 8601',
    example: '2026-07-11T21:14:47.336Z',
  })
  readonly createdAt: string;

  @ApiProperty({
    description: 'Productos incluidos en la transacción',
    type: [TransactionItemResponseDto],
  })
  readonly items: TransactionItemResponseDto[];
}
