import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHmac, randomBytes } from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTables(restaurantId: string) {
    return this.prisma.restaurantTable.findMany({
      where: { restaurantId, isActive: true },
      orderBy: { tableNumber: 'asc' },
      include: { qrTokens: { where: { isActive: true }, take: 1 } },
    });
  }

  async createTable(restaurantId: string, dto: { tableNumber: string; capacity?: number; section?: string }) {
    const existing = await this.prisma.restaurantTable.findFirst({
      where: { restaurantId, tableNumber: dto.tableNumber },
    });
    if (existing) throw new ConflictException(`Table ${dto.tableNumber} already exists`);

    return this.prisma.restaurantTable.create({
      data: { restaurantId, ...dto },
    });
  }

  async updateTable(restaurantId: string, tableId: string, dto: Partial<{ tableNumber: string; capacity: number; section: string; isActive: boolean }>) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: { id: tableId, restaurantId },
    });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.restaurantTable.update({ where: { id: tableId }, data: dto });
  }

  async generateQr(restaurantId: string, tableId: string) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: { id: tableId, restaurantId },
      include: { restaurant: true },
    });
    if (!table) throw new NotFoundException('Table not found');

    await this.prisma.qrToken.updateMany({
      where: { restaurantId, tableId, isActive: true },
      data: { isActive: false },
    });

    const nonce = randomBytes(8).toString('hex');
    const secret = process.env.QR_HMAC_SECRET ?? 'changeme-qr-secret';
    const payload = `${restaurantId}|${tableId}|${nonce}`;
    const token = createHmac('sha256', secret).update(payload).digest('hex');

    const qrToken = await this.prisma.qrToken.create({
      data: {
        restaurantId,
        tableId,
        token,
        tokenType: 'table',
      },
    });

    const platformDomain = process.env.PLATFORM_DOMAIN ?? 'platform.com';
    const url = `https://${platformDomain}/qr/${token}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
    });

    return {
      token: qrToken.token,
      qrCodeDataUrl: qrDataUrl,
      url,
      tableNumber: table.tableNumber,
    };
  }

  async verifyQrToken(token: string) {
    const qrToken = await this.prisma.qrToken.findFirst({
      where: {
        token,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      include: {
        restaurant: { include: { branding: true } },
        table: true,
      },
    });

    if (!qrToken) throw new NotFoundException('QR token not found or expired');

    await this.prisma.qrToken.update({
      where: { id: qrToken.id },
      data: { scans: { increment: 1 } },
    });

    return {
      restaurantId: qrToken.restaurantId,
      restaurantSlug: qrToken.restaurant.slug,
      tableId: qrToken.tableId,
      tableNumber: qrToken.table?.tableNumber ?? null,
      tokenType: qrToken.tokenType,
      branding: qrToken.restaurant.branding,
    };
  }
}
