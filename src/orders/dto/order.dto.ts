import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsMongoId,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order.schema';

export class OrderItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  product: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 999.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsString()
  shippingAddress: string;

  @ApiProperty({ example: 'Please deliver before 5 PM', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: any;

  @ApiProperty()
  items: any[];

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  shippingAddress: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
