import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { writeFile, unlink } from 'fs/promises';

interface HealthCheckResult {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  responseTimeMs: number | null;
  error?: string;
}

export interface HealthCheckSummary {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  services: {
    database: HealthCheckResult;
    paymentProvider: HealthCheckResult;
    storage: HealthCheckResult;
  };
}

const HEALTH_CHECK_PROVIDER_TIMEOUT_MS = 3_000;
const HEALTH_CHECK_STORAGE_PATH = '/tmp/health-check';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthCheckSummary> {
    const start = Date.now();

    const database = await this.checkDatabase(start);
    const storage = await this.checkStorage(start);
    const paymentProvider =
      database.status === 'UP' && storage.status === 'UP'
        ? await this.checkPaymentProvider(start)
        : { status: 'UNKNOWN' as const, responseTimeMs: null };

    const services = { database, paymentProvider, storage };

    return {
      status: this.calculateOverallStatus(services),
      timestamp: new Date().toISOString(),
      services,
    };
  }

  private async checkDatabase(start: number): Promise<HealthCheckResult> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'UP',
        responseTimeMs: Date.now() - start,
      };
    } catch {
      return {
        status: 'DOWN',
        responseTimeMs: null,
        error: 'Error al conectar con la base de datos',
      };
    }
  }

  private async checkPaymentProvider(
    start: number,
  ): Promise<HealthCheckResult> {
    try {
      const baseUrl = this.configService.getOrThrow<string>(
        'PAYMENT_PROVIDER_BASE_URL',
      );
      await lastValueFrom(
        this.httpService.get(`${baseUrl}/health`, {
          timeout: HEALTH_CHECK_PROVIDER_TIMEOUT_MS,
        }),
      );
      return {
        status: 'UP',
        responseTimeMs: Date.now() - start,
      };
    } catch {
      return {
        status: 'DOWN',
        responseTimeMs: null,
        error: 'Error al consultar el proveedor de pagos',
      };
    }
  }

  private async checkStorage(start: number): Promise<HealthCheckResult> {
    try {
      await writeFile(HEALTH_CHECK_STORAGE_PATH, 'ok');
      await unlink(HEALTH_CHECK_STORAGE_PATH);
      return {
        status: 'UP',
        responseTimeMs: Date.now() - start,
      };
    } catch {
      return {
        status: 'DOWN',
        responseTimeMs: null,
        error: 'Error al verificar el almacenamiento',
      };
    }
  }

  private calculateOverallStatus(services: {
    database: HealthCheckResult;
    paymentProvider: HealthCheckResult;
    storage: HealthCheckResult;
  }): 'UP' | 'DEGRADED' | 'DOWN' {
    if (
      services.database.status === 'DOWN' ||
      services.storage.status === 'DOWN'
    ) {
      return 'DOWN';
    }

    if (services.paymentProvider.status === 'DOWN') {
      return 'DEGRADED';
    }

    return 'UP';
  }
}
