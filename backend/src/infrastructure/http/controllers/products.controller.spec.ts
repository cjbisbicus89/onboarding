import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { FindAllProductsUseCase } from '../../../application/use-cases/find-all-products.usecase';
import { FindProductByIdUseCase } from '../../../application/use-cases/find-product-by-id.usecase';
import { Product } from '../../../domain/entities/product.entity';
import { MoneyVO } from '../../../domain/value-objects/money.vo';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let findAllUseCase: FindAllProductsUseCase;
  let findByIdUseCase: FindProductByIdUseCase;

  const mockProduct = Product.create({
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Product 1',
    description: 'Description 1',
    imageUrl: 'image1.png',
    price: MoneyVO.fromCents(1000, 'COP'),
    stock: 10,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: FindAllProductsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindProductByIdUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    findAllUseCase = module.get<FindAllProductsUseCase>(FindAllProductsUseCase);
    findByIdUseCase = module.get<FindProductByIdUseCase>(FindProductByIdUseCase);
  });

  it('findAll_returnsAllProductsAsDtos', async () => {
    jest.spyOn(findAllUseCase, 'execute').mockResolvedValue([mockProduct]);

    const result = await controller.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(mockProduct.id);
  });

  it('findOne_whenProductExists_returnsProductDto', async () => {
    jest.spyOn(findByIdUseCase, 'execute').mockResolvedValue(mockProduct);

    const result = await controller.findOne(mockProduct.id);
    expect(result.id).toBe(mockProduct.id);
  });

  it('findOne_whenProductDoesNotExist_throwsNotFoundException', async () => {
    jest.spyOn(findByIdUseCase, 'execute').mockResolvedValue(null);

    await expect(controller.findOne('11111111-1111-1111-1111-111111111111')).rejects.toThrow(
      NotFoundException,
    );
  });
});
