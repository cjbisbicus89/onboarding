import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProcessCheckoutCommand } from '../../../application/dtos/process-checkout-command.dto';
import { ProcessCheckoutUseCase } from '../../../application/use-cases/process-checkout.usecase';
import { CheckoutRequestDto } from '../dtos/checkout-request.dto';
import { CheckoutResponseDto } from '../dtos/checkout-response.dto';
import { TransactionMapper } from '../../adapters/persistence/typeorm/mappers/transaction.mapper';

@ApiTags('checkout')
@Controller('api/v1/checkout')
export class CheckoutController {
  constructor(
    private readonly processCheckoutUseCase: ProcessCheckoutUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Process a credit card checkout' })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiHeader({ name: 'Correlation-ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Transaction processed',
    type: CheckoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  @ApiResponse({ status: 500, description: 'Payment gateway error' })
  @HttpCode(200)
  async checkout(
    @Body() dto: CheckoutRequestDto,
    @Headers('Idempotency-Key') idempotencyKey: string,
    @Headers('Correlation-ID') correlationId: string,
  ): Promise<CheckoutResponseDto> {
    this.assertHeaderPresent('Idempotency-Key', idempotencyKey);
    this.assertHeaderPresent('Correlation-ID', correlationId);

    const command = this.toCommand(dto, idempotencyKey, correlationId);
    const transaction = await this.processCheckoutUseCase.execute(command);
    return TransactionMapper.toResponseDto(transaction);
  }

  private assertHeaderPresent(name: string, value: string | undefined): void {
    if (value === undefined || value.trim().length === 0) {
      throw new BadRequestException(`El encabezado '${name}' es obligatorio`);
    }

    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(value)) {
      throw new BadRequestException(
        `El encabezado '${name}' debe ser un UUID v4 válido`,
      );
    }
  }

  private toCommand(
    dto: CheckoutRequestDto,
    idempotencyKey: string,
    correlationId: string,
  ): ProcessCheckoutCommand {
    return new ProcessCheckoutCommand(
      dto.customer.email,
      dto.customer.fullName,
      dto.items,
      {
        number: dto.paymentMethod.cardNumber,
        cvc: dto.paymentMethod.cvc,
        expMonth: dto.paymentMethod.expMonth,
        expYear: dto.paymentMethod.expYear,
        cardHolder: dto.paymentMethod.holderName,
      },
      idempotencyKey,
      correlationId,
    );
  }
}
