import { Injectable, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { generatePassword, DEFAULT_MENU_CATEGORIES } from '@repo/shared';
import { createHmac, randomBytes } from 'crypto';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('onboarding') private readonly onboardingQueue: Queue,
  ) {}

  async getRestaurants(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }] }
      : {};

    const [restaurants, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { branding: true, plan: true },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return { restaurants, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getRestaurantById(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: { branding: true, plan: true, hours: true },
    });
  }

  async onboardRestaurant(dto: {
    name: string; slug: string; ownerName: string; ownerEmail: string;
    phone?: string; address?: string; city?: string; country?: string;
    currency?: string; taxRate?: number; serviceCharge?: number; gstNumber?: string;
    planId?: string; tableCount?: number;
    branding?: Partial<{ primaryColor: string; welcomeText: string; tagline: string }>;
  }) {
    const existing = await this.prisma.restaurant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Restaurant with subdomain/slug '${dto.slug}' already exists`);
    }

    try {
      // Create restaurant
      const restaurant = await this.prisma.restaurant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          ownerEmail: dto.ownerEmail,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          country: dto.country ?? 'IN',
          currency: dto.currency ?? 'INR',
          taxRate: dto.taxRate ?? 0,
          serviceCharge: dto.serviceCharge ?? 0,
          gstNumber: dto.gstNumber,
          planId: dto.planId,
          isVerified: true,
        },
      });

      // Create branding
      await this.prisma.restaurantBranding.create({
        data: {
          restaurantId: restaurant.id,
          primaryColor: dto.branding?.primaryColor ?? '#FF6B35',
          welcomeText: dto.branding?.welcomeText,
          tagline: dto.branding?.tagline,
        },
      });

      // Create or link owner user
      const tempPassword = generatePassword(12);
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      let owner = await this.prisma.user.findUnique({
        where: { email: dto.ownerEmail },
      });

      if (!owner) {
        owner = await this.prisma.user.create({
          data: {
            email: dto.ownerEmail,
            name: dto.ownerName,
            passwordHash,
            role: 'owner',
          },
        });
      }

      await this.prisma.userRestaurantRole.upsert({
        where: {
          userId_restaurantId: {
            userId: owner.id,
            restaurantId: restaurant.id,
          },
        },
        update: { role: 'owner' },
        create: {
          userId: owner.id,
          restaurantId: restaurant.id,
          role: 'owner',
        },
      });

      // Seed categories
      await this.prisma.menuCategory.createMany({
        data: DEFAULT_MENU_CATEGORIES.map((cat) => ({
          restaurantId: restaurant.id,
          name: cat.name,
          sortOrder: cat.sortOrder,
        })),
      });

      // Seed tables & QR codes
      const tableCount = dto.tableCount ?? 5;
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

      return {
        message: 'Restaurant onboarded successfully',
        id: restaurant.id,
        slug: restaurant.slug,
        tempPassword,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new ConflictException(err.message);
      }
      throw err;
    }
  }

  async updateRestaurant(id: string, dto: Partial<{ isActive: boolean; planId: string }>) {
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  async getPlatformStats() {
    const [totalRestaurants, activeRestaurants, totalOrders, totalRevenue] = await Promise.all([
      this.prisma.restaurant.count(),
      this.prisma.restaurant.count({ where: { isActive: true } }),
      this.prisma.order.count({ where: { status: { not: 'cancelled' } } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'cancelled' } },
      }),
    ]);

    return {
      totalRestaurants,
      activeRestaurants,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
    };
  }
}
