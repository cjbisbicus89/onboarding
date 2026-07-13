import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CheckoutRequest } from '@shared/interfaces/checkout-request.interface';

export class CheckoutItemDto {
  @ApiProperty({
    description: 'UUID v4 del producto a comprar',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID v4 válido' })
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    minimum: 1,
    example: 2,
  })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;
}

export class CustomerDto {
  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre completo debe ser un texto' })
  fullName: string;
}

export class PaymentMethodDto {
  @ApiProperty({
    description: 'Número de tarjeta sin espacios ni guiones',
    example: '4111111111111111',
  })
  @IsString({ message: 'El número de tarjeta debe ser un texto' })
  @Length(13, 19, {
    message: 'El número de tarjeta debe tener entre 13 y 19 caracteres',
  })
  @Matches(/^\d{13,19}$/, {
    message:
      'El número de tarjeta debe contener entre 13 y 19 dígitos numéricos',
  })
  cardNumber: string;

  @ApiProperty({
    description: 'Mes de expiración (dos dígitos)',
    example: '12',
  })
  @IsString({ message: 'El mes de expiración debe ser un texto' })
  expMonth: string;

  @ApiProperty({
    description: 'Año de expiración (dos o cuatro dígitos)',
    example: '2030',
  })
  @IsString({ message: 'El año de expiración debe ser un texto' })
  expYear: string;

  @ApiProperty({
    description: 'Código de seguridad de la tarjeta',
    example: '123',
  })
  @IsString({ message: 'El código de seguridad debe ser un texto' })
  @Length(3, 4, {
    message: 'El código de seguridad debe tener entre 3 y 4 caracteres',
  })
  cvc: string;

  @ApiProperty({
    description: 'Nombre del titular tal como aparece en la tarjeta',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre del titular debe ser un texto' })
  holderName: string;
}

export class CheckoutRequestDto implements CheckoutRequest {
  @ApiProperty({
    description: 'Lista de productos a comprar',
    type: [CheckoutItemDto],
  })
  @IsArray({ message: 'Los ítems deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  readonly items: CheckoutItemDto[];

  @ApiProperty({
    description: 'Datos del cliente',
    type: CustomerDto,
  })
  @ValidateNested()
  @Type(() => CustomerDto)
  readonly customer: CustomerDto;

  @ApiProperty({
    description: 'Datos del método de pago',
    type: PaymentMethodDto,
  })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  readonly paymentMethod: PaymentMethodDto;
}
