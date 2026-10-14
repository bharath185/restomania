import { Controller, Get, Patch, Body, UseGuards, UploadedFile, UseInterceptors, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { SettingsService } from './settings.service';
import { StorageService } from '../storage/storage.service';
import { UserRole } from '@repo/shared';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly storageService: StorageService,
  ) {}

  @Public()
  @Get('branding')
  getBranding(@CurrentTenant() tenantId: string) {
    return this.settingsService.getBranding(tenantId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Patch('branding')
  updateBranding(@CurrentTenant() tenantId: string, @Body() dto: Parameters<SettingsService['updateBranding']>[1]) {
    return this.settingsService.updateBranding(tenantId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Post('branding/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @CurrentTenant() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.storageService.uploadImage(file, `${tenantId}/logos`);
    await this.settingsService.updateBranding(tenantId, { logoUrl: url });
    return { logoUrl: url };
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Post('branding/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @CurrentTenant() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.storageService.uploadImage(file, `${tenantId}/covers`);
    await this.settingsService.updateBranding(tenantId, { coverImageUrl: url });
    return { coverImageUrl: url };
  }

  @Public()
  @Get('hours')
  getHours(@CurrentTenant() tenantId: string) {
    return this.settingsService.getHours(tenantId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('hours')
  updateHours(@CurrentTenant() tenantId: string, @Body() body: { hours: Parameters<SettingsService['updateHours']>[1] }) {
    return this.settingsService.updateHours(tenantId, body.hours);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Get('restaurant')
  getRestaurantInfo(@CurrentTenant() tenantId: string) {
    return this.settingsService.getRestaurantInfo(tenantId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN)
  @Patch('restaurant')
  updateRestaurantInfo(
    @CurrentTenant() tenantId: string,
    @Body() dto: Parameters<SettingsService['updateRestaurantInfo']>[1],
  ) {
    return this.settingsService.updateRestaurantInfo(tenantId, dto);
  }
}
