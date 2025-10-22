import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { AssignRoleDto, RevokeRoleDto, UpdateUserRoleDto } from './dto/user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('User Roles')
@Controller('user-roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'organization_admin', 'store_owner')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userRolesService.assignRole(assignRoleDto);
  }

  @Post('revoke')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'organization_admin', 'store_owner')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  revokeRole(@Body() revokeRoleDto: RevokeRoleDto) {
    return this.userRolesService.revokeRole(revokeRoleDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all roles for a specific user' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  findByUser(@Param('userId') userId: string) {
    return this.userRolesService.findByUser(userId);
  }

  @Get('user/:userId/permissions')
  @ApiOperation({ summary: 'Get all permissions for a user' })
  @ApiQuery({ name: 'storeId', required: false, description: 'Filter by store context' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved successfully' })
  getUserPermissions(@Param('userId') userId: string, @Query('storeId') storeId?: string) {
    return this.userRolesService.getUserPermissions(userId, storeId);
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'Get permissions for current user' })
  @ApiQuery({ name: 'storeId', required: false, description: 'Filter by store context' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved successfully' })
  getMyPermissions(@GetUser() user: any, @Query('storeId') storeId?: string) {
    return this.userRolesService.getUserPermissions(user.userId, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user role by ID' })
  @ApiResponse({ status: 200, description: 'User role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User role not found' })
  findOne(@Param('id') id: string) {
    return this.userRolesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'organization_admin', 'store_owner')
  @ApiOperation({ summary: 'Update user role (activate/deactivate)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.userRolesService.update(id, updateUserRoleDto);
  }
}
