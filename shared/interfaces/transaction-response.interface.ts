import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionItemResponse } from './transaction-item.interface';

export interface TransactionResponse {
  transactionId: string;
  status: TransactionStatus;
  totalAmountCentavos: number;
  currency: string;
  assignedTo: string;
  providerReference: string | null;
  createdAt: string;
  items: TransactionItemResponse[];
}
