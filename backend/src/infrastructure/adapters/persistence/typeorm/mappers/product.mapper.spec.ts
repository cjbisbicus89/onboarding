import { Product } from '../../../../../domain/entities/product.entity';
import { MoneyVO } from '../../../../../domain/value-objects/money.vo';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from './product.mapper';

describe('ProductMapper', () => {
  it('toDomain_whenOrmEntityIsValid_returnsProduct', () => {
    const orm = new ProductOrmEntity();
    orm.id = '11111111-1111-1111-1111-111111111111';
    orm.name = 'T-shirt';
    orm.description = 'Cotton t-shirt';
    orm.imageUrl = 'https://example.com/tshirt.png';
    orm.priceCents = 50_000;
    orm.currency = 'COP';
    orm.stock = 10;

    const domain = ProductMapper.toDomain(orm);

    expect(domain.id).toBe(orm.id);
    expect(domain.name).toBe(orm.name);
    expect(domain.description).toBe(orm.description);
    expect(domain.imageUrl).toBe(orm.imageUrl);
    expect(domain.price.toCents()).toBe(orm.priceCents);
    expect(domain.price.currency).toBe(orm.currency);
    expect(domain.stock).toBe(orm.stock);
  });

  it('toOrm_whenDomainEntityIsValid_returnsOrmEntity', () => {
    const domain = Product.create({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'T-shirt',
      description: 'Cotton t-shirt',
      imageUrl: 'https://example.com/tshirt.png',
      price: MoneyVO.fromCents(50_000, 'COP'),
      stock: 10,
    });

    const orm = ProductMapper.toOrm(domain);

    expect(orm.id).toBe(domain.id);
    expect(orm.name).toBe(domain.name);
    expect(orm.description).toBe(domain.description);
    expect(orm.imageUrl).toBe(domain.imageUrl);
    expect(orm.priceCents).toBe(domain.price.toCents());
    expect(orm.currency).toBe(domain.price.currency);
    expect(orm.stock).toBe(domain.stock);
  });
});
