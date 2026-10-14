import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DishType } from '@repo/shared';

export class CreateCategoryDto {
  @ApiProperty() @IsString() name: string = '';
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() availableFrom?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() availableTo?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() availableFrom?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() availableTo?: string;
}

export class CreateMenuItemDto {
  @ApiProperty() @IsString() categoryId: string = '';
  @ApiProperty() @IsString() name: string = '';
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: DishType }) @IsEnum(DishType) dishType: DishType = DishType.VEG;
  @ApiProperty() @IsNumber() @IsPositive() basePrice: number = 0;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() discountedPrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() calories?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() prepTimeMins?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) @Max(5) spiceLevel?: number;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() taxRate?: number;
}

export class UpdateMenuItemDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() categoryId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false, enum: DishType }) @IsOptional() @IsEnum(DishType) dishType?: DishType;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @IsPositive() basePrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() discountedPrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() calories?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() prepTimeMins?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isInStock?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isBestseller?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) @Max(5) spiceLevel?: number;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() taxRate?: number;
}

export class CreateVariantDto {
  @ApiProperty() @IsString() name: string = '';
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() priceDelta?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isDefault?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
}

export class CreateAddonDto {
  @ApiProperty() @IsString() name: string = '';
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() price?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() maxSelect?: number;
}
