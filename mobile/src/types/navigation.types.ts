export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  Result: { transactionId: string; status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING'; message?: string };
};
