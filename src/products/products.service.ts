import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return (await createdProduct.save()).populate('category');
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().populate('category').exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productModel.find({ category: categoryId }).populate('category').exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.stock += quantity;
    return product.save();
  }
}
