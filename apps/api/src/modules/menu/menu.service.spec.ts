import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  menuCategory: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  menuItem: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  itemImage: { create: jest.fn() },
};

const mockStorage = { uploadImage: jest.fn() };

describe('MenuService - Tenant Isolation', () => {
  let service: MenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();
    service = module.get<MenuService>(MenuService);
    jest.clearAllMocks();
  });

  describe('Cross-tenant item access', () => {
    it('should return empty array when no items exist for tenant', async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([]);

      const result = await service.getItems('restaurant-a-id');

      expect(result).toHaveLength(0);
      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ restaurantId: 'restaurant-a-id' }),
        }),
      );
    });

    it('should throw NotFoundException when accessing item from another tenant', async () => {
      mockPrisma.menuItem.findFirst.mockResolvedValue(null);

      await expect(
        service.getItem('restaurant-a-id', 'item-from-restaurant-b'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should always filter by restaurantId in queries', async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([]);

      await service.getItems('tenant-123', 'some-category');

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ restaurantId: 'tenant-123', categoryId: 'some-category' }),
        }),
      );
    });
  });

  describe('Category tenant isolation', () => {
    it('should prevent updating a category from another tenant', async () => {
      mockPrisma.menuCategory.findFirst.mockResolvedValue(null);

      await expect(
        service.updateCategory('restaurant-a-id', 'category-from-b', {}),
      ).rejects.toThrow();
    });

    it('should only fetch categories belonging to the tenant', async () => {
      const mockCategories = [{ id: '1', restaurantId: 'restaurant-a-id', name: 'Starters' }];
      mockPrisma.menuCategory.findMany.mockResolvedValue(mockCategories);

      const result = await service.getCategories('restaurant-a-id');

      expect(mockPrisma.menuCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ restaurantId: 'restaurant-a-id' }),
        }),
      );
      expect(result).toEqual(mockCategories);
    });
  });
});
