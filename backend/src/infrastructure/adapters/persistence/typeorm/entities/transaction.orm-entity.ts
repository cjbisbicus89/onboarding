import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity';
import { TransactionItemOrmEntity } from './transaction-item.orm-entity';

@Entity('transactions')
@Check(
  'chk_transactions_status',
  "status IN ('PENDING', 'APPROVED', 'DECLINED', 'ERROR')",
)
@Unique('uq_provider_reference', ['providerReference'])
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  @Index('idx_transactions_customer')
  customerId: string;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.transactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @Column({ type: 'varchar', length: 20 })
  @Index('idx_transactions_status')
  @Index('idx_transactions_status_created_at', ['status', 'createdAt'])
  status: string;

  @Column({ type: 'int', name: 'total_amount' })
  totalAmountCents: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'provider_reference',
    nullable: true,
  })
  providerReference: string | null;

  @Column({
    type: 'uuid',
    name: 'idempotency_key',
    nullable: true,
    unique: true,
  })
  @Index('idx_transactions_idempotency_key')
  idempotencyKey: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'error_reason',
    nullable: true,
  })
  errorReason: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Index('idx_transactions_created_at')
  createdAt: Date;

  @OneToMany(() => TransactionItemOrmEntity, (item) => item.transaction, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'id' })
  items: TransactionItemOrmEntity[];
}
