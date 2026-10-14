import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';
import { generatePassword, DEFAULT_MENU_CATEGORIES } from '@repo/shared';
import { createHmac, randomBytes } from 'crypto';

@Processor('onboarding')
export class OnboardingProcessor {
  private readonly logger = new Logger(OnboardingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Process('onboard')
  async handleOnboard(job: Job<{
    name: string; slug: string; ownerName: string; ownerEmail: string;
    phone?: string; address?: string; city?: string; country?: string;
    currency?: string; taxRate?: number; serviceCharge?: number; gstNumber?: string;
    planId?: string; tableCount?: number;
    branding?: Partial<{ primaryColor: string; welcomeText: string; tagline: string }>;
  }>) {
    const data = job.data;
    this.logger.log(`Processing onboarding for ${data.slug}`);

    try {
      const restaurant = await this.prisma.restaurant.create({
        data: {
          name: data.name,
          slug: data.slug,
          ownerEmail: data.ownerEmail,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country ?? 'IN',
          currency: data.currency ?? 'INR',
          taxRate: data.taxRate ?? 0,
          serviceCharge: data.serviceCharge ?? 0,
          gstNumber: data.gstNumber,
          planId: data.planId,
          isVerified: true,
        },
      });

      await this.prisma.restaurantBranding.create({
        data: {
          restaurantId: restaurant.id,
          primaryColor: data.branding?.primaryColor ?? '#FF6B35',
          welcomeText: data.branding?.welcomeText,
          tagline: data.branding?.tagline,
        },
      });

      const tempPassword = generatePassword(12);
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const owner = await this.prisma.user.upsert({
        where: { email: data.ownerEmail },
        update: {},
        create: {
          email: data.ownerEmail,
          name: data.ownerName,
          passwordHash,
          role: 'owner',
        },
      });

      await this.prisma.userRestaurantRole.create({
        data: {
          userId: owner.id,
          restaurantId: restaurant.id,
          role: 'owner',
        },
      });

      await this.prisma.menuCategory.createMany({
        data: DEFAULT_MENU_CATEGORIES.map((cat) => ({
          restaurantId: restaurant.id,
          name: cat.name,
          sortOrder: cat.sortOrder,
        })),
      });

      const tableCount = data.tableCount ?? 5;
      const secret = process.env.QR_HMAC_SECRET ?? 'changeme-qr-secret';

      for (let i = 1; i <= tableCount; i++) {
        const table = await this.prisma.restaurantTable.create({
          data: {
            restaurantId: restaurant.id,
            tableNumber: String(i),
            capacity: 4,
          },
        });

        const nonce = randomBytes(8).toString('hex');
        const payload = `${restaurant.id}|${table.id}|${nonce}`;
        const token = createHmac('sha256', secret).update(payload).digest('hex');

        await this.prisma.qrToken.create({
          data: { restaurantId: restaurant.id, tableId: table.id, token, tokenType: 'table' },
        });
      }

      const platformDomain = process.env.PLATFORM_DOMAIN ?? 'platform.com';
      const loginUrl = `https://${data.slug}.${platformDomain}/dashboard/login`;
      const branding = await this.prisma.restaurantBranding.findUnique({
        where: { restaurantId: restaurant.id },
      });

      await this.notificationsService.sendWelcomeEmail({
        to: data.ownerEmail,
        restaurantName: data.name,
        ownerName: data.ownerName,
        loginUrl,
        tempPassword,
        primaryColor: branding?.primaryColor,
      });

      this.logger.log(`Onboarding complete for ${data.slug}`);
    } catch (err) {
      this.logger.error(`Onboarding failed for ${data.slug}`, err);
      throw err;
    }
  }
}
