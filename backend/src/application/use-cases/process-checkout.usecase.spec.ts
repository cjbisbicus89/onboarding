import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Customer } from '../../domain/entities/customer.entity';
import { Product } from '../../domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';
import { AuditPort } from '../../domain/ports/audit.port';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import {
  TransactionalRepositories,
  UnitOfWorkPort,
} from '../../domain/ports/unit-of-work.port';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import {
  CardCommand,
  CheckoutItemCommand,
  ProcessCheckoutCommand,
} from '../dtos/process-checkout-command.dto';
import { ProcessCheckoutUseCase } from './process-checkout.usecase';

class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private customers: Customer[] = [];

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customers.find((c) => c.email === email) ?? null;
  }

  async save(customer: Customer): Promise<Customer> {
    this.customers.push(customer);
    return customer;
  }
}

class InMemoryProductRepository implements ProductRepositoryPort {
  private products: Map<string, Product> = new Map();

  setProducts(products: Product[]): void {
    this.products = new Map(products.map((p) => [p.id, p]));
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findByIdWithStockLock(id: string): Promise<Product | null> {
    return this.findById(id);
  }

  async save(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async updateStockInTransaction(
    updates: Array<{ productId: string; newStock: number }>,
  ): Promise<void> {
    for (const update of updates) {
      const product = this.products.get(update.productId);
      if (product) {
        this.products.set(
          update.productId,
          Product.create({
            id: product.id,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            price: product.price,
            stock: update.newStock,
          }),
        );
      }
    }
  }

  async restoreStockInTransaction(
    updates: Array<{ productId: string; newStock: number }>,
  ): Promise<void> {
    for (const update of updates) {
      const product = this.products.get(update.productId);
      if (product) {
        this.products.set(
          update.productId,
          Product.create({
            id: product.id,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            price: product.price,
            stock: update.newStock,
          }),
        );
      }
    }
  }
}

class InMemoryTransactionRepository implements TransactionRepositoryPort {
  private transactions: Map<string, Transaction> = new Map();

  getAll(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  async save(transaction: Transaction): Promise<Transaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) ?? null;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Transaction | null> {
    return (
      Array.from(this.transactions.values()).find(
        (t) => t.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }
}

class StubPaymentGateway implements PaymentGatewayPort {
  constructor(
    private readonly result: {
      success: boolean;
      providerReference: string;
      status: TransactionStatus;
    } = {
      success: true,
      providerReference: 'provider-ref',
      status: TransactionStatus.APPROVED,
    },
    private readonly shouldThrow = false,
  ) {}

  async processPayment(): Promise<{
    success: boolean;
    providerReference: string;
    status: TransactionStatus;
  }> {
    if (this.shouldThrow) {
      throw new Error('Gateway error');
    }
    return this.result;
  }
}

class StubUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly repos: TransactionalRepositories) {}

  async runInTransaction<T>(
    work: (repos: TransactionalRepositories) => Promise<T>,
  ): Promise<T> {
    return work({
      ...this.repos,
      customers: this.repos.customers ?? new InMemoryCustomerRepository(),
    });
  }
}

class StubAuditPort implements AuditPort {
  readonly events: unknown[] = [];

  async log(event: unknown): Promise<void> {
    this.events.push(event);
  }

  async logTransactionCreated(): Promise<void> {
    this.events.push({ action: 'transaction_created' });
  }

  async logStatusChanged(): Promise<void> {
    this.events.push({ action: 'status_changed' });
  }

  async logPaymentFailed(): Promise<void> {
    this.events.push({ action: 'payment_failed' });
  }

  async logStockUpdated(): Promise<void> {
    this.events.push({ action: 'stock_updated' });
  }
}

describe('ProcessCheckoutUseCase', () => {
  const productId = '11111111-1111-1111-1111-111111111111';

  const defaultItems: readonly CheckoutItemCommand[] = [
    { productId, quantity: 1 },
  ];

  const defaultCard: CardCommand = {
    number: '4111111111111111',
    cvc: '123',
    expMonth: '12',
    expYear: '2027',
    cardHolder: 'John Doe',
  };

  const createCommand = (
    items: readonly CheckoutItemCommand[] = defaultItems,
  ): ProcessCheckoutCommand =>
    new ProcessCheckoutCommand(
      'customer@example.com',
      'John Doe',
      items,
      defaultCard,
      'idempotency-key-1',
      'correlation-id-1',
    );

  const createProduct = (stock = 10): Product =>
    Product.create({
      id: productId,
      name: 'Product',
      description: 'Description',
      imageUrl: 'https://example.com/image.png',
      price: MoneyVO.fromCents(50_000, 'COP'),
      stock,
    });

  const setupUseCase = (paymentGateway: PaymentGatewayPort) => {
    const customerRepo = new InMemoryCustomerRepository();
    const productRepo = new InMemoryProductRepository();
    const transactionRepo = new InMemoryTransactionRepository();
    const auditPort = new StubAuditPort();
    const unitOfWork = new StubUnitOfWork({
      products: productRepo,
      customers: customerRepo,
      transactions: transactionRepo,
    });

    productRepo.setProducts([createProduct()]);

    const useCase = new ProcessCheckoutUseCase(
      customerRepo,
      productRepo,
      transactionRepo,
      paymentGateway,
      auditPort,
      unitOfWork,
    );

    return { useCase, productRepo, transactionRepo, auditPort };
  };

  it('execute_whenPaymentIsApproved_createsApprovedTransactionAndDecreasesStock', async () => {
    const { useCase, productRepo, transactionRepo } = setupUseCase(
      new StubPaymentGateway(),
    );

    const result = await useCase.execute(createCommand());

    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.customer.email).toBe('customer@example.com');

    const persisted = await transactionRepo.findById(result.id);
    expect(persisted?.status).toBe(TransactionStatus.APPROVED);

    const product = (await productRepo.findById(productId))!;
    expect(product.stock).toBe(9);
  });

  it('execute_whenStockIsInsufficient_throwsInsufficientStockException', async () => {
    const { useCase } = setupUseCase(new StubPaymentGateway());

    await expect(
      useCase.execute(createCommand([{ productId, quantity: 20 }])),
    ).rejects.toThrow(InsufficientStockException);
  });

  it('execute_whenCalledAgainWithSameIdempotencyKey_returnsCachedResult', async () => {
    const { useCase } = setupUseCase(new StubPaymentGateway());
    const command = createCommand();

    const first = await useCase.execute(command);
    const second = await useCase.execute(command);

    expect(second.id).toBe(first.id);
  });

  it('execute_whenPaymentGatewayFails_marksTransactionAsError', async () => {
    const { useCase, transactionRepo, auditPort } = setupUseCase(
      new StubPaymentGateway(undefined, true),
    );

    await expect(useCase.execute(createCommand())).rejects.toThrow(
      'Gateway error',
    );

    const transactions = transactionRepo.getAll();
    expect(transactions[0].status).toBe(TransactionStatus.ERROR);
    expect(
      auditPort.events.some(
        (e) => hasAction(e) && e.action === 'payment_failed',
      ),
    ).toBe(true);
  });

  it('execute_whenPaymentIsDeclined_createsDeclinedTransactionAndDoesNotReduceStock', async () => {
    const { useCase, productRepo, transactionRepo } = setupUseCase(
      new StubPaymentGateway({
        success: true,
        providerReference: 'declined-ref',
        status: TransactionStatus.DECLINED,
      }),
    );

    const result = await useCase.execute(createCommand());

    expect(result.status).toBe(TransactionStatus.DECLINED);
    expect(result.errorReason).toBe('Payment declined by provider');
    expect(result.providerReference).toBeNull();
    const product = (await productRepo.findById(productId))!;
    expect(product.stock).toBe(10);
    const persisted = await transactionRepo.findById(result.id);
    expect(persisted?.status).toBe(TransactionStatus.DECLINED);
  });

  it('execute_whenPaymentIsError_marksTransactionAsErrorAndDoesNotReduceStock', async () => {
    const { useCase, productRepo, transactionRepo } = setupUseCase(
      new StubPaymentGateway({
        success: true,
        providerReference: 'error-ref',
        status: TransactionStatus.ERROR,
      }),
    );

    const result = await useCase.execute(createCommand());

    expect(result.status).toBe(TransactionStatus.ERROR);
    const product = (await productRepo.findById(productId))!;
    expect(product.stock).toBe(10);
    const persisted = await transactionRepo.findById(result.id);
    expect(persisted?.status).toBe(TransactionStatus.ERROR);
  });

  it('execute_whenPaymentReturnsPending_keepsTransactionPendingAndDoesNotReduceStock', async () => {
    const { useCase, productRepo, transactionRepo } = setupUseCase(
      new StubPaymentGateway({
        success: true,
        providerReference: 'pending-ref',
        status: TransactionStatus.PENDING,
      }),
    );

    const result = await useCase.execute(createCommand());

    expect(result.status).toBe(TransactionStatus.PENDING);
    expect(result.providerReference).toBeNull();
    const product = (await productRepo.findById(productId))!;
    expect(product.stock).toBe(10);
    const persisted = await transactionRepo.findById(result.id);
    expect(persisted?.status).toBe(TransactionStatus.PENDING);
  });

  it('execute_whenDuplicateItemsAggregateExceedsStock_throwsInsufficientStockException', async () => {
    const { useCase, productRepo } = setupUseCase(new StubPaymentGateway());

    productRepo.setProducts([createProduct(4)]);

    await expect(
      useCase.execute(
        createCommand([
          { productId, quantity: 2 },
          { productId, quantity: 3 },
        ]),
      ),
    ).rejects.toThrow(InsufficientStockException);
  });

  it('execute_whenProductNotFound_throwsInsufficientStockExceptionWithZeroAvailable', async () => {
    const { useCase, productRepo } = setupUseCase(new StubPaymentGateway());

    productRepo.setProducts([]);

    await expect(useCase.execute(createCommand())).rejects.toThrow(
      InsufficientStockException,
    );
  });

  it('execute_whenCustomerAlreadyExists_reusesExistingCustomer', async () => {
    const { productRepo, transactionRepo, auditPort } = setupUseCase(
      new StubPaymentGateway(),
    );

    const customerRepo = new InMemoryCustomerRepository();
    await customerRepo.save(
      Customer.create({ email: 'customer@example.com', fullName: 'Existing' }),
    );

    const useCaseWithExisting = new ProcessCheckoutUseCase(
      customerRepo,
      productRepo,
      transactionRepo,
      new StubPaymentGateway(),
      auditPort,
      new StubUnitOfWork({
        products: productRepo,
        customers: customerRepo,
        transactions: transactionRepo,
      }),
    );

    const result = await useCaseWithExisting.execute(createCommand());

    expect(result.customer.fullName).toBe('Existing');
    expect(customerRepo.findByEmail('customer@example.com')).resolves.toBeTruthy();
  });

  it('execute_whenTransactionDisappearsAfterPayment_throwsDomainException', async () => {
    const { useCase, transactionRepo, auditPort } = setupUseCase(
      new StubPaymentGateway(),
    );

    jest
      .spyOn(transactionRepo, 'findById')
      .mockResolvedValueOnce(null)
      .mockResolvedValue(null);

    await expect(useCase.execute(createCommand())).rejects.toThrow('desapareció');

    expect(
      auditPort.events.some(
        (e) => hasAction(e) && e.action === 'payment_failed',
      ),
    ).toBe(true);

    const transactions = transactionRepo.getAll();
    expect(transactions[0].status).toBe(TransactionStatus.PENDING);
  });

  it('execute_whenProductNotFoundDuringStockUpdate_throwsDomainException', async () => {
    const { useCase, productRepo, auditPort } = setupUseCase(
      new StubPaymentGateway(),
    );

    jest.spyOn(productRepo, 'findByIdWithStockLock').mockResolvedValue(null);

    await expect(useCase.execute(createCommand())).rejects.toThrow(
      'No se encontró el producto',
    );

    expect(
      auditPort.events.some(
        (e) => hasAction(e) && e.action === 'payment_failed',
      ),
    ).toBe(true);
  });

  it('execute_whenMarkTransactionAsErrorAlsoFails_safeAuditsPaymentFailed', async () => {
    const { useCase, transactionRepo, auditPort } = setupUseCase(
      new StubPaymentGateway(undefined, true),
    );

    jest.spyOn(transactionRepo, 'findById').mockRejectedValue(new Error('db fail'));

    await expect(useCase.execute(createCommand())).rejects.toThrow('Gateway error');

    expect(
      auditPort.events.some(
        (e) => hasAction(e) && e.action === 'payment_failed',
      ),
    ).toBe(true);
  });
});

function hasAction(event: unknown): event is { action: string } {
  return (
    typeof event === 'object' &&
    event !== null &&
    'action' in event &&
    typeof (event as Record<string, unknown>).action === 'string'
  );
}
