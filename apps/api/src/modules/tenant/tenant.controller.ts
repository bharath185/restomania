import { Controller, Get, Req, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { TenantService } from './tenant.service';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Public()
  @Get('resolve')
  @ApiOperation({ summary: 'Resolve restaurant branding from host or query' })
  async resolve(
    @Req() req: Request,
    @Query('slug') slugQuery?: string,
    @Query('tenant') tenantQuery?: string,
    @Query('id') idQuery?: string,
  ) {
    const slug = slugQuery || tenantQuery || (req.headers['x-tenant-slug'] as string) || undefined;
    const id = idQuery || (req.headers['x-tenant-id'] as string) || req.tenantId;
    return this.tenantService.resolveByHostOrSlug({
      host: req.hostname,
      slug,
      id,
    });
  }

  @Public()
  @Get('menu')
  @ApiOperation({ summary: 'Get full menu for current tenant' })
  async getMenu(@CurrentTenant() tenantId: string | null) {
    if (!tenantId) throw new NotFoundException('Restaurant not found');
    return this.tenantService.getFullMenu(tenantId);
  }
}
