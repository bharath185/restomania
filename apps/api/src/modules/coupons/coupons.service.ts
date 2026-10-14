import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCoupons(restaurantId: string) {
    return this.prisma.coupon.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(restaurantId: string, dto: {
    code: string; description?: string; discountType: string;
    discountValue: number; minOrderValue?: number; maxDiscount?: number;
    maxUses?: number; validFrom?: string; validUntil?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        restaurantId,
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue ?? 0,
        maxDiscount: dto.maxDiscount,
        maxUses: dto.maxUses,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
  }

  async updateCoupon(restaurantId: string, id: string, dto: Partial<{ isActive: boolean; validUntil: string }>) {
    const coupon = await this.prisma.coupon.findFirst({ where: { id, restaurantId } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.update({ where: { id }, data: dto });
  }

  async validateCoupon(restaurantId: string, code: string, orderTotal: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        restaurantId,
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
      },
    });

    if (!coupon) throw new NotFoundException('Coupon not found or expired');
    if (orderTotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(`Minimum order value is ${coupon.minOrderValue}`);
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), orderTotal);
    }

    return { coupon, discountAmount: Math.round(discountAmount * 100) / 100 };
  }
}
