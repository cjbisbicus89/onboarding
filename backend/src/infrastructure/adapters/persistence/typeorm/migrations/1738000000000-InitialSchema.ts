import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1738000000000 implements MigrationInterface {
  name = 'InitialSchema1738000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_customers_email ON customers(email);`,
    );

    await queryRunner.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        price_amount INT NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'COP',
        stock INT NOT NULL CONSTRAINT chk_stock_positive CHECK (stock >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        status VARCHAR(20) NOT NULL CONSTRAINT chk_transactions_status
          CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED', 'ERROR')),
        total_amount INT NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'COP',
        provider_reference VARCHAR(255) NULL,
        idempotency_key UUID UNIQUE NULL,
        error_reason VARCHAR(500) NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_provider_reference UNIQUE (provider_reference)
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_transactions_status ON transactions(status);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_customer ON transactions(customer_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_created_at ON transactions(created_at);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_status_created_at ON transactions(status, created_at);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_idempotency_key ON transactions(idempotency_key);`,
    );

    await queryRunner.query(`
      CREATE TABLE transaction_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity INT NOT NULL CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
        unit_price INT NOT NULL
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_items_transaction ON transaction_items(transaction_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS transaction_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS products;`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers;`);
  }
}
