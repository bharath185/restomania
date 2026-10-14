import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CouponsService } from './coupons.service';
import { UserRole } from '@repo/shared';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Get()
  getCoupons(@CurrentTenant() tenantId: string) {
    return this.couponsService.getCoupons(tenantId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Post()
  createCoupon(@CurrentTenant() tenantId: string, @Body() dto: Parameters<CouponsService['createCoupon']>[1]) {
    return this.couponsService.createCoupon(tenantId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id')
  updateCoupon(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: Parameters<CouponsService['updateCoupon']>[2]) {
    return this.couponsService.updateCoupon(tenantId, id, dto);
  }

  @Public()
  @Post('validate')
  validateCoupon(@CurrentTenant() tenantId: string, @Body() body: { code: string; orderTotal: number }) {
    return this.couponsService.validateCoupon(tenantId, body.code, body.orderTotal);
  }
}
