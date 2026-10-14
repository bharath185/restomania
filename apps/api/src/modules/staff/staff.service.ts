import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { generatePassword } from '@repo/shared';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async getStaff(restaurantId: string) {
    return this.prisma.userRestaurantRole.findMany({
      where: { restaurantId },
      include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
    });
  }

  async inviteStaff(restaurantId: string, inviterId: string, dto: { email: string; name: string; role: string }) {
    const tempPassword = generatePassword(12);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.upsert({
      where: { email: dto.email },
      update: {},
      create: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role,
      },
    });

    await this.prisma.userRestaurantRole.upsert({
      where: { userId_restaurantId: { userId: user.id, restaurantId } },
      update: { role: dto.role },
      create: {
        userId: user.id,
        restaurantId,
        role: dto.role,
        invitedBy: inviterId,
      },
    });

    return { user: { id: user.id, email: user.email, name: user.name }, tempPassword };
  }

  async updateRole(restaurantId: string, userId: string, role: string) {
    const record = await this.prisma.userRestaurantRole.findFirst({
      where: { userId, restaurantId },
    });
    if (!record) throw new NotFoundException('Staff member not found');
    return this.prisma.userRestaurantRole.update({
      where: { id: record.id },
      data: { role },
    });
  }

  async removeStaff(restaurantId: string, userId: string) {
    const record = await this.prisma.userRestaurantRole.findFirst({
      where: { userId, restaurantId },
    });
    if (!record) throw new NotFoundException('Staff member not found');
    return this.prisma.userRestaurantRole.delete({ where: { id: record.id } });
  }
}
