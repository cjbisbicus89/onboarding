import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'UUID v4 del producto',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Camiseta Algodón',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Camiseta de algodón 100% orgánico',
  })
  readonly description: string;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://example.com/images/shirt.jpg',
  })
  readonly imageUrl: string;

  @ApiProperty({
    description: 'Precio en centavos',
    example: 45000,
  })
  readonly priceAmount: number;

  @ApiProperty({
    description: 'Moneda',
    example: 'COP',
  })
  readonly currency: string;

  @ApiProperty({
    description: 'Stock disponible',
    example: 100,
  })
  readonly stock: number;
}
