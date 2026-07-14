import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { StructuredLogger } from './infrastructure/logging/structured-logger.service';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  ValidationPipe: jest.fn(),
}));
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));
jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn(),
}));
jest.mock('./infrastructure/logging/structured-logger.service');
jest.mock('./app.module', () => ({ AppModule: class AppModule {} }));
jest.mock('./config/cors.config', () => ({
  corsConfig: { origin: jest.fn() },
}));
jest.mock('./common/filters/http-exception.filter', () => ({
  HttpExceptionFilter: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('./infrastructure/http/middlewares/rate-limiting.middleware', () => ({
  RateLimitingMiddleware: jest.fn().mockImplementation(() => ({
    use: jest.fn().mockReturnValue(jest.fn()),
  })),
}));

const mockApp = {
  get: jest.fn(),
  useLogger: jest.fn(),
  enableCors: jest.fn(),
  useGlobalPipes: jest.fn(),
  useGlobalFilters: jest.fn(),
  use: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue(3000),
};

const mockLogger = {};

const mockDocumentBuilder = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  setContact: jest.fn().mockReturnThis(),
  setLicense: jest.fn().mockReturnThis(),
  addTag: jest.fn().mockReturnThis(),
  addServer: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({}),
};

beforeAll(() => {
  (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});
  (SwaggerModule.setup as jest.Mock).mockReturnValue(undefined);
  (DocumentBuilder as unknown as jest.Mock).mockImplementation(() => mockDocumentBuilder);
  (StructuredLogger as unknown as jest.Mock).mockImplementation(() => mockLogger);

  mockApp.get.mockImplementation((token: unknown) => {
    if (token === ConfigService) return mockConfigService;
    if (token === StructuredLogger) return mockLogger;
    return undefined;
  });
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('main', () => {
  it('bootstrap_createsAppAndStartsListening', async () => {
    await import('./main');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.useLogger).toHaveBeenCalledWith(mockLogger);
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.useGlobalFilters).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api-docs', mockApp, expect.any(Object));
    expect(mockApp.listen).toHaveBeenCalledWith(3000);

    const validationOptions = (ValidationPipe as jest.Mock).mock.calls[0][0];
    const exceptionFactory = validationOptions.exceptionFactory;

    const result1 = exceptionFactory([{ property: 'name', constraints: { isString: 'name must be a string' } }]);
    expect(result1).toBeInstanceOf(BadRequestException);

    const result2 = exceptionFactory([
      {
        property: 'extra',
        constraints: { whitelistValidation: 'property extra should not exist' },
      },
    ]);
    expect(result2).toBeInstanceOf(BadRequestException);
    expect(result2.message).toContain("no está permitida");

    const result3 = exceptionFactory([
      {
        property: 'parent',
        children: [{ property: 'child', constraints: { isString: 'child error' } }],
      },
    ]);
    expect(result3).toBeInstanceOf(BadRequestException);

    const result4 = exceptionFactory([]);
    expect(result4).toBeInstanceOf(BadRequestException);
    expect(result4.message).toBe('La solicitud no es válida');
  });
});
