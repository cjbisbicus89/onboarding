import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckSummary, HealthService } from '../../health/health.service';
import { HealthCheckResponseDto } from '../dtos/health-check-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({
    status: 200,
    description: 'Health status',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async check(): Promise<HealthCheckSummary> {
    const summary = await this.healthService.check();

    if (summary.status === 'DOWN') {
      throw new HttpException(summary, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return summary;
  }
}
