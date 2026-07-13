import { createHash } from 'crypto';

export class SignatureUtil {
  static generate(
    reference: string,
    amountCentavos: number,
    currency: string,
    secret: string,
  ): string {
    const rawString = `${reference}${amountCentavos}${currency}${secret}`;
    return createHash('sha256').update(rawString).digest('hex');
  }
}
