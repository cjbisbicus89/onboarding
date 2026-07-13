import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Entity('customers')
export class CustomerOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_customers_email')
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => TransactionOrmEntity, (transaction) => transaction.customer)
  transactions: TransactionOrmEntity[];
}
