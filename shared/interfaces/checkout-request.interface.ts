import { PaymentMethod } from './card-data.interface';
import { CheckoutItem } from './checkout-item.interface';
import { CustomerData } from './customer-data.interface';

export interface CheckoutRequest {
  items: CheckoutItem[];
  customer: CustomerData;
  paymentMethod: PaymentMethod;
}
