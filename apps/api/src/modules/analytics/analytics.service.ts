import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, allOrders, pendingOrders, topItems] = await Promise.all([
      this.prisma.order.findMany({
        where: { restaurantId, createdAt: { gte: today, lt: tomorrow }, status: { not: 'cancelled' } },
        select: { totalAmount: true, status: true },
      }),
      this.prisma.order.count({ where: { restaurantId, createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { restaurantId, status: { in: ['placed', 'accepted', 'preparing'] } } }),
      this.prisma.orderItem.groupBy({
        by: ['itemId', 'itemName'],
        where: { restaurantId, order: { createdAt: { gte: today } } },
        _count: { itemId: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { itemId: 'desc' } },
        take: 5,
      }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const avgOrderValue = allOrders > 0 ? todayRevenue / allOrders : 0;

    return {
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      todayOrders: allOrders,
      pendingOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      topDishes: topItems.map((item) => ({
        itemId: item.itemId,
        name: item.itemName,
        orderCount: item._count.itemId,
        revenue: Number(item._sum.totalPrice ?? 0),
      })),
    };
  }

  async getSalesReport(restaurantId: string, from: string, to: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: new Date(from), lte: new Date(to) },
        status: { not: 'cancelled' },
      },
      select: { createdAt: true, totalAmount: true, orderType: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    return { count: orders.length, totalRevenue, orders };
  }

  async getTopDishes(restaurantId: string, from?: string, to?: string) {
    const dateFilter = from && to ? { gte: new Date(from), lte: new Date(to) } : undefined;
    return this.prisma.orderItem.groupBy({
      by: ['itemId', 'itemName'],
      where: { restaurantId, ...(dateFilter ? { order: { createdAt: dateFilter } } : {}) },
      _count: { itemId: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { itemId: 'desc' } },
      take: 10,
    });
  }

  async getPeakHours(restaurantId: string) {
    const orders = await this.prisma.order.findMany({
      where: { restaurantId },
      select: { createdAt: true },
    });

    const hourCounts: number[] = new Array(24).fill(0) as number[];
    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      if (hourCounts[hour] !== undefined) hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({ hour, count }));
  }
}
