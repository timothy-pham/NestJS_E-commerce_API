import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderResponseDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { GetStoreId } from '../common/decorators/get-store-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiHeader({
  name: 'x-store-id',
  description: 'Store context ID for multi-store operations',
  required: false,
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('orders:create')
  @ApiOperation({ 
    summary: 'Create a new order',
    description: 'Requires orders:create permission. Staff and above can create orders in their store context.',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async create(
    @GetUser() user: any, 
    @GetStoreId() storeId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.userId, createOrderDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'organization_admin', 'store_owner', 'store_manager', 'staff')
  @ApiOperation({ 
    summary: 'Get all orders (role-based access)',
    description: 'Super admin sees all orders. Organization admin sees org orders. Store roles see store orders based on x-store-id header.',
  })
  @ApiResponse({ status: 200, description: 'List of orders', type: [OrderResponseDto] })
  async findAll(@GetUser() user: any, @GetStoreId() storeId: string) {
    // Super admins and organization admins can see all orders
    if (user.roles?.includes('super_admin') || user.roles?.includes('organization_admin')) {
      return this.ordersService.findAll();
    }
    // Other roles see their own orders
    return this.ordersService.findByUser(user.userId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('orders:read')
  @ApiOperation({ 
    summary: 'Get order by ID',
    description: 'Requires orders:read permission',
  })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'organization_admin', 'store_owner', 'store_manager')
  @ApiOperation({ 
    summary: 'Update order status',
    description: 'Requires store_manager role or above',
  })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'organization_admin', 'store_owner')
  @ApiOperation({ 
    summary: 'Delete order',
    description: 'Requires store_owner role or above',
  })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}
