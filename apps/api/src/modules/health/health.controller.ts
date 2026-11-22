import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unreachable';
    }

    return {
      status: 'ok',
      service: 'cafex-api',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      version: '1.0.0',
    };
  }
}

