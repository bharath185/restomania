import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateVariantDto,
  CreateAddonDto,
} from './dto/menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@repo/shared';

@ApiTags('Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ─── Categories ──────────────────────────────────────────────────────────────

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List all menu categories' })
  async getCategories(
    @CurrentTenant() tenantId: string | null,
    @CurrentUser() user?: JwtPayload,
  ) {
    const restaurantId = tenantId || user?.restaurantId;
    if (!restaurantId) throw new NotFoundException('Restaurant tenant not found');
    return this.menuService.getCategories(restaurantId);
  }

  @Post('categories')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new menu category' })
  async createCategory(@CurrentUser() user: JwtPayload, @Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(user.restaurantId!, dto);
  }

  @Patch('categories/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a menu category' })
  async updateCategory(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(user.restaurantId!, id, dto);
  }

  @Delete('categories/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete a menu category' })
  async deleteCategory(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.menuService.deleteCategory(user.restaurantId!, id);
  }

  // ─── Items ────────────────────────────────────────────────────────────────────

  @Public()
  @Get('items')
  @ApiOperation({ summary: 'List all menu items, optionally filtered by category' })
  async getItems(
    @CurrentTenant() tenantId: string | null,
    @CurrentUser() user?: JwtPayload,
    @Query('categoryId') categoryId?: string,
  ) {
    const restaurantId = tenantId || user?.restaurantId;
    if (!restaurantId) throw new NotFoundException('Restaurant tenant not found');
    return this.menuService.getItems(restaurantId, categoryId);
  }

  @Public()
  @Get('items/:id')
  @ApiOperation({ summary: 'Get a single menu item with variants and addons' })
  async getItem(
    @CurrentTenant() tenantId: string | null,
    @Param('id') id: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const restaurantId = tenantId || user?.restaurantId;
    if (!restaurantId) throw new NotFoundException('Restaurant tenant not found');
    return this.menuService.getItem(restaurantId, id);
  }

  @Post('items')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a menu item' })
  async createItem(@CurrentUser() user: JwtPayload, @Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(user.restaurantId!, dto);
  }

  @Patch('items/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a menu item' })
  async updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(user.restaurantId!, id, dto);
  }

  @Delete('items/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete a menu item' })
  async deleteItem(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.menuService.deleteItem(user.restaurantId!, id);
  }

  @Patch('items/:id/stock')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Toggle in-stock status for a menu item' })
  async toggleStock(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('isInStock') isInStock: boolean,
  ) {
    return this.menuService.toggleStock(user.restaurantId!, id, isInStock);
  }

  @Post('items/:id/images')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a menu item' })
  async uploadItemImage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPrimary') isPrimary?: string,
  ) {
    return this.menuService.uploadItemImage(
      user.restaurantId!,
      id,
      file.buffer,
      file.mimetype,
      isPrimary === 'true',
    );
  }

  @Delete('items/:itemId/images/:imageId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a menu item image' })
  async deleteItemImage(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.menuService.deleteItemImage(user.restaurantId!, itemId, imageId);
  }

  // ─── Variants ────────────────────────────────────────────────────────────────

  @Post('items/:itemId/variants')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a variant for a menu item' })
  async createVariant(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.menuService.createVariant(user.restaurantId!, itemId, dto);
  }

  @Patch('variants/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a variant' })
  async updateVariant(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateVariantDto>,
  ) {
    return this.menuService.updateVariant(user.restaurantId!, id, dto);
  }

  @Delete('variants/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a variant' })
  async deleteVariant(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.menuService.deleteVariant(user.restaurantId!, id);
  }

  // ─── Addons ──────────────────────────────────────────────────────────────────

  @Post('items/:itemId/addons')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create an addon for a menu item' })
  async createAddon(
    @CurrentUser() user: JwtPayload,
    @Param('itemId') itemId: string,
    @Body() dto: CreateAddonDto,
  ) {
    return this.menuService.createAddon(user.restaurantId!, itemId, dto);
  }

  @Patch('addons/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update an addon' })
  async updateAddon(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAddonDto>,
  ) {
    return this.menuService.updateAddon(user.restaurantId!, id, dto);
  }

  @Delete('addons/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an addon' })
  async deleteAddon(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.menuService.deleteAddon(user.restaurantId!, id);
  }
}
