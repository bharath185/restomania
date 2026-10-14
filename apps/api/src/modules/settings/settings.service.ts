import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBranding(restaurantId: string) {
    return this.prisma.restaurantBranding.findUnique({ where: { restaurantId } });
  }

  async updateBranding(restaurantId: string, dto: Partial<{
    primaryColor: string; secondaryColor: string; accentColor: string;
    fontFamily: string; logoUrl: string; faviconUrl: string; coverImageUrl: string;
    welcomeText: string; tagline: string; footerText: string;
    language: string; theme: string; customCss: string;
  }>) {
    return this.prisma.restaurantBranding.upsert({
      where: { restaurantId },
      update: dto,
      create: { restaurantId, ...dto },
    });
  }

  async getHours(restaurantId: string) {
    return this.prisma.restaurantHour.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateHours(
    restaurantId: string,
    hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed?: boolean }>,
  ) {
    await this.prisma.restaurantHour.deleteMany({ where: { restaurantId } });
    return this.prisma.restaurantHour.createMany({
      data: hours.map((h) => ({ restaurantId, ...h })),
    });
  }

  async getRestaurantInfo(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true, name: true, slug: true, phone: true, address: true,
        city: true, country: true, currency: true, timezone: true,
        taxRate: true, serviceCharge: true, gstNumber: true,
        isActive: true, ownerEmail: true,
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async updateRestaurantInfo(restaurantId: string, dto: Partial<{
    name: string; phone: string; address: string; city: string;
    currency: string; timezone: string; taxRate: number;
    serviceCharge: number; gstNumber: string;
  }>) {
    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: dto,
    });
  }
}
