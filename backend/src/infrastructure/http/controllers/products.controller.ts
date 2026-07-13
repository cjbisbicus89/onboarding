import { Controller, Get, Param, ParseUUIDPipe, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { FindAllProductsUseCase } from '../../../application/use-cases/find-all-products.usecase';
import { FindProductByIdUseCase } from '../../../application/use-cases/find-product-by-id.usecase';
import { ProductResponseDto } from '../dtos/product-response.dto';

@ApiTags('products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductResponseDto],
  })
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.findAllProductsUseCase.execute();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      priceAmount: product.price.toCents(),
      currency: product.price.currency,
      stock: product.stock,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () =>
          new BadRequestException('El ID del producto debe ser un UUID v4 válido'),
      }),
    )
    id: string,
  ): Promise<ProductResponseDto> {
    const product = await this.findProductByIdUseCase.execute(id);
    if (!product) {
      throw new NotFoundException(`No se encontró el producto con ID '${id}'`);
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      priceAmount: product.price.toCents(),
      currency: product.price.currency,
      stock: product.stock,
    };
  }
}
