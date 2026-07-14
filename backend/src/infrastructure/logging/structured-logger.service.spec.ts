import { StructuredLogger } from './structured-logger.service';

describe('StructuredLogger', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('log_whenEnvironmentIsProvided_writesEnvironment', () => {
    const logger = new StructuredLogger('test');
    logger.log('message', { transactionId: 'tx-1' });

    expect(consoleSpy).toHaveBeenCalled();
    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('message');
    expect(entry.service).toBe('checkout-service');
    expect(entry.environment).toBe('test');
  });

  it('log_whenEnvironmentIsUndefined_doesNotIncludeEnvironment', () => {
    const logger = new StructuredLogger();
    logger.log('message');

    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.environment).toBeUndefined();
  });

  it('error_writesErrorEntryWithTrace', () => {
    const logger = new StructuredLogger('test');
    logger.error('failure', 'stack trace', { correlationId: 'c1' });

    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.level).toBe('error');
    expect(entry.context.trace).toBe('stack trace');
  });

  it('warn_writesWarnEntry', () => {
    const logger = new StructuredLogger('test');
    logger.warn('warning');

    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.level).toBe('warn');
  });

  it('debug_writesDebugEntry', () => {
    const logger = new StructuredLogger('test');
    logger.debug('debug message');

    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.level).toBe('debug');
  });

  it('verbose_writesVerboseEntry', () => {
    const logger = new StructuredLogger('test');
    logger.verbose('verbose message');

    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.level).toBe('verbose');
  });

  it('fatal_writesFatalEntry', () => {
    const logger = new StructuredLogger('test');
    logger.fatal('fatal message');

    const entry = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(entry.level).toBe('fatal');
  });
});
