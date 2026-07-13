import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { PaymentGatewayTimeoutException } from '../../../domain/exceptions/payment-gateway-timeout.exception';
import { PaymentGatewayUnavailableException } from '../../../domain/exceptions/payment-gateway-unavailable.exception';
import { lastValueFrom } from 'rxjs';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { PaymentGatewayPort } from '../../../domain/ports/payment-gateway.port';

const PAYMENT_PROVIDER_TIMEOUT_MS = 15_000;
const PAYMENT_PROVIDER_INSTALLMENTS = 1;
const PROVIDER_STATUS_APPROVED = 'APPROVED';
const CORRELATION_ID_HEADER = 'Correlation-ID';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';
import { CorrelationIdContext } from '../../correlation/correlation-id.context';
import { StructuredLogger } from '../../logging/structured-logger.service';
import { SignatureUtil } from './utils/signature.util';

interface TokenizeCardResponse {
  data: {
    id: string;
  };
}

interface AcceptanceTokenResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    };
  };
}

interface ProcessTransactionResponse {
  data: {
    id: string;
    status: string;
  };
}

interface QueryTransactionResponse {
  data: {
    id: string;
    status: string;
  };
}

const MAX_STATUS_POLL_ATTEMPTS = 5;
const STATUS_POLL_INTERVAL_MS = 2_000;

