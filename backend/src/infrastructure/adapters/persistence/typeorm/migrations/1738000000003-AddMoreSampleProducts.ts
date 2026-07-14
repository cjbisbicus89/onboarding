import { MigrationInterface, QueryRunner } from 'typeorm';

const NEW_PRODUCT_IDS = {
  headphones: '203100d0-657c-4a95-b0c0-1dbc3bc06513',
  sneakers: '632ff2e7-3ca7-4712-bc60-739ff20bce79',
  watch: '17807c58-a38c-4288-b0ec-9a3b0a8b2d9e',
} as const;

interface SeedProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceAmount: number;
  stock: number;
}

const SAMPLE_PRODUCTS: SeedProduct[] = [
  {
    id: NEW_PRODUCT_IDS.headphones,
    name: 'Audífonos Premium',
    description:
      'Audífonos inalámbricos con cancelación de ruido y sonido de alta fidelidad',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    priceAmount: 3500000,
    stock: 25,
  },
  {
    id: NEW_PRODUCT_IDS.sneakers,
    name: 'Zapatillas Deportivas',
    description: 'Zapatillas urbanas ligeras y cómodas para tu día a día',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    priceAmount: 4200000,
    stock: 40,
  },
  {
    id: NEW_PRODUCT_IDS.watch,
    name: 'Reloj Inteligente',
    description:
      'Reloj inteligente con monitoreo de actividad física y notificaciones',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    priceAmount: 2800000,
    stock: 60,
  },
];

export class AddMoreSampleProducts1738000000003 implements MigrationInterface {
  name = 'AddMoreSampleProducts1738000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const product of SAMPLE_PRODUCTS) {
      await queryRunner.query(
        `INSERT INTO products (id, name, description, image_url, price_amount, currency, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.name,
          product.description,
          product.imageUrl,
          product.priceAmount,
          'COP',
          product.stock,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM products WHERE id = ANY($1::uuid[])`,
      [Object.values(NEW_PRODUCT_IDS)],
    );
  }
}
