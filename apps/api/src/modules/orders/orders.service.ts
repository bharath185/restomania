import {
  Injectable, NotFoundException, BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlaceOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/orders.dto';
import { OrderStatus, isValidStatusTransition, calculateOrderTotals } from '@repo/shared';
import { KitchenGateway } from '../kitchen/kitchen.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async placeOrder(restaurantId: string, dto: PlaceOrderDto, customerId?: string, qrTokenId?: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    let itemsTotal = 0;
    const itemsData = [];

    for (const orderItem of dto.items) {
      const menuItem = await this.prisma.menuItem.findFirst({
        where: { id: orderItem.itemId, restaurantId, deletedAt: null, isActive: true },
        include: { variants: true, addons: true },
      });

      if (!menuItem) throw new NotFoundException(`Item ${orderItem.itemId} not found`);
      if (!menuItem.isInStock) throw new BadRequestException(`${menuItem.name} is out of stock`);

      let itemPrice = Number(menuItem.discountedPrice ?? menuItem.basePrice);
      const variantData: { variantId?: string; variantName: string; priceDelta: number }[] = [];
      const addonData: { addonId?: string; addonName: string; price: number }[] = [];

      if (orderItem.variantId) {
        const variant = menuItem.variants.find((v) => v.id === orderItem.variantId);
        if (!variant) throw new BadRequestException(`Variant not found for ${menuItem.name}`);
        itemPrice += Number(variant.priceDelta);
        variantData.push({
          variantId: variant.id,
          variantName: variant.name,
          priceDelta: Number(variant.priceDelta),
        });
      }

      for (const addonId of (orderItem.addonIds ?? [])) {
        const addon = menuItem.addons.find((a) => a.id === addonId);
        if (!addon) throw new BadRequestException(`Addon ${addonId} not found`);
        itemPrice += Number(addon.price);
        addonData.push({ addonId: addon.id, addonName: addon.name, price: Number(addon.price) });
      }

      const lineTotal = Math.round(itemPrice * orderItem.quantity * 100) / 100;
      itemsTotal += lineTotal;

      itemsData.push({
        restaurantId,
        itemId: menuItem.id,
        itemName: menuItem.name,
        itemPrice,
        quantity: orderItem.quantity,
        specialNotes: orderItem.specialNotes,
        totalPrice: lineTotal,
        variants: { create: variantData },
        addons: { create: addonData },
      });
    }

    let discountAmount = 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          restaurantId,
          code: dto.couponCode.toUpperCase(),
          isActive: true,
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });
      if (coupon && itemsTotal >= Number(coupon.minOrderValue)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (itemsTotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
        } else {
          discountAmount = Math.min(Number(coupon.discountValue), itemsTotal);
        }
        couponId = coupon.id;
      }
    }

    const totals = calculateOrderTotals(
      itemsTotal,
      Number(restaurant.taxRate),
      Number(restaurant.serviceCharge),
      discountAmount,
    );

    const lastOrder = await this.prisma.order.findFirst({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });
    const seq = lastOrder ? parseInt(lastOrder.orderNumber.replace('ORD-', ''), 10) + 1 : 1;
    const orderNumber = `ORD-${String(seq).padStart(4, '0')}`;

    const order = await this.prisma.order.create({
      data: {
        restaurantId,
        customerId,
        qrTokenId,
        orderNumber,
        orderType: dto.orderType,
        status: 'placed',
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        serviceCharge: totals.serviceCharge,
        totalAmount: totals.total,
        couponId,
        specialNotes: dto.specialNotes,
        items: { create: itemsData },
        payments: {
          create: {
            restaurantId,
            method: dto.paymentMethod,
            amount: totals.total,
            gateway: dto.paymentMethod === 'razorpay' ? 'razorpay' : null,
          },
        },
        statusHistory: {
          create: {
            restaurantId,
            status: 'placed',
            changedBy: customerId,
          },
        },
      },
      include: {
        items: { include: { variants: true, addons: true } },
        payments: true,
        table: true,
      },
    });

    if (couponId) {
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    void this.kitchenGateway.notifyNewOrder(restaurantId, order);

    return order;
  }

  async getOrders(restaurantId: string, query: OrderQueryDto) {
    const { status, orderType, from, to, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { restaurantId };
    if (status) where['status'] = status;
    if (orderType) where['orderType'] = orderType;
    if (from || to) {
      where['createdAt'] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { variants: true, addons: true } },
          payments: true,
          table: true,
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOrderById(restaurantId: string | null | undefined, id: string) {
    const where: Record<string, unknown> = { id };
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: { include: { variants: true, addons: true } },
        payments: true,
        table: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        coupon: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    restaurantId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
    userId?: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const currentStatus = order.status as unknown as OrderStatus;
    const newStatus = dto.status as OrderStatus;

    if (!isValidStatusTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          ...(dto.estimatedTime ? { estimatedTime: dto.estimatedTime } : {}),
        },
        include: {
          items: { include: { variants: true, addons: true } },
          payments: true,
          table: true,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          restaurantId,
          status: newStatus,
          changedBy: userId,
          note: dto.note,
        },
      });

      return updatedOrder;
    });

    void this.kitchenGateway.notifyOrderStatus(restaurantId, orderId, newStatus, userId ?? 'system');

    return updated;
  }

  async cancelOrder(restaurantId: string, orderId: string, userId?: string) {
    return this.updateStatus(restaurantId, orderId, { status: OrderStatus.CANCELLED }, userId);
  }

  async getCustomerOrders(customerId: string, restaurantId: string) {
    return this.prisma.order.findMany({
      where: { customerId, restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { variants: true, addons: true } },
        payments: true,
        table: true,
      },
    });
  }
}
