import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, UserRoleDocument } from './user-role.schema';
import { AssignRoleDto, RevokeRoleDto, UpdateUserRoleDto } from './dto/user-role.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectModel(UserRole.name)
    private userRoleModel: Model<UserRoleDocument>,
    @Inject(forwardRef(() => RolesService))
    private rolesService: RolesService,
  ) {}

  async assignRole(assignRoleDto: AssignRoleDto): Promise<UserRole> {
    try {
      // Validate role exists
      await this.rolesService.findOne(assignRoleDto.roleId);

      // Determine scope model based on scope
      let scopeModel: string | undefined;
      if (assignRoleDto.scopeId) {
        scopeModel = assignRoleDto.scope === 'organization' ? 'Organization' : 'Store';
      }

      const userRole = new this.userRoleModel({
        ...assignRoleDto,
        scopeModel,
      });

      return await userRole.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User already has this role in this scope');
      }
      throw error;
    }
  }

  async findByUser(userId: string): Promise<UserRole[]> {
    return this.userRoleModel
      .find({ userId, isActive: true })
      .populate('roleId')
      .exec();
  }

  async findByUserAndScope(userId: string, scope: string, scopeId?: string): Promise<UserRole[]> {
    const query: any = { userId, scope, isActive: true };
    if (scopeId) {
      query.scopeId = scopeId;
    }
    return this.userRoleModel
      .find(query)
      .populate('roleId')
      .exec();
  }

  async findOne(id: string): Promise<UserRole> {
    const userRole = await this.userRoleModel
      .findById(id)
      .populate('roleId')
      .exec();
    
    if (!userRole) {
      throw new NotFoundException(`UserRole with ID ${id} not found`);
    }
    return userRole;
  }

  async revokeRole(revokeRoleDto: RevokeRoleDto): Promise<void> {
    const query: any = {
      userId: revokeRoleDto.userId,
      roleId: revokeRoleDto.roleId,
      scope: revokeRoleDto.scope,
    };
    
    if (revokeRoleDto.scopeId) {
      query.scopeId = revokeRoleDto.scopeId;
    }

    const result = await this.userRoleModel.findOneAndDelete(query).exec();
    if (!result) {
      throw new NotFoundException('UserRole not found');
    }
  }

  async update(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<UserRole> {
    const userRole = await this.userRoleModel
      .findByIdAndUpdate(id, updateUserRoleDto, { new: true })
      .populate('roleId')
      .exec();
    
    if (!userRole) {
      throw new NotFoundException(`UserRole with ID ${id} not found`);
    }
    return userRole;
  }

  async getUserPermissions(userId: string, storeId?: string): Promise<any> {
    const query: any = { userId, isActive: true };
    if (storeId) {
      query.$or = [
        { scope: 'system' },
        { scope: 'organization', scopeId: { $exists: true } },
        { scope: 'store', scopeId: storeId },
      ];
    }

    const userRoles = await this.userRoleModel
      .find(query)
      .populate({
        path: 'roleId',
        populate: {
          path: 'permissions',
        },
      })
      .exec();

    // Flatten permissions from all roles
    const permissions = new Set<string>();
    const roles = new Set<string>();

    userRoles.forEach((userRole: any) => {
      if (userRole.roleId) {
        roles.add(userRole.roleId.name);
        if (userRole.roleId.permissions) {
          userRole.roleId.permissions.forEach((permission: any) => {
            permissions.add(`${permission.resource}:${permission.action}`);
          });
        }
      }
    });

    return {
      roles: Array.from(roles),
      permissions: Array.from(permissions),
      userRoles: userRoles,
    };
  }
}
