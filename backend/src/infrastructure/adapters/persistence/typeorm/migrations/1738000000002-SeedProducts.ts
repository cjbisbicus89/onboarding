import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProducts1738000000002 implements MigrationInterface {
  name = 'SeedProducts1738000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO products (id, name, description, image_url, price_amount, currency, stock)
      VALUES 
        ('39bf844b-8980-4093-bb65-53dab134f006', 'Camiseta NestJS', 'Camiseta de algodón con logo de NestJS', 'https://raw.githubusercontent.com/nestjs/nest/master/content/logo-small.png', 2500000, 'COP', 50),
        (gen_random_uuid(), 'Gorra Hexagonal', 'Gorra con diseño de arquitectura hexagonal', 'https://reactnative.dev/img/tiny_logo.png', 1500000, 'COP', 30),
        (gen_random_uuid(), 'Taza Typescript', 'Taza de cerámica para café y código', 'https://www.typescriptlang.org/icons/icon-48x48.png', 1200000, 'COP', 100);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM products;`);
  }
}
