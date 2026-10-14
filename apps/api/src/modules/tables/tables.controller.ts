import {
  Controller, Get, Post, Patch, Param, Body, Res, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TablesService } from './tables.service';
import { PdfService } from '../pdf/pdf.service';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { UserRole } from '@repo/shared';

class CreateTableDto {
  @IsString() tableNumber: string = '';
  @IsInt() @IsOptional() capacity?: number;
  @IsString() @IsOptional() section?: string;
}

@ApiTags('Tables')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly pdfService: PdfService,
  ) {}

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Get('tables')
  getTables(@CurrentTenant() tenantId: string) {
    return this.tablesService.getTables(tenantId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Post('tables')
  @HttpCode(201)
  createTable(@CurrentTenant() tenantId: string, @Body() dto: CreateTableDto) {
    return this.tablesService.createTable(tenantId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('tables/:id')
  updateTable(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateTableDto>,
  ) {
    return this.tablesService.updateTable(tenantId, id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Post('tables/:id/qr')
  generateQr(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tablesService.generateQr(tenantId, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Get('tables/:id/qr/pdf')
  async downloadQrPdf(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.pdfService.generateQrCardPdf(tenantId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="table-qr.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @Public()
  @Post('qr/verify')
  verifyQr(@Body() body: { token: string }) {
    return this.tablesService.verifyQrToken(body.token);
  }
}