@Injectable()
export class PaymentProviderAdapter implements PaymentGatewayPort {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;
  private readonly merchantId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly logger: StructuredLogger,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>(
      'PAYMENT_PROVIDER_BASE_URL',
    );
    this.publicKey = this.configService.getOrThrow<string>(
      'PAYMENT_PROVIDER_PUBLIC_KEY',
    );
    this.privateKey = this.configService.getOrThrow<string>(
      'PAYMENT_PROVIDER_PRIVATE_KEY',
    );
    this.integritySecret = this.configService.getOrThrow<string>(
      'PAYMENT_PROVIDER_INTEGRITY_SECRET',
    );
    this.merchantId = this.configService.getOrThrow<string>(
      'PAYMENT_PROVIDER_MERCHANT_ID',
    );
  }

  async processPayment(
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
  }> {
    const correlationId = CorrelationIdContext.get() ?? 'unknown';

    try {
      return await this.circuitBreaker.execute(async () => {
        this.logger.log('Payment gateway processing started', {
          transactionId: transaction.id,
          correlationId,
        });

        const tokenizedCardId = await this.tokenizeCard(
          {
            number: cardDetails.cardNumber,
            cvc: cardDetails.cvc,
            expMonth: cardDetails.expMonth,
            expYear: cardDetails.expYear,
            cardHolder: cardDetails.holderName,
          },
          correlationId,
        );
        const acceptanceToken = await this.getAcceptanceToken(correlationId);
        const signature = SignatureUtil.generate(
          transaction.merchantReference,
          transaction.totalAmount.toCents(),
          transaction.totalAmount.currency,
          this.integritySecret,
        );

        const response = await lastValueFrom(
          this.httpService.post<ProcessTransactionResponse>(
            `${this.baseUrl}/transactions`,
            {
              acceptance_token: acceptanceToken,
              amount_in_cents: transaction.totalAmount.toCents(),
              currency: transaction.totalAmount.currency,
              customer_email: transaction.customer.email,
              payment_method: {
                type: 'CARD',
                token: tokenizedCardId,
                installments: PAYMENT_PROVIDER_INSTALLMENTS,
              },
              reference: transaction.merchantReference,
              signature,
            },
            {
              headers: {
                Authorization: `Bearer ${this.privateKey}`,
                [CORRELATION_ID_HEADER]: correlationId,
              },
              timeout: PAYMENT_PROVIDER_TIMEOUT_MS,
            },
          ),
        );

        let providerStatus = response.data.data.status.toUpperCase();
        const providerReference = response.data.data.id;

        this.logger.log('Payment gateway responded', {
          transactionId: transaction.id,
          providerReference,
          status: providerStatus,
          correlationId,
        });

        // Las transacciones con tarjeta en el proveedor de pagos se crean en
        // PENDING y se finalizan asincrónicamente. Realizamos polling para
        // obtener el estado final dentro del timeout permitido.
        if (providerStatus === 'PENDING') {
          providerStatus = await this.pollFinalStatus(
            providerReference,
            correlationId,
          );
        }

        const finalStatus = this.toTransactionStatus(providerStatus);

        return {
          success: finalStatus === TransactionStatus.APPROVED,
          status: finalStatus,
          providerReference,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        this.logger.error('Payment provider error response', undefined, {
          status: error.response.status,
          data: error.response.data,
          correlationId,
        });
      }
      throw error;
    }
  }

  private toTransactionStatus(providerStatus: string): TransactionStatus {
    switch (providerStatus.toUpperCase()) {
      case PROVIDER_STATUS_APPROVED:
        return TransactionStatus.APPROVED;
      case 'DECLINED':
        return TransactionStatus.DECLINED;
      case 'PENDING':
        return TransactionStatus.PENDING;
      default:
        return TransactionStatus.ERROR;
    }
  }

  private async pollFinalStatus(
    providerReference: string,
    correlationId: string,
  ): Promise<string> {
    let attempts = 0;
    let status = 'PENDING';

    while (attempts < MAX_STATUS_POLL_ATTEMPTS && status === 'PENDING') {
      await this.sleep(STATUS_POLL_INTERVAL_MS);
      attempts++;

      try {
        const response = await lastValueFrom(
          this.httpService.get<QueryTransactionResponse>(
            `${this.baseUrl}/transactions/${providerReference}`,
            {
              headers: {
                Authorization: `Bearer ${this.privateKey}`,
                [CORRELATION_ID_HEADER]: correlationId,
              },
              timeout: PAYMENT_PROVIDER_TIMEOUT_MS,
            },
          ),
        );

        status = response.data.data.status.toUpperCase();
        this.logger.log('Polled payment provider status', {
          providerReference,
          attempt: attempts,
          status,
          correlationId,
        });
      } catch (error) {
        this.logger.log('Payment provider status poll failed', {
          providerReference,
          attempt: attempts,
          correlationId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return status;
  }

  private async tokenizeCard(
    card: {
      number: string;
      cvc: string;
      expMonth: string;
      expYear: string;
      cardHolder: string;
    },
    correlationId: string,
  ): Promise<string> {
    const response = await this.retryWithBackoff(
      async () =>
        lastValueFrom(
          this.httpService.post<TokenizeCardResponse>(
            `${this.baseUrl}/tokens/cards`,
            {
              number: card.number,
              cvc: card.cvc,
              exp_month: card.expMonth,
              exp_year: this.normalizeYear(card.expYear),
              card_holder: card.cardHolder,
            },
            {
              headers: {
                Authorization: `Bearer ${this.publicKey}`,
                [CORRELATION_ID_HEADER]: correlationId,
              },
              timeout: PAYMENT_PROVIDER_TIMEOUT_MS,
            },
          ),
        ),
      'tokenizeCard',
    );

    return response.data.data.id;
  }

  private async getAcceptanceToken(correlationId: string): Promise<string> {
    const response = await this.retryWithBackoff(
      async () =>
        lastValueFrom(
          this.httpService.get<AcceptanceTokenResponse>(
            `${this.baseUrl}/merchants/${this.merchantId}`,
            {
              headers: {
                Authorization: `Bearer ${this.privateKey}`,
                [CORRELATION_ID_HEADER]: correlationId,
              },
              timeout: PAYMENT_PROVIDER_TIMEOUT_MS,
            },
          ),
        ),
      'getAcceptanceToken',
    );

    return response.data.data.presigned_acceptance.acceptance_token;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    attempt = 1,
  ): Promise<T> {
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000;

    try {
      return await operation();
    } catch (error) {
      const axiosError = error instanceof AxiosError ? error : null;

      if (attempt >= MAX_RETRIES) {
        if (
          axiosError?.code === 'ECONNABORTED' ||
          axiosError?.code === 'ETIMEDOUT'
        ) {
          throw new PaymentGatewayTimeoutException();
        }
        if (!axiosError?.response || axiosError.response.status >= 500) {
          throw new PaymentGatewayUnavailableException();
        }
        throw error;
      }

      if (!axiosError) {
        throw error;
      }

      const isRetryable =
        !axiosError.response ||
        axiosError.response.status >= 500 ||
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ETIMEDOUT';

      if (!isRetryable) {
        throw error;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await this.sleep(delay);

      return this.retryWithBackoff(operation, operationName, attempt + 1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeYear(year: string): string {
    const normalized = year.trim();
    if (/^\d{4}$/.test(normalized)) {
      return normalized.slice(2);
    }
    return normalized;
  }
}
