import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DomainException } from '../../../../../domain/exceptions/domain.exception';
import { InsufficientStockException } from '../../../../../domain/exceptions/insufficient-stock.exception';
import { Product } from '../../../../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../../../domain/ports/product-repository.port';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductTypeormRepository implements ProductRepositoryPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly manager?: EntityManager,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const orm = await this.getManager().findOneBy(ProductOrmEntity, { id });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Product[]> {
    const orms = await this.getManager().find(ProductOrmEntity);
    return orms.map((orm) => ProductMapper.toDomain(orm));
  }

  async findByIdWithStockLock(id: string): Promise<Product | null> {
    const orm = await this.getManager().findOne(ProductOrmEntity, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async save(product: Product): Promise<Product> {
    const orm = ProductMapper.toOrm(product);
    const saved = await this.getManager().save(ProductOrmEntity, orm);
    return ProductMapper.toDomain(saved);
  }

  async updateStockInTransaction(
    updates: Array<{ productId: string; newStock: number }>,
  ): Promise<void> {
    const manager = this.getManager();

    for (const update of updates) {
      // Pessimistic lock + atomic read of current stock within the transaction.
      // The caller must have computed newStock under the same lock (via findByIdWithStockLock
      // or equivalent) to prevent overselling race conditions.
      const result = await manager.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [update.productId],
      );

      const currentStock = result[0]?.stock;
      if (currentStock === undefined) {
        throw new DomainException(
          `No se encontró el producto ${update.productId}`,
        );
      }

      if (update.newStock < 0 || update.newStock > currentStock) {
        throw new InsufficientStockException(update.productId);
      }

      await manager.query('UPDATE products SET stock = $1 WHERE id = $2', [
        update.newStock,
        update.productId,
      ]);
    }
  }

  async restoreStockInTransaction(
    updates: Array<{ productId: string; newStock: number }>,
  ): Promise<void> {
    const manager = this.getManager();

    for (const update of updates) {
      // Pessimistic lock + atomic read of current stock within the transaction.
      // newStock must be >= currentStock because we are restoring units.
      const result = await manager.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [update.productId],
      );

      const currentStock = result[0]?.stock;
      if (currentStock === undefined) {
        throw new DomainException(
          `No se encontró el producto ${update.productId}`,
        );
      }

      if (update.newStock < 0 || update.newStock < currentStock) {
        throw new InsufficientStockException(update.productId);
      }

      await manager.query('UPDATE products SET stock = $1 WHERE id = $2', [
        update.newStock,
        update.productId,
      ]);
    }
  }

  private getManager(): EntityManager {
    return this.manager ?? this.dataSource.manager;
  }
}
