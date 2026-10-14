import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateQrCardPdf(restaurantId: string, tableId: string): Promise<Buffer> {
    const table = await this.prisma.restaurantTable.findFirst({
      where: { id: tableId, restaurantId },
      include: {
        qrTokens: { where: { isActive: true }, take: 1 },
        restaurant: { include: { branding: true } },
      },
    });

    if (!table) throw new Error('Table not found');

    const token = table.qrTokens[0]?.token;
    if (!token) throw new Error('No active QR token for this table');

    const platformDomain = process.env.PLATFORM_DOMAIN ?? 'platform.com';
    const url = `https://${platformDomain}/qr/${token}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 200, margin: 1 });

    const branding = table.restaurant.branding;
    const primaryColor = branding?.primaryColor ?? '#FF6B35';
    const restaurantName = table.restaurant.name;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background: white; }
  .card {
    width: 300px; border: 2px solid ${primaryColor}; border-radius: 12px;
    padding: 24px; text-align: center; margin: 0 auto;
  }
  .restaurant-name { color: ${primaryColor}; font-size: 20px; font-weight: bold; margin-bottom: 4px; }
  .table-label { color: #666; font-size: 14px; margin-bottom: 16px; }
  .qr-image { width: 180px; height: 180px; }
  .scan-text { color: #333; font-size: 12px; margin-top: 12px; }
  .footer { color: #999; font-size: 10px; margin-top: 8px; }
</style>
</head>
<body>
  <div class="card">
    ${branding?.logoUrl ? `<img src="${branding.logoUrl}" style="height:50px;margin-bottom:8px;">` : ''}
    <div class="restaurant-name">${restaurantName}</div>
    <div class="table-label">Table ${table.tableNumber}</div>
    <img src="${qrDataUrl}" class="qr-image" alt="QR Code">
    <div class="scan-text">Scan to Order</div>
    <div class="footer">${url.substring(0, 40)}...</div>
  </div>
</body>
</html>`;

    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        width: '350px',
        height: '450px',
        printBackground: true,
      });
      await browser.close();
      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error('Puppeteer error, returning HTML fallback', err);
      return Buffer.from(html);
    }
  }
}
