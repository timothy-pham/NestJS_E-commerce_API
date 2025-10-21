import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { ProductsService } from '../products/products.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
    updateStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
