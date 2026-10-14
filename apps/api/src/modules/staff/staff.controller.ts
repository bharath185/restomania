import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import { UserRole } from '@repo/shared';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Get()
  getStaff(@CurrentTenant() tenantId: string) {
    return this.staffService.getStaff(tenantId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Post('invite')
  inviteStaff(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: { email: string; name: string; role: string },
  ) {
    return this.staffService.inviteStaff(tenantId, user.sub, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Patch(':userId/role')
  updateRole(
    @CurrentTenant() tenantId: string,
    @Param('userId') userId: string,
    @Body() body: { role: string },
  ) {
    return this.staffService.updateRole(tenantId, userId, body.role);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Delete(':userId')
  removeStaff(@CurrentTenant() tenantId: string, @Param('userId') userId: string) {
    return this.staffService.removeStaff(tenantId, userId);
  }
}
