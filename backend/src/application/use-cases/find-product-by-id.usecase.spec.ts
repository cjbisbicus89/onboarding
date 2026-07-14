import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { FindProductByIdUseCase } from './find-product-by-id.usecase';

class InMemoryProductRepository implements ProductRepositoryPort {
  private products: Map<string, Product> = new Map();

  setProducts(products: Product[]): void {
    this.products = new Map(products.map((p) => [p.id, p]));
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findByIdWithStockLock(): Promise<Product | null> {
    return null;
  }

  async save(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async updateStockInTransaction(): Promise<void> {}
}

describe('FindProductByIdUseCase', () => {
  const productId = '11111111-1111-1111-1111-111111111111';

  it('execute_whenProductExists_returnsProduct', async () => {
    const repository = new InMemoryProductRepository();
    const product = Product.create({
      id: productId,
      name: 'Product',
      description: 'Description',
      imageUrl: 'https://example.com/image.png',
      price: MoneyVO.fromCents(50_000, 'COP'),
      stock: 10,
    });
    repository.setProducts([product]);

    const useCase = new FindProductByIdUseCase(repository);
    const result = await useCase.execute(productId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(productId);
  });

  it('execute_whenProductDoesNotExist_returnsNull', async () => {
    const repository = new InMemoryProductRepository();
    const useCase = new FindProductByIdUseCase(repository);

    const result = await useCase.execute('unknown-id');

    expect(result).toBeNull();
  });
});
