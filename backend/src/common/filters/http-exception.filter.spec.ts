import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AxiosError } from 'axios';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { StructuredLogger } from '../../infrastructure/logging/structured-logger.service';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logger: StructuredLogger;
  let response: Partial<Response>;
  let request: Partial<Request>;
  let host: Partial<ArgumentsHost>;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    } as unknown as StructuredLogger;

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    request = {
      url: '/api/v1/checkout',
      method: 'POST',
      headers: { 'correlation-id': 'corr-123' },
    };

    host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(response),
        getRequest: jest.fn().mockReturnValue(request),
      }),
    };

    filter = new HttpExceptionFilter(logger);
  });

  it('catch_whenDomainException_returnsMappedStatus', () => {
    const exception = new DomainException('Cantidad inválida');

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Cantidad inválida',
      }),
    );
  });

  it('catch_whenHttpException_returnsItsStatus', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
      }),
    );
  });

  it('catch_whenUnknownError_returnsGenericSpanishMessage', () => {
    const exception = new Error('Unexpected raw library message');

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Ocurrió un error inesperado',
      }),
    );
  });

  it('catch_whenSyntaxError_returnsBadRequestInSpanish', () => {
    const exception = new SyntaxError('Unexpected token in JSON');

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: 'El cuerpo de la solicitud no es un JSON válido',
      }),
    );
  });

  it('catch_whenDefaultRouteNotFound_returnsSpanishMessage', () => {
    const exception = new NotFoundException('Cannot GET /api/v1/missing');

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'No se encontró la ruta solicitada',
      }),
    );
  });

  it('catch_whenHttpExceptionWrapsJsonParseError_returnsSpanishMessage', () => {
    const exception = new HttpException(
      'Unexpected token i in JSON at position 1',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: 'El cuerpo de la solicitud no es un JSON válido',
      }),
    );
  });

  it('catch_whenHttpExceptionResponseObjectContainsJsonParseError_returnsSpanishMessage', () => {
    const exception = new HttpException(
      { message: 'Unexpected token i in JSON at position 1' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host as ArgumentsHost);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'El cuerpo de la solicitud no es un JSON válido',
      }),
    );
  });

  it('catch_whenHttpExceptionResponseObjectContainsMessage_returnsMessage', () => {
    const exception = new HttpException(
      { message: 'Custom error message' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host as ArgumentsHost);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error message',
      }),
    );
  });

  it('catch_whenHttpExceptionResponseObjectContainsCustomError_returnsCustomError', () => {
    const exception = new HttpException(
      { error: 'Custom Error', message: 'Custom message' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host as ArgumentsHost);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Custom Error',
      }),
    );
  });

  it('catch_whenAxiosErrorWithResponseDataMessages_returnsMappedMessage', () => {
    const exception = new AxiosError('Provider error');
    exception.response = {
      status: 400,
      data: {
        error: {
          messages: { field: ['a', 'b'] },
        },
      },
    } as any;

    filter.catch(exception, host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'field: a, b',
      }),
    );
  });

  it('catch_whenAxiosErrorWithResponseErrorType_returnsProviderMessage', () => {
    const exception = new AxiosError('Provider error');
    exception.response = {
      status: 400,
      data: {
        error: {
          type: 'ProviderType',
          reason: 'ProviderReason',
        },
      },
    } as any;

    filter.catch(exception, host as ArgumentsHost);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error del proveedor de pagos: ProviderType. ProviderReason',
      }),
    );
  });

  it('catch_whenNonErrorValue_returnsGenericMessage', () => {
    filter.catch('plain string error', host as ArgumentsHost);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Ocurrió un error inesperado',
      }),
    );
  });
});
