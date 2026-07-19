import { Inject, Injectable } from '@nestjs/common';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Customer } from '../../domain/entities/customer.entity';
import { Product } from '../../domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';
import { AuditPort } from '../../domain/ports/audit.port';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { UnitOfWorkPort } from '../../domain/ports/unit-of-work.port';
import { CardValidator } from '../../domain/services/card-validator';
import {
  CheckoutItemCommand,
  ProcessCheckoutCommand,
} from '../dtos/process-checkout-command.dto';

@Injectable()
export class ProcessCheckoutUseCase {
  constructor(
    @Inject('CustomerRepositoryPort')
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject('AuditPort')
    private readonly auditPort: AuditPort,
    @Inject('UnitOfWorkPort')
    private readonly unitOfWork: UnitOfWorkPort,
  ) {}

  async execute(command: ProcessCheckoutCommand): Promise<Transaction> {
    const existingTransaction =
      await this.transactionRepository.findByIdempotencyKey(
        command.idempotencyKey,
      );

    if (existingTransaction) {
      return existingTransaction;
    }

    const products = await this.validateProductsAndStock(command.items);
    
    const sanitizedLog = command.card.number.replace(/\s/g, '').replace(/-/g, '');
    console.log(`[DEBUG] Received card in UseCase: ${sanitizedLog.slice(0, 4)}...${sanitizedLog.slice(-4)}`);

    CardValidator.assertValid({
      number: command.card.number,
      expMonth: command.card.expMonth,
      expYear: command.card.expYear,
      cvc: command.card.cvc,
    });
    const customer = await this.resolveCustomer(command);

    let transaction: Transaction;
    let reservedUpdates: Array<{
      productId: string;
      oldStock: number;
      newStock: number;
    }> = [];
    try {
      const result = await this.createTransactionAndReserveStock(
        command,
        customer,
        products,
      );
      transaction = result.transaction;
      reservedUpdates = result.reservedUpdates;
    } catch (error) {
      await this.auditPort.logPaymentFailed(
        command.idempotencyKey,
        command.correlationId,
        `Failed to reserve stock for checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }

    await this.auditPort.logTransactionCreated(
      transaction.id,
      command.correlationId,
      { items: command.items.length },
    );

    for (const update of reservedUpdates) {
      await this.auditPort.logStockUpdated(
        update.productId,
        command.correlationId,
        update.oldStock,
        update.newStock,
      );
    }

    let paymentResult: {
      success: boolean;
      providerReference: string;
      status: TransactionStatus;
      errorReason?: string;
    };
    try {
      paymentResult = await this.paymentGateway.processPayment(transaction, {
        cardNumber: command.card.number,
        expMonth: command.card.expMonth,
        expYear: command.card.expYear,
        cvc: command.card.cvc,
        holderName: command.card.cardHolder,
      });
    } catch (error) {
      await this.auditPort.logPaymentFailed(
        transaction.id,
        command.correlationId,
        error instanceof Error
          ? error.message
          : 'Unknown payment gateway error',
      );
      await this.restoreReservedStock(
        transaction.items,
        command.correlationId,
      ).catch(async (restoreError: unknown) => {
        await this.safeAuditPaymentFailed(
          transaction.id,
          `Failed to restore reserved stock: ${restoreError instanceof Error ? restoreError.message : 'Unknown error'}`,
        );
      });
      await this.markTransactionAsError(
        transaction.id,
        error instanceof Error
          ? error.message
          : 'Unknown payment gateway error',
      );
      throw error;
    }

    let persistedTransaction: Transaction;
    let previousStatus: TransactionStatus;
    let restoreUpdates: Array<{
      productId: string;
      oldStock: number;
      newStock: number;
    }> = [];

    try {
      const result = await this.unitOfWork.runInTransaction(async (repos) => {
        const latest = await repos.transactions.findById(transaction.id);
        if (!latest) {
          throw new DomainException(
            `La transacción ${transaction.id} desapareció después de la respuesta del proveedor de pagos`,
          );
        }

        const previousStatus = latest.status;

        if (paymentResult.status === TransactionStatus.APPROVED) {
          latest.approve(paymentResult.providerReference);
        } else if (paymentResult.status === TransactionStatus.DECLINED) {
          latest.decline(paymentResult.errorReason || 'Payment declined by provider');
        } else if (paymentResult.status === TransactionStatus.ERROR) {
          latest.markAsError(paymentResult.errorReason || 'Payment provider returned unexpected status');
        }
        // Si el proveedor devuelve PENDING, la transacción mantiene su estado
        // inicial y el frontend hará polling vía GET /transactions/:id.

        const persisted = await repos.transactions.save(latest);

        if (persisted.status !== TransactionStatus.APPROVED) {
          const updates = await Promise.all(
            persisted.items.map(async (item) => {
              const product = await repos.products.findByIdWithStockLock(
                item.productId,
              );
              if (!product) {
                throw new DomainException(
                  `No se encontró el producto ${item.productId} durante la restauración de stock`,
                );
              }
              const oldStock = product.stock;
              const updatedProduct = product.increaseStock(item.quantity);
              return {
                productId: item.productId,
                oldStock,
                newStock: updatedProduct.stock,
              };
            }),
          );
          await repos.products.restoreStockInTransaction(updates);
          restoreUpdates = updates;
        }

        return { persisted, previousStatus };
      });

      persistedTransaction = result.persisted;
      previousStatus = result.previousStatus;

      for (const update of restoreUpdates) {
        await this.auditPort.logStockUpdated(
          update.productId,
          command.correlationId,
          update.oldStock,
          update.newStock,
        );
      }
    } catch (error) {
      await this.auditPort.logPaymentFailed(
        transaction.id,
        command.correlationId,
        `Post-payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      if (paymentResult.status !== TransactionStatus.APPROVED) {
        await this.restoreReservedStock(
          transaction.items,
          command.correlationId,
        ).catch(async (restoreError: unknown) => {
          await this.safeAuditPaymentFailed(
            transaction.id,
            `Failed to restore reserved stock: ${restoreError instanceof Error ? restoreError.message : 'Unknown error'}`,
          );
        });
      }
      await this.markTransactionAsError(
        transaction.id,
        `Payment was ${paymentResult.status} but post-processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }

    if (previousStatus !== persistedTransaction.status) {
      await this.auditPort.logStatusChanged(
        persistedTransaction.id,
        command.correlationId,
        previousStatus,
        persistedTransaction.status,
        'payment-provider',
      );
    }

    return persistedTransaction;
  }

  private async validateProductsAndStock(
    items: readonly CheckoutItemCommand[],
  ): Promise<Map<string, Product>> {
    const products = new Map<string, Product>();
    const productQuantities = new Map<string, number>();

    // Aggregate quantities by productId to handle duplicates correctly
    for (const item of items) {
      const current = productQuantities.get(item.productId) ?? 0;
      productQuantities.set(item.productId, current + item.quantity);
    }

    for (const [productId, totalQuantity] of productQuantities.entries()) {
      const product = await this.productRepository.findById(productId);

      if (!product || !product.hasSufficientStock(totalQuantity)) {
        throw new InsufficientStockException({
          productId,
          productName: product?.name,
          available: product?.stock ?? 0,
          requested: totalQuantity,
        });
      }

      products.set(product.id, product);
    }

    return products;
  }

  private async resolveCustomer(
    command: ProcessCheckoutCommand,
  ): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findByEmail(
      command.customerEmail,
    );

    if (existingCustomer) {
      return existingCustomer;
    }

    const newCustomer = Customer.create({
      email: command.customerEmail,
      fullName: command.customerFullName,
    });

    return this.customerRepository.save(newCustomer);
  }

  private async createTransactionAndReserveStock(
    command: ProcessCheckoutCommand,
    customer: Customer,
    products: Map<string, Product>,
  ): Promise<{
    transaction: Transaction;
    reservedUpdates: Array<{ productId: string; oldStock: number; newStock: number }>;
  }> {
    return this.unitOfWork.runInTransaction(async (repos) => {
      const transactionItems = command.items.map((item) => {
        const product = products.get(item.productId);
        if (!product) {
          throw new DomainException(
            `No se encontró el producto ${item.productId} al crear la transacción`,
          );
        }
        return TransactionItem.create({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      });

      const transaction = Transaction.create({
        customer,
        items: transactionItems,
        idempotencyKey: command.idempotencyKey,
      });

      const savedTransaction = await repos.transactions.save(transaction);

      const reservedUpdates = await Promise.all(
        command.items.map(async (item) => {
          const product = await repos.products.findByIdWithStockLock(
            item.productId,
          );
          if (!product) {
            throw new DomainException(
              `No se encontró el producto ${item.productId} durante la reserva de stock`,
            );
          }
          const oldStock = product.stock;
          const updatedProduct = product.decreaseStock(item.quantity);
          return {
            productId: item.productId,
            oldStock,
            newStock: updatedProduct.stock,
          };
        }),
      );

      await repos.products.updateStockInTransaction(reservedUpdates);

      return { transaction: savedTransaction, reservedUpdates };
    });
  }

  private async restoreReservedStock(
    items: readonly TransactionItem[],
    correlationId: string,
  ): Promise<void> {
    return this.unitOfWork.runInTransaction(async (repos) => {
      const updates = await Promise.all(
        items.map(async (item) => {
          const product = await repos.products.findByIdWithStockLock(
            item.productId,
          );
          if (!product) {
            throw new DomainException(
              `No se encontró el producto ${item.productId} durante la restauración de stock`,
            );
          }
          const oldStock = product.stock;
          const updatedProduct = product.increaseStock(item.quantity);
          return {
            productId: item.productId,
            oldStock,
            newStock: updatedProduct.stock,
          };
        }),
      );

      await repos.products.restoreStockInTransaction(updates);

      for (const update of updates) {
        await this.auditPort.logStockUpdated(
          update.productId,
          correlationId,
          update.oldStock,
          update.newStock,
        );
      }
    });
  }

  private async markTransactionAsError(
    transactionId: string,
    reason: string,
  ): Promise<void> {
    try {
      const transaction =
        await this.transactionRepository.findById(transactionId);
      if (transaction && transaction.status === TransactionStatus.PENDING) {
        transaction.markAsError(reason);
        await this.transactionRepository.save(transaction);
      }
    } catch (error) {
      await this.safeAuditPaymentFailed(
        transactionId,
        error instanceof Error
          ? error.message
          : 'Failed to mark transaction as error',
      );
    }
  }

  private async safeAuditPaymentFailed(
    transactionId: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      await this.auditPort.logPaymentFailed(
        transactionId,
        'unknown',
        errorMessage,
      );
    } catch {
      // Audit failure must not mask the original error.
    }
  }
}
