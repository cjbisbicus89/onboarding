import { Product } from '../../../../../domain/entities/product.entity';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { ProductOrmEntity } from '../entities/product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return Product.create({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      imageUrl: orm.imageUrl,
      price: MoneyVO.fromCents(orm.priceCents, orm.currency),
      stock: orm.stock,
    });
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.imageUrl = domain.imageUrl;
    orm.priceCents = domain.price.toCents();
    orm.currency = domain.price.currency;
    orm.stock = domain.stock;
    return orm;
  }
}
