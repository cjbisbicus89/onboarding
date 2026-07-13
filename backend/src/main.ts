import { config } from 'dotenv';
config();

import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RateLimitingMiddleware } from './infrastructure/http/middlewares/rate-limiting.middleware';
import { StructuredLogger } from './infrastructure/logging/structured-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(StructuredLogger);
  app.useLogger(logger);

  app.enableCors(corsConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const collectMessages = (
          validationErrors: typeof errors,
          prefix = '',
        ): string[] =>
          validationErrors.flatMap((error) => {
            const property = prefix
              ? `${prefix}.${error.property}`
              : error.property;
            const own = Object.entries(error.constraints ?? {}).map(
              ([key, message]) => {
                if (key === 'whitelistValidation') {
                  return `La propiedad '${property}' no está permitida`;
                }
                return String(message);
              },
            );
            const nested =
              error.children && error.children.length > 0
                ? collectMessages(error.children, property)
                : [];
            return [...own, ...nested];
          });

        const messages = collectMessages(errors);
        return new BadRequestException(
          messages.length > 0
            ? messages.join('. ')
            : 'La solicitud no es válida',
        );
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  const rateLimitingMiddleware = new RateLimitingMiddleware();
  app.use(rateLimitingMiddleware.use.bind(rateLimitingMiddleware));

  const config = new DocumentBuilder()
    .setTitle('Checkout API')
    .setDescription(
      'API de pagos con tarjeta de crédito. Expone endpoints para procesar pagos, consultar transacciones y verificar salud del sistema.',
    )
    .setVersion('1.0.0')
    .setContact(
      'Cristian Bisbicus Urbano',
      'https://github.com/cjbisbicus',
      'cjbisbicus@gmail.com',
    )
    .setLicense('UNLICENSED', '')
    .addTag('checkout', 'Procesamiento de pagos con tarjeta de crédito')
    .addTag('transactions', 'Consulta de transacciones realizadas')
    .addTag('health', 'Verificación de salud del sistema')
    .addServer('http://localhost:3000', 'Entorno local')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

void bootstrap();
