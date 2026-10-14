import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserRole } from '@repo/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { restaurantRoles: { include: { restaurant: true } } },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const restaurantRole = user.restaurantRoles[0];
    const restaurantId = restaurantRole?.restaurantId ?? null;
    const effectiveRole = restaurantRole?.role ?? user.role;

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: effectiveRole,
      restaurantId,
    });

    const refreshToken = await this.generateRefreshToken(user.id, restaurantId, userAgent, ipAddress);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        restaurantId,
      },
    };
  }

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new ConflictException('Email or phone is required');
    }

    const orConditions: Array<{ email?: string; phone?: string }> = [];
    if (dto.email) orConditions.push({ email: dto.email });
    if (dto.phone) orConditions.push({ phone: dto.phone });

    const existing = await this.prisma.user.findFirst({
      where: { OR: orConditions },
    });

    if (existing) throw new ConflictException('User already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        passwordHash,
        role: UserRole.CUSTOMER,
      },
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async refreshTokens(refreshToken: string, userAgent?: string, ipAddress?: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = stored.user;
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: stored.restaurantId,
    });

    const newRefreshToken = await this.generateRefreshToken(
      user.id,
      stored.restaurantId,
      userAgent,
      ipAddress,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If this email exists, a reset link has been sent' };

    // TODO: Generate reset token, store it, send email via NotificationsService
    return { message: 'If this email exists, a reset link has been sent' };
  }

  private async generateRefreshToken(
    userId: string,
    restaurantId: string | null,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        restaurantId,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return token;
  }
}
