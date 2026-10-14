import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { AnalyticsService } from './analytics.service';
import { UserRole } from '@repo/shared';

@ApiTags('Analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getDashboard(tenantId);
  }

  @Get('sales')
  getSalesReport(
    @CurrentTenant() tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.analyticsService.getSalesReport(tenantId, from, to);
  }

  @Get('top-dishes')
  getTopDishes(
    @CurrentTenant() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getTopDishes(tenantId, from, to);
  }

  @Get('peak-hours')
  getPeakHours(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getPeakHours(tenantId);
  }
}
