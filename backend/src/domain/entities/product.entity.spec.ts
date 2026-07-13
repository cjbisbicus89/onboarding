import { DomainException } from '../exceptions/domain.exception';
import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';
import { MoneyVO } from '../value-objects/money.vo';
import { Product } from './product.entity';

describe('Product', () => {
  it('create_whenPropsAreValid_createsProduct', () => {
    const product = Product.create({
      name: 'T-shirt',
      description: 'Cotton t-shirt',
      imageUrl: 'https://example.com/tshirt.png',
      price: MoneyVO.fromCents(50_000, 'COP'),
      stock: 10,
    });

    expect(product.name).toBe('T-shirt');
    expect(product.stock).toBe(10);
  });

  it('create_whenNameIsEmpty_throwsDomainException', () => {
    expect(() =>
      Product.create({
        name: '   ',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: 5,
      }),
    ).toThrow(DomainException);
  });

  it('create_whenStockIsNegative_throwsDomainException', () => {
    expect(() =>
      Product.create({
        name: 'Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: -1,
      }),
    ).toThrow(DomainException);
  });

  it('create_whenStockIsNotInteger_throwsDomainException', () => {
    expect(() =>
      Product.create({
        name: 'Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: 1.5,
      }),
    ).toThrow(DomainException);
  });

  describe('hasSufficientStock', () => {
    it('hasSufficientStock_whenStockIsExact_returnsTrue', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: 5,
      });

      expect(product.hasSufficientStock(5)).toBe(true);
    });

    it('hasSufficientStock_whenQuantityIsZero_throwsDomainException', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: 5,
      });

      expect(() => product.hasSufficientStock(0)).toThrow(DomainException);
    });
  });

  describe('decreaseStock', () => {
    it('decreaseStock_whenStockIsSufficient_returnsProductWithReducedStock', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: 5,
      });

      const updated = product.decreaseStock(2);

      expect(updated.stock).toBe(3);
      expect(product.stock).toBe(5);
    });

    it('decreaseStock_whenStockIsInsufficient_throwsInsufficientStockException', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.png',
        price: MoneyVO.fromCents(1_000, 'COP'),
        stock: 1,
      });

      expect(() => product.decreaseStock(2)).toThrow(
        InsufficientStockException,
      );
    });
  });
});
