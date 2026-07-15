import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByIdWithStockLock(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  updateStockInTransaction(
    updates: Array<{ productId: string; newStock: number }>,
  ): Promise<void>;
  restoreStockInTransaction(
    updates: Array<{ productId: string; newStock: number }>,
  ): Promise<void>;
}
