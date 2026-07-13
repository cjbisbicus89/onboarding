import { Injectable, LoggerService } from '@nestjs/common';
import { maskSensitiveData } from './mask-sensitive-data.util';

interface LogContext {
  correlationId?: string;
  transactionId?: string;
  customerId?: string;
  providerReference?: string;
  status?: string | number;
  durationMs?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: unknown;
  service: string;
  environment: string | undefined;
}

@Injectable()
export class StructuredLogger implements LoggerService {
  constructor(private readonly environment: string | undefined = undefined) {}

  log(message: string, context?: LogContext): void {
    this.writeLog('info', message, context);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    this.writeLog('error', message, { ...context, trace });
  }

  warn(message: string, context?: LogContext): void {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.writeLog('debug', message, context);
  }

  verbose(message: string, context?: LogContext): void {
    this.writeLog('verbose', message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.writeLog('fatal', message, context);
  }

  private writeLog(level: string, message: string, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: maskSensitiveData(context),
      service: 'checkout-service',
      environment: this.environment,
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}
