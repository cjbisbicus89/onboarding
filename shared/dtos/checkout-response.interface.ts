import { TransactionStatus } from '../enums/transaction-status.enum';

export interface CheckoutResponse {
  transactionId: string;
  status: TransactionStatus;
  totalAmountCentavos: number;
  currency: string;
  assignedTo: string;
  timestamp: string;
  errorReason?: string;
}
