import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './organization.schema';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    try {
      const organization = new this.organizationModel(createOrganizationDto);
      return await organization.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Organization with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationModel.find().exec();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationModel.findById(id).exec();
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    try {
      const organization = await this.organizationModel
        .findByIdAndUpdate(id, updateOrganizationDto, { new: true })
        .exec();
      
      if (!organization) {
        throw new NotFoundException(`Organization with ID ${id} not found`);
      }
      return organization;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Organization with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.organizationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
  }
}
