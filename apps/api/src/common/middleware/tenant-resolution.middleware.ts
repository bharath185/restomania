import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService, tenantStorage } from '../../prisma/prisma.service';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
    }
  }
}

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    // Skip super-admin, auth, health, and docs routes
    if (
      req.path.startsWith('/api/v1/super-admin') ||
      req.path.startsWith('/api/v1/auth') ||
      req.path === '/api/v1/health' ||
      req.path.startsWith('/api/docs')
    ) {
      tenantStorage.run({ tenantId: null }, () => next());
      return;
    }

    let tenantId: string | null = null;
    let tenantSlug: string | null = null;

    // 1. Direct header override (for mobile app, api tests, or client explicit routing)
    const headerSlug = (req.headers['x-tenant-slug'] || req.headers['x-restaurant-slug']) as string | undefined;
    const headerId = (req.headers['x-tenant-id'] || req.headers['x-restaurant-id']) as string | undefined;

    // 2. Query param override (e.g. ?tenant=spicegarden or ?slug=zensushi)
    const querySlug = (req.query['tenant'] || req.query['slug']) as string | undefined;
    const queryId = (req.query['tenantId'] || req.query['restaurantId']) as string | undefined;

    // 3. Subdomain extraction from Host or Referer
    const host = req.hostname || '';
    const referer = req.headers.referer || '';
    let hostSlug: string | null = null;

    const platformDomain = process.env.PLATFORM_DOMAIN ?? 'localhost';

    if (host.includes('.')) {
      if (host.endsWith(`.${platformDomain}`) || host.endsWith('.localhost')) {
        hostSlug = host.split('.')[0] || null;
      }
    } else if (referer) {
      try {
        const refUrl = new URL(referer);
        if (refUrl.hostname.includes('.') && (refUrl.hostname.endsWith(`.${platformDomain}`) || refUrl.hostname.endsWith('.localhost'))) {
          hostSlug = refUrl.hostname.split('.')[0] || null;
        }
      } catch {
        // invalid referer url
      }
    }

    const targetId = headerId || queryId;
    const targetSlug = headerSlug || querySlug || hostSlug;

    if (targetId) {
      const restaurant = await this.prisma.restaurant.findFirst({
        where: { id: targetId, isActive: true, deletedAt: null },
      });
      if (restaurant) {
        tenantId = restaurant.id;
        tenantSlug = restaurant.slug;
      }
    } else if (targetSlug) {
      const restaurant = await this.prisma.restaurant.findFirst({
        where: { slug: targetSlug, isActive: true, deletedAt: null },
      });
      if (restaurant) {
        tenantId = restaurant.id;
        tenantSlug = restaurant.slug;
      }
    } else if (host && host !== 'localhost' && host !== '127.0.0.1') {
      // Check custom domain
      const restaurant = await this.prisma.restaurant.findFirst({
        where: { customDomain: host, isActive: true, deletedAt: null },
      });
      if (restaurant) {
        tenantId = restaurant.id;
        tenantSlug = restaurant.slug;
      }
    }

    // 4. In development fallback: default to the first active restaurant
    if (!tenantId && process.env.NODE_ENV !== 'production') {
      const first = await this.prisma.restaurant.findFirst({
        where: { isActive: true, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
      if (first) {
        tenantId = first.id;
        tenantSlug = first.slug;
      }
    }

    if (tenantId) {
      req.tenantId = tenantId;
      req.tenantSlug = tenantSlug ?? undefined;
    }

    tenantStorage.run({ tenantId }, () => next());
  }
}
