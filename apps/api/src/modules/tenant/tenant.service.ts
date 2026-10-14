import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveByHostOrSlug(identifier: { host?: string; slug?: string; id?: string }) {
    const { host, slug, id } = identifier;
    let restaurant = null;

    if (id) {
      restaurant = await this.prisma.restaurant.findFirst({
        where: { id, isActive: true, deletedAt: null },
        include: { branding: true, hours: true },
      });
    } else if (slug) {
      restaurant = await this.prisma.restaurant.findFirst({
        where: { slug, isActive: true, deletedAt: null },
        include: { branding: true, hours: true },
      });
    } else if (host) {
      const platformDomain = process.env.PLATFORM_DOMAIN ?? 'localhost';
      if (host.includes('.') && (host.endsWith(`.${platformDomain}`) || host.endsWith('.localhost'))) {
        const sub = host.split('.')[0];
        restaurant = await this.prisma.restaurant.findFirst({
          where: { slug: sub, isActive: true, deletedAt: null },
          include: { branding: true, hours: true },
        });
      } else if (host !== 'localhost' && host !== '127.0.0.1') {
        restaurant = await this.prisma.restaurant.findFirst({
          where: { customDomain: host, isActive: true, deletedAt: null },
          include: { branding: true, hours: true },
        });
      }
    }

    // Dev fallback
    if (!restaurant) {
      restaurant = await this.prisma.restaurant.findFirst({
        where: { isActive: true, deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: { branding: true, hours: true },
      });
    }

    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async getFullMenu(restaurantId: string) {
    const categories = await this.prisma.menuCategory.findMany({
      where: { restaurantId, isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
            addons: { where: { isActive: true } },
          },
        },
      },
    });

    return categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        let parsedTags: string[] = [];
        try {
          parsedTags = typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags ?? []);
        } catch {
          parsedTags = [];
        }
        return {
          ...item,
          tags: parsedTags,
        };
      }),
    }));
  }
}
