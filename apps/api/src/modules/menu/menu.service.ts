import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateVariantDto,
  CreateAddonDto,
} from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ─── Categories ──────────────────────────────────────────────────────────────

  async getCategories(restaurantId: string) {
    return this.prisma.menuCategory.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  }

  async createCategory(restaurantId: string, dto: CreateCategoryDto) {
    return this.prisma.menuCategory.create({
      data: { ...dto, restaurantId },
    });
  }

  async updateCategory(restaurantId: string, id: string, dto: UpdateCategoryDto) {
    await this.assertCategoryOwnership(id, restaurantId);
    return this.prisma.menuCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(restaurantId: string, id: string) {
    await this.assertCategoryOwnership(id, restaurantId);
    return this.prisma.menuCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // ─── Items ────────────────────────────────────────────────────────────────────

  async getItems(restaurantId: string, categoryId?: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId, deletedAt: null, ...(categoryId ? { categoryId } : {}) },
      orderBy: { sortOrder: 'asc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
        addons: { where: { isActive: true } },
        category: { select: { id: true, name: true } },
      },
    });
    return { items, total: items.length };
  }

  async getItem(restaurantId: string, id: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id, restaurantId, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        addons: { where: { isActive: true } },
        category: true,
      },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async createItem(restaurantId: string, dto: CreateMenuItemDto) {
    // Validate category belongs to restaurant
    const category = await this.prisma.menuCategory.findFirst({
      where: { id: dto.categoryId, restaurantId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const { tags, ...rest } = dto;
    return this.prisma.menuItem.create({
      data: {
        ...rest,
        restaurantId,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags ?? '[]'),
      },
      include: { images: true, variants: true, addons: true },
    });
  }

  async updateItem(restaurantId: string, id: string, dto: UpdateMenuItemDto) {
    await this.assertItemOwnership(id, restaurantId);
    const { tags, ...rest } = dto;
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...rest,
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? JSON.stringify(tags) : tags } : {}),
        updatedAt: new Date(),
      },
      include: { images: true, variants: true, addons: true },
    });
  }

  async deleteItem(restaurantId: string, id: string) {
    await this.assertItemOwnership(id, restaurantId);
    return this.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async toggleStock(restaurantId: string, id: string, isInStock: boolean) {
    await this.assertItemOwnership(id, restaurantId);
    return this.prisma.menuItem.update({
      where: { id },
      data: { isInStock },
    });
  }

  async getItemById(restaurantId: string, id: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id, restaurantId, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        addons: { where: { isActive: true } },
        category: true,
      },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async uploadItemImage(
    restaurantId: string,
    itemId: string,
    buffer: Buffer,
    mimeType: string,
    isPrimary = false,
  ) {
    await this.assertItemOwnership(itemId, restaurantId);
    const url = await this.storage.uploadImage(buffer, `restaurants/${restaurantId}/menu`, mimeType);

    // If primary, unset other primaries
    if (isPrimary) {
      await this.prisma.itemImage.updateMany({
        where: { itemId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.itemImage.create({
      data: { itemId, url, isPrimary },
    });
  }

  async deleteItemImage(restaurantId: string, itemId: string, imageId: string) {
    await this.assertItemOwnership(itemId, restaurantId);
    const image = await this.prisma.itemImage.findFirst({ where: { id: imageId, itemId } });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.itemImage.delete({ where: { id: imageId } });
    // Extract key from URL and delete from S3
    const key = image.url.split('/').slice(3).join('/');
    await this.storage.deleteFile(key);
    return { message: 'Image deleted' };
  }

  // ─── Variants ────────────────────────────────────────────────────────────────

  async createVariant(restaurantId: string, itemId: string, dto: CreateVariantDto) {
    await this.assertItemOwnership(itemId, restaurantId);
    return this.prisma.itemVariant.create({
      data: { ...dto, itemId, restaurantId },
    });
  }

  async updateVariant(restaurantId: string, id: string, dto: Partial<CreateVariantDto> & { isActive?: boolean }) {
    const variant = await this.prisma.itemVariant.findFirst({ where: { id, restaurantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    return this.prisma.itemVariant.update({ where: { id }, data: dto });
  }

  async deleteVariant(restaurantId: string, id: string) {
    const variant = await this.prisma.itemVariant.findFirst({ where: { id, restaurantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    return this.prisma.itemVariant.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Addons ──────────────────────────────────────────────────────────────────

  async createAddon(restaurantId: string, itemId: string, dto: CreateAddonDto) {
    await this.assertItemOwnership(itemId, restaurantId);
    return this.prisma.itemAddon.create({
      data: { ...dto, itemId, restaurantId },
    });
  }

  async updateAddon(restaurantId: string, id: string, dto: Partial<CreateAddonDto> & { isActive?: boolean }) {
    const addon = await this.prisma.itemAddon.findFirst({ where: { id, restaurantId } });
    if (!addon) throw new NotFoundException('Addon not found');
    return this.prisma.itemAddon.update({ where: { id }, data: dto });
  }

  async deleteAddon(restaurantId: string, id: string) {
    const addon = await this.prisma.itemAddon.findFirst({ where: { id, restaurantId } });
    if (!addon) throw new NotFoundException('Addon not found');
    return this.prisma.itemAddon.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async assertCategoryOwnership(id: string, restaurantId: string) {
    const cat = await this.prisma.menuCategory.findFirst({ where: { id, restaurantId } });
    if (!cat) throw new ForbiddenException('Category not found or access denied');
  }

  private async assertItemOwnership(id: string, restaurantId: string) {
    const item = await this.prisma.menuItem.findFirst({ where: { id, restaurantId } });
    if (!item) throw new ForbiddenException('Menu item not found or access denied');
  }
}
