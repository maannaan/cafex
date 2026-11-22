import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QuoteRequestDto, CreateOrderDto } from '@cafex/shared-types';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('quote')
  async quote(@Body() dto: QuoteRequestDto) {
    return this.ordersService.calculateQuote(dto);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get(':orderNumber')
  async getStatus(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }
}
