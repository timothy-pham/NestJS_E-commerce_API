import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate products and calculate total
    let totalAmount = 0;
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.product);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`,
        );
      }
      totalAmount += item.price * item.quantity;

      // Update product stock
      await this.productsService.updateStock(item.product, -item.quantity);
    }

    const createdOrder = new this.orderModel({
      ...createOrderDto,
      user: userId,
      totalAmount,
    });

    const savedOrder = await createdOrder.save();
    await savedOrder.populate('user', '-password');
    await savedOrder.populate('items.product');
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('user', '-password')
      .populate('items.product')
      .exec();
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ user: userId })
      .populate('user', '-password')
      .populate('items.product')
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('user', '-password')
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status: updateOrderStatusDto.status }, { new: true })
      .populate('user', '-password')
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Order not found');
    }
  }
}
