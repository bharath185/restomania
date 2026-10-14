import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SuperAdminService } from './super-admin.service';
import { UserRole } from '@repo/shared';

@ApiTags('Super Admin')
@Controller('super-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('analytics')
  getPlatformStats() {
    return this.superAdminService.getPlatformStats();
  }

  @Get('restaurants')
  getRestaurants(@Query() query: { page?: number; limit?: number; search?: string }) {
    return this.superAdminService.getRestaurants(query);
  }

  @Get('restaurants/:id')
  getRestaurantById(@Param('id') id: string) {
    return this.superAdminService.getRestaurantById(id);
  }

  @Post('restaurants')
  onboardRestaurant(@Body() dto: Parameters<SuperAdminService['onboardRestaurant']>[0]) {
    return this.superAdminService.onboardRestaurant(dto);
  }

  @Patch('restaurants/:id')
  updateRestaurant(
    @Param('id') id: string,
    @Body() dto: Parameters<SuperAdminService['updateRestaurant']>[1],
  ) {
    return this.superAdminService.updateRestaurant(id, dto);
  }
}
