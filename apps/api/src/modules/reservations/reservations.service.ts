import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationRequestDto, ReservationStatus } from '@cafex/shared-types';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(dateString: string) {
    const targetDate = new Date(dateString);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid date string (expected YYYY-MM-DD)');
    }

    const dayOfWeek = targetDate.getDay();

    const capacities = await this.prisma.reservationCapacity.findMany({
      where: { dayOfWeek, isActive: true },
      orderBy: { timeSlot: 'asc' },
    });

    const existingBookings = await this.prisma.reservation.findMany({
      where: {
        date: targetDate,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING_APPROVAL, ReservationStatus.SEATED] },
      },
    });

    const availability = capacities.map((cap) => {
      const slotBookings = existingBookings.filter((b) => b.timeSlot === cap.timeSlot);
      const bookedCovers = slotBookings.reduce((sum, b) => sum + b.partySize, 0);
      const bookedParties = slotBookings.length;

      const remainingCovers = Math.max(0, cap.maxCovers - bookedCovers);
      const remainingParties = Math.max(0, cap.maxParties - bookedParties);
      const isAvailable = remainingCovers >= 2 && remainingParties > 0;

      return {
        timeSlot: cap.timeSlot,
        available: isAvailable,
        remainingCovers,
      };
    });

    return {
      date: dateString,
      dayOfWeek,
      slots: availability,
    };
  }

  async createReservation(dto: ReservationRequestDto) {
    if (dto.partySize <= 0 || dto.partySize > 12) {
      throw new BadRequestException('Party size must be between 1 and 12 guests');
    }

    const targetDate = new Date(dto.date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid date string');
    }

    const dayOfWeek = targetDate.getDay();

    // Transactional overbooking prevention
    const reservation = await this.prisma.$transaction(async (tx) => {
      const capacity = await tx.reservationCapacity.findUnique({
        where: {
          dayOfWeek_timeSlot: {
            dayOfWeek,
            timeSlot: dto.timeSlot,
          },
        },
      });

      if (!capacity || !capacity.isActive) {
        throw new BadRequestException(`No seating available at ${dto.timeSlot} on this day`);
      }

      const activeBookings = await tx.reservation.findMany({
        where: {
          date: targetDate,
          timeSlot: dto.timeSlot,
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING_APPROVAL, ReservationStatus.SEATED] },
        },
      });

      const currentCovers = activeBookings.reduce((sum, b) => sum + b.partySize, 0);
      if (currentCovers + dto.partySize > capacity.maxCovers) {
        throw new BadRequestException('Selected time slot cannot accommodate this party size (capacity reached)');
      }

      if (activeBookings.length >= capacity.maxParties) {
        throw new BadRequestException('All tables booked for this time slot');
      }

      return tx.reservation.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          date: targetDate,
          timeSlot: dto.timeSlot,
          partySize: dto.partySize,
          specialNotes: dto.specialNotes,
          status: ReservationStatus.CONFIRMED, // Auto-confirmed in MVP, can be changed to PENDING_APPROVAL
        },
      });
    });

    return reservation;
  }
}

