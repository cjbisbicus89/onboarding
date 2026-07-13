import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindTransactionByIdUseCase } from '../../../application/use-cases/find-transaction-by-id.usecase';
import { TransactionMapper } from '../../adapters/persistence/typeorm/mappers/transaction.mapper';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';

@ApiTags('transactions')
@Controller('api/v1/transactions')
export class TransactionsController {
  constructor(
    private readonly findTransactionByIdUseCase: FindTransactionByIdUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a transaction by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findById(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () =>
          new BadRequestException(
            'El ID de la transacción debe ser un UUID v4 válido',
          ),
      }),
    )
    id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.findTransactionByIdUseCase.execute(id);

    if (!transaction) {
      throw new NotFoundException(
        `No se encontró la transacción con ID '${id}'`,
      );
    }

    return TransactionMapper.toTransactionResponseDto(transaction);
  }
}
