import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty() @IsEmail() email: string = '';
  @ApiProperty() @IsString() @MinLength(8) password: string = '';
}

export class RegisterDto {
  @ApiProperty() @IsString() name: string = '';
  @ApiProperty({ required: false }) @IsEmail() @IsOptional() email?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() phone?: string;
  @ApiProperty() @IsString() @MinLength(8) password: string = '';
}

export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email: string = '';
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() token: string = '';
  @ApiProperty() @IsString() @MinLength(8) password: string = '';
}
