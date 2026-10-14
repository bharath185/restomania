import { IsEnum, IsString, IsArray, IsUUID, IsOptional, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderType, PaymentMethod, OrderStatus } from '@repo/shared';

export class OrderItemVariantDto {
  @ApiPropertyOptional() @IsUUID() @IsOptional() variantId?: string;
}

export class PlaceOrderItemDto {
  @ApiProperty() @IsUUID() itemId: string = '';
  @ApiProperty() @IsInt() @Min(1) @Max(50) quantity: number = 1;
  @ApiPropertyOptional() @IsUUID() @IsOptional() variantId?: string;
  @ApiPropertyOptional() @IsArray() @IsOptional() addonIds?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() specialNotes?: string;
}

export class PlaceOrderDto {
  @ApiProperty({ enum: OrderType }) @IsEnum(OrderType) orderType: OrderType = OrderType.DINE_IN;
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) paymentMethod: PaymentMethod = PaymentMethod.CASH;
  @ApiPropertyOptional() @IsString() @IsOptional() specialNotes?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;
  @ApiProperty({ type: [PlaceOrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => PlaceOrderItemDto) items: PlaceOrderItemDto[] = [];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus }) @IsEnum(OrderStatus) status: OrderStatus = OrderStatus.ACCEPTED;
  @ApiPropertyOptional() @IsString() @IsOptional() note?: string;
  @ApiPropertyOptional() @IsInt() @IsOptional() estimatedTime?: number;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus }) @IsEnum(OrderStatus) @IsOptional() status?: OrderStatus;
  @ApiPropertyOptional({ enum: OrderType }) @IsEnum(OrderType) @IsOptional() orderType?: OrderType;
  @ApiPropertyOptional() @IsString() @IsOptional() from?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() to?: string;
  @ApiPropertyOptional() @IsInt() @IsOptional() @Type(() => Number) page?: number;
  @ApiPropertyOptional() @IsInt() @IsOptional() @Type(() => Number) limit?: number;
}
