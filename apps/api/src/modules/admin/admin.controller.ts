import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleType, OrderStatus, ReservationStatus } from '@cafex/shared-types';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.STAFF)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('orders')
  async getOrders(@Query('status') status?: OrderStatus) {
    return this.adminService.getOrders(status);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; reason?: string },
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.reason);
  }

  @Get('reservations')
  async getReservations() {
    return this.adminService.getReservations();
  }

  @Patch('reservations/:id/status')
  async updateReservationStatus(
    @Param('id') id: string,
    @Body() body: { status: ReservationStatus },
  ) {
    return this.adminService.updateReservationStatus(id, body.status);
  }

  @Get('products')
  async getProducts() {
    return this.adminService.getAllProducts();
  }

  @Patch('products/:id/availability')
  async toggleAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
  ) {
    return this.adminService.toggleProductAvailability(id, body.isAvailable);
  }

  @Patch('products/:id/price')
  async updatePrice(
    @Param('id') id: string,
    @Body() body: { basePriceMinor: number },
  ) {
    return this.adminService.updateProductPrice(id, body.basePriceMinor);
  }

  @Roles(RoleType.ADMIN)
  @Post('settings')
  async updateSettings(@Body() body: any) {
    return this.adminService.updateSettings(body);
  }
}
