import { IsString, IsEnum, IsBoolean, IsOptional, IsNotEmpty, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionScope } from '../../permissions/permission.schema';

export class CreateRoleDto {
  @ApiProperty({ example: 'store_manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Store manager with full store access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PermissionScope, example: PermissionScope.STORE })
  @IsEnum(PermissionScope)
  @IsNotEmpty()
  scope: PermissionScope;

  @ApiProperty({ 
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Array of permission IDs',
    required: false
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiProperty({ example: false, default: false, required: false })
  @IsBoolean()
  @IsOptional()
  isSystemRole?: boolean;

  @ApiProperty({ example: true, default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'store_manager', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Store manager with full store access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PermissionScope, example: PermissionScope.STORE, required: false })
  @IsEnum(PermissionScope)
  @IsOptional()
  scope?: PermissionScope;

  @ApiProperty({ 
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
    required: false
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddPermissionsToRoleDto {
  @ApiProperty({ 
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Array of permission IDs to add'
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  permissionIds: string[];
}

export class RemovePermissionsFromRoleDto {
  @ApiProperty({ 
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of permission IDs to remove'
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  permissionIds: string[];
}
