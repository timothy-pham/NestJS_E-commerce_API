import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction, PermissionScope } from '../permission.schema';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Create Orders' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'orders', description: 'Resource name like orders, products, users' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ enum: PermissionAction, example: PermissionAction.CREATE })
  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @ApiProperty({ enum: PermissionScope, example: PermissionScope.STORE })
  @IsEnum(PermissionScope)
  @IsNotEmpty()
  scope: PermissionScope;

  @ApiProperty({ example: 'Allows creating orders in a store', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @ApiProperty({ example: 'Create Orders', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'orders', required: false })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiProperty({ enum: PermissionAction, example: PermissionAction.CREATE, required: false })
  @IsEnum(PermissionAction)
  @IsOptional()
  action?: PermissionAction;

  @ApiProperty({ enum: PermissionScope, example: PermissionScope.STORE, required: false })
  @IsEnum(PermissionScope)
  @IsOptional()
  scope?: PermissionScope;

  @ApiProperty({ example: 'Allows creating orders in a store', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
