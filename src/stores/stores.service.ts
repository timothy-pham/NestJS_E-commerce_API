import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './store.schema';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name)
    private storeModel: Model<StoreDocument>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = new this.storeModel(createStoreDto);
    return await store.save();
  }

  async findAll(): Promise<Store[]> {
    return this.storeModel.find().populate('organizationId').exec();
  }

  async findByOrganization(organizationId: string): Promise<Store[]> {
    return this.storeModel.find({ organizationId }).populate('organizationId').exec();
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeModel.findById(id).populate('organizationId').exec();
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.storeModel
      .findByIdAndUpdate(id, updateStoreDto, { new: true })
      .populate('organizationId')
      .exec();
    
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async remove(id: string): Promise<void> {
    const result = await this.storeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
  }
}
