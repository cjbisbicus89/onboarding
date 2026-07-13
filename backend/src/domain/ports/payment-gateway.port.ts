import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';

export interface PaymentGatewayPort {
  processPayment(
    transaction: Transaction,
    cardDetails: {
      cardNumber: string;
      expMonth: string;
      expYear: string;
      cvc: string;
      holderName: string;
    },
  ): Promise<{
    success: boolean;
    providerReference: string;
    status: TransactionStatus;
  }>;
}
