import { DataSource, EntityManager } from 'typeorm';
import { Product } from '../../../../../domain/entities/product.entity';
import { InsufficientStockException } from '../../../../../domain/exceptions/insufficient-stock.exception';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { ProductTypeormRepository } from './product-typeorm.repository';
import { ProductOrmEntity } from '../entities/product.orm-entity';

describe('ProductTypeormRepository', () => {
  const productId = '11111111-1111-1111-1111-111111111111';

  const createOrm = (overrides: Partial<ProductOrmEntity> = {}): ProductOrmEntity => {
    const orm = new ProductOrmEntity();
    orm.id = productId;
    orm.name = 'Product';
    orm.description = 'Description';
    orm.imageUrl = 'https://example.com/image.png';
    orm.priceCents = 50_000;
    orm.currency = 'COP';
    orm.stock = 10;
    Object.assign(orm, overrides);
    return orm;
  };

  const createManager = (overrides: Partial<EntityManager> = {}): EntityManager => {
    return {
      findOneBy: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      query: jest.fn(),
      ...overrides,
    } as unknown as EntityManager;
  };

  it('findById_whenProductExists_returnsMappedProduct', async () => {
    const manager = createManager({
      findOneBy: jest.fn().mockResolvedValue(createOrm()),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findById(productId);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(productId);
    expect(manager.findOneBy).toHaveBeenCalledWith(ProductOrmEntity, { id: productId });
  });

  it('findById_whenProductDoesNotExist_returnsNull', async () => {
    const manager = createManager({ findOneBy: jest.fn().mockResolvedValue(null) });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findById(productId);

    expect(result).toBeNull();
  });

  it('findAll_returnsMappedProducts', async () => {
    const manager = createManager({
      find: jest.fn().mockResolvedValue([createOrm({ id: productId, name: 'A' })]),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('A');
  });

  it('findByIdWithStockLock_returnsMappedProduct', async () => {
    const manager = createManager({
      findOne: jest.fn().mockResolvedValue(createOrm()),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findByIdWithStockLock(productId);

    expect(result).not.toBeNull();
    expect(manager.findOne).toHaveBeenCalledWith(ProductOrmEntity, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });
  });

  it('findByIdWithStockLock_whenProductDoesNotExist_returnsNull', async () => {
    const manager = createManager({ findOne: jest.fn().mockResolvedValue(null) });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.findByIdWithStockLock(productId);

    expect(result).toBeNull();
  });

  it('save_persistsAndReturnsMappedProduct', async () => {
    const product = Product.create({
      name: 'Product',
      description: 'Description',
      imageUrl: 'https://example.com/image.png',
      price: MoneyVO.fromCents(50_000, 'COP'),
      stock: 10,
    });
    const manager = createManager({
      save: jest.fn().mockResolvedValue(createOrm({ id: productId })),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    const result = await repo.save(product);

    expect(result.id).toBe(productId);
    expect(manager.save).toHaveBeenCalledWith(ProductOrmEntity, expect.any(ProductOrmEntity));
  });

  it('updateStockInTransaction_whenStockIsSufficient_updatesStock', async () => {
    const manager = createManager({
      query: jest.fn().mockResolvedValueOnce([{ stock: 10 }]).mockResolvedValueOnce([]),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    await repo.updateStockInTransaction([{ productId, newStock: 7 }]);

    expect(manager.query).toHaveBeenCalledWith(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [productId],
    );
    expect(manager.query).toHaveBeenCalledWith(
      'UPDATE products SET stock = $1 WHERE id = $2',
      [7, productId],
    );
  });

  it('updateStockInTransaction_whenProductMissing_throwsDomainException', async () => {
    const manager = createManager({ query: jest.fn().mockResolvedValue([]) });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    await expect(repo.updateStockInTransaction([{ productId, newStock: 7 }])).rejects.toThrow(
      'No se encontró el producto',
    );
  });

  it('updateStockInTransaction_whenNewStockExceedsCurrent_throwsInsufficientStockException', async () => {
    const manager = createManager({
      query: jest.fn().mockResolvedValue([{ stock: 5 }]),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    await expect(repo.updateStockInTransaction([{ productId, newStock: 7 }])).rejects.toThrow(
      InsufficientStockException,
    );
  });

  it('updateStockInTransaction_whenNewStockIsNegative_throwsInsufficientStockException', async () => {
    const manager = createManager({
      query: jest.fn().mockResolvedValue([{ stock: 10 }]),
    });
    const repo = new ProductTypeormRepository({ manager } as unknown as DataSource, manager);

    await expect(repo.updateStockInTransaction([{ productId, newStock: -1 }])).rejects.toThrow(
      InsufficientStockException,
    );
  });

  it('fallsBackToDataSourceManager_whenNoManagerProvided', async () => {
    const manager = createManager({
      findOneBy: jest.fn().mockResolvedValue(createOrm()),
    });
    const dataSource = { manager } as unknown as DataSource;
    const repo = new ProductTypeormRepository(dataSource);

    const result = await repo.findById(productId);

    expect(result).not.toBeNull();
    expect(manager.findOneBy).toHaveBeenCalled();
  });
});
