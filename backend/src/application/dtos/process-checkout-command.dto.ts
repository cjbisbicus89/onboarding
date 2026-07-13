export interface CheckoutItemCommand {
  readonly productId: string;
  readonly quantity: number;
}

export interface CardCommand {
  readonly number: string;
  readonly cvc: string;
  readonly expMonth: string;
  readonly expYear: string;
  readonly cardHolder: string;
}

export class ProcessCheckoutCommand {
  constructor(
    public readonly customerEmail: string,
    public readonly customerFullName: string,
    public readonly items: readonly CheckoutItemCommand[],
    public readonly card: CardCommand,
    public readonly idempotencyKey: string,
    public readonly correlationId: string,
  ) {}
}
