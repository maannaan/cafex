import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationRequestDto } from '@cafex/shared-types';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('availability')
  async getAvailability(@Query('date') date: string) {
    const queryDate = date || new Date().toISOString().slice(0, 10);
    return this.reservationsService.getAvailability(queryDate);
  }

  @Post()
  async create(@Body() dto: ReservationRequestDto) {
    return this.reservationsService.createReservation(dto);
  }
}
