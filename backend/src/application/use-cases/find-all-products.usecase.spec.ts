import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { FindAllProductsUseCase } from './find-all-products.usecase';

class InMemoryProductRepository implements ProductRepositoryPort {
  private products: Product[] = [];

  setProducts(products: Product[]): void {
    this.products = products;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async findById(): Promise<Product | null> {
    return null;
  }

  async findByIdWithStockLock(): Promise<Product | null> {
    return null;
  }

  async save(product: Product): Promise<Product> {
    this.products.push(product);
    return product;
  }

  async updateStockInTransaction(): Promise<void> {}
}

describe('FindAllProductsUseCase', () => {
  it('execute_whenProductsExist_returnsAllProducts', async () => {
    const repository = new InMemoryProductRepository();
    const product = Product.create({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Product',
      description: 'Description',
      imageUrl: 'https://example.com/image.png',
      price: MoneyVO.fromCents(50_000, 'COP'),
      stock: 10,
    });
    repository.setProducts([product]);

    const useCase = new FindAllProductsUseCase(repository);
    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(product.id);
  });

  it('execute_whenNoProductsExist_returnsEmptyArray', async () => {
    const repository = new InMemoryProductRepository();
    const useCase = new FindAllProductsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
