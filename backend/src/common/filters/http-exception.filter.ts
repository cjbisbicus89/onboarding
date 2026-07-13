import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import axios from 'axios';
import { AppException } from '../../domain/exceptions/app.exception';
import { StructuredLogger } from '../../infrastructure/logging/structured-logger.service';
import { httpStatusPhrase } from './http-status-phrase.util';

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
}

function isHttpExceptionResponse(
  value: unknown,
): value is HttpExceptionResponse {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.resolveStatus(exception);
    const message = this.resolveMessage(exception);
    const error = this.resolveError(exception, status);

    const correlationId = request.headers['correlation-id'];

    this.logger.error(
      'Exception caught',
      exception instanceof Error ? exception.stack : undefined,
      {
        status,
        message,
        correlationId:
          typeof correlationId === 'string' ? correlationId : undefined,
        path: request.url,
        method: request.method,
      },
    );

    response.status(status).json({
      statusCode: status,
      error,
      message,
    });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof AppException) {
      return exception.status;
    }
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (axios.isAxiosError(exception) && exception.response) {
      return exception.response.status;
    }
    if (exception instanceof SyntaxError) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof SyntaxError) {
      return 'El cuerpo de la solicitud no es un JSON válido';
    }
    if (exception instanceof AppException) {
      return exception.message;
    }
    if (axios.isAxiosError(exception)) {
      const data = exception.response?.data as any;
      if (data?.error?.messages) {
        const messages = data.error.messages;
        if (typeof messages === 'object') {
          return Object.entries(messages)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('. ');
        }
      }
      if (data?.error?.type) {
        let msg = `Error del proveedor de pagos: ${data.error.type}`;
        if (data.error.reason) {
          msg += `. ${data.error.reason}`;
        }
        return msg;
      }
      return exception.message;
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (
        isHttpExceptionResponse(response) &&
        response.message !== undefined &&
        response.message !== ''
      ) {
        const raw = Array.isArray(response.message)
          ? response.message.join(', ')
          : response.message;
        if (
          typeof raw === 'string' &&
          /^Cannot (GET|POST|PUT|PATCH|DELETE) \//.test(raw)
        ) {
          return 'No se encontró la ruta solicitada';
        }
        if (typeof raw === 'string' && this.isJsonParseError(raw)) {
          return 'El cuerpo de la solicitud no es un JSON válido';
        }
        return raw;
      }
      if (typeof exception.message === 'string' && this.isJsonParseError(exception.message)) {
        return 'El cuerpo de la solicitud no es un JSON válido';
      }
      return exception.message;
    }
    if (exception instanceof Error) {
      return 'Ocurrió un error inesperado';
    }
    return 'Ocurrió un error inesperado';
  }

  private isJsonParseError(message: string): boolean {
    return /^Unexpected token/.test(message) || / in JSON at position /.test(message) || message === 'Unexpected end of JSON input';
  }

  private resolveError(exception: unknown, status: number): string {
    if (exception instanceof AppException) {
      return httpStatusPhrase(status);
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (
        isHttpExceptionResponse(response) &&
        typeof response.error === 'string' &&
        response.error.length > 0
      ) {
        return response.error;
      }
    }
    return httpStatusPhrase(status);
  }
}
