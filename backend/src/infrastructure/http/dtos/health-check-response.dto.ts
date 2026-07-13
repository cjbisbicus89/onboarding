import { ApiProperty } from '@nestjs/swagger';

class HealthCheckServiceResultDto {
  @ApiProperty({
    description: 'Estado del servicio verificado',
    enum: ['UP', 'DOWN', 'UNKNOWN'],
    example: 'UP',
  })
  readonly status: 'UP' | 'DOWN' | 'UNKNOWN';

  @ApiProperty({
    description: 'Tiempo de respuesta en milisegundos',
    type: 'number',
    nullable: true,
    example: 48,
  })
  readonly responseTimeMs: number | null;

  @ApiProperty({
    description: 'Mensaje de error cuando el servicio está caído',
    nullable: true,
    required: false,
    example: 'Error al consultar el proveedor de pagos',
  })
  readonly error?: string;
}

class HealthCheckServicesDto {
  @ApiProperty({ type: HealthCheckServiceResultDto })
  readonly database: HealthCheckServiceResultDto;

  @ApiProperty({ type: HealthCheckServiceResultDto })
  readonly paymentProvider: HealthCheckServiceResultDto;

  @ApiProperty({ type: HealthCheckServiceResultDto })
  readonly storage: HealthCheckServiceResultDto;
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Estado general del sistema',
    enum: ['UP', 'DEGRADED', 'DOWN'],
    example: 'DEGRADED',
  })
  readonly status: 'UP' | 'DEGRADED' | 'DOWN';

  @ApiProperty({
    description: 'Marca de tiempo ISO 8601 del chequeo',
    example: '2026-07-11T21:14:47.336Z',
  })
  readonly timestamp: string;

  @ApiProperty({ type: HealthCheckServicesDto })
  readonly services: HealthCheckServicesDto;
}
