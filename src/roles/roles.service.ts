import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './role.schema';
import { CreateRoleDto, UpdateRoleDto, AddPermissionsToRoleDto, RemovePermissionsFromRoleDto } from './dto/role.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    private permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      // Validate permissions if provided
      if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
        const permissions = await this.permissionsService.findByIds(createRoleDto.permissions);
        if (permissions.length !== createRoleDto.permissions.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }
      }

      const role = new this.roleModel(createRoleDto);
      return await role.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Role with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findByScope(scope: string): Promise<Role[]> {
    return this.roleModel.find({ scope }).populate('permissions').exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).populate('permissions').exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleModel.findOne({ name }).populate('permissions').exec();
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    return this.roleModel.find({ _id: { $in: ids } }).populate('permissions').exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      // Validate permissions if provided
      if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
        const permissions = await this.permissionsService.findByIds(updateRoleDto.permissions);
        if (permissions.length !== updateRoleDto.permissions.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }
      }

      const role = await this.roleModel
        .findByIdAndUpdate(id, updateRoleDto, { new: true })
        .populate('permissions')
        .exec();
      
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      return role;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Role with this name already exists');
      }
      throw error;
    }
  }

  async addPermissions(id: string, addPermissionsDto: AddPermissionsToRoleDto): Promise<Role> {
    // Validate permissions
    const permissions = await this.permissionsService.findByIds(addPermissionsDto.permissionIds);
    if (permissions.length !== addPermissionsDto.permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    const role = await this.roleModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { permissions: { $each: addPermissionsDto.permissionIds } } },
        { new: true },
      )
      .populate('permissions')
      .exec();
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async removePermissions(id: string, removePermissionsDto: RemovePermissionsFromRoleDto): Promise<Role> {
    const role = await this.roleModel
      .findByIdAndUpdate(
        id,
        { $pull: { permissions: { $in: removePermissionsDto.permissionIds } } },
        { new: true },
      )
      .populate('permissions')
      .exec();
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system role');
    }

    await this.roleModel.findByIdAndDelete(id).exec();
  }
}
