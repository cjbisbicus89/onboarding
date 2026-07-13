import { AsyncLocalStorage } from 'async_hooks';

export class CorrelationIdContext {
  private static readonly storage = new AsyncLocalStorage<string>();

  static run<T>(correlationId: string, callback: () => T): T {
    return this.storage.run(correlationId, callback);
  }

  static get(): string | undefined {
    return this.storage.getStore();
  }
}
