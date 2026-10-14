import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, HttpCode
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { PlaceOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/orders.dto';
import { UserRole } from '@repo/shared';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @HttpCode(201)
  placeOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: PlaceOrderDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.ordersService.placeOrder(tenantId, dto, user?.sub);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN, UserRole.WAITER, UserRole.SUPER_ADMIN)
  @Get()
  getOrders(@CurrentTenant() tenantId: string, @Query() query: OrderQueryDto) {
    return this.ordersService.getOrders(tenantId, query);
  }

  @ApiBearerAuth()
  @Get('customer/history')
  @Roles(UserRole.CUSTOMER)
  getCustomerHistory(@CurrentTenant() tenantId: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.getCustomerOrders(user.sub, tenantId);
  }

  @Public()
  @Get(':id')
  getOrderById(@CurrentTenant() tenantId: string | null, @Param('id') id: string) {
    return this.ordersService.getOrderById(tenantId, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN, UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.updateStatus(tenantId, id, dto, user.sub);
  }

  @ApiBearerAuth()
  @Post(':id/cancel')
  @HttpCode(200)
  cancelOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.cancelOrder(tenantId, id, user.sub);
  }
}
