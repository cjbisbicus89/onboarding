import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  PORT = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsUrl()
  PAYMENT_PROVIDER_BASE_URL: string;

  @IsString()
  PAYMENT_PROVIDER_PUBLIC_KEY: string;

  @IsString()
  PAYMENT_PROVIDER_PRIVATE_KEY: string;

  @IsString()
  PAYMENT_PROVIDER_INTEGRITY_SECRET: string;

  @IsString()
  @IsOptional()
  PAYMENT_PROVIDER_MERCHANT_ID: string;

  @IsString()
  PAYMENT_PROVIDER_EVENTS_KEY: string;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      errors.map((e: { toString(): string }) => e.toString()).join('\n'),
    );
  }

  if (!validatedConfig.PAYMENT_PROVIDER_MERCHANT_ID) {
    validatedConfig.PAYMENT_PROVIDER_MERCHANT_ID =
      validatedConfig.PAYMENT_PROVIDER_PUBLIC_KEY;
  }

  return validatedConfig;
}
