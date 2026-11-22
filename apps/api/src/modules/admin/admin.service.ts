import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, ReservationStatus } from '@cafex/shared-types';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrdersToday, totalSalesResult, pendingOrders, upcomingReservations] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED] },
          createdAt: { gte: today },
        },
        _sum: { totalMinor: true },
      }),
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING] } },
      }),
      this.prisma.reservation.count({
        where: {
          date: { gte: today },
          status: { in: [ReservationStatus.PENDING_APPROVAL, ReservationStatus.CONFIRMED] },
        },
      }),
    ]);

    return {
      todayOrdersCount: totalOrdersToday,
      todayRevenueMinor: totalSalesResult._sum.totalMinor || 0,
      activePendingOrders: pendingOrders,
      upcomingReservationsCount: upcomingReservations,
    };
  }

  async getOrders(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { selectedOptions: true } },
        payments: true,
      },
      take: 50,
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, reason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        cancellationReason: reason || order.cancellationReason,
      },
      include: { items: true, payments: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'ORDER_STATUS_CHANGED',
        entity: 'Order',
        entityId: orderId,
        metadata: { from: order.status, to: status, reason },
      },
    });

    return updated;
  }

  async getReservations() {
    return this.prisma.reservation.findMany({
      orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
      take: 50,
    });
  }

  async updateReservationStatus(id: string, status: ReservationStatus) {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true,
        optionGroups: { include: { options: true } },
      },
    });
  }

  async toggleProductAvailability(id: string, isAvailable: boolean) {
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async updateProductPrice(id: string, basePriceMinor: number) {
    return this.prisma.product.update({
      where: { id },
      data: { basePriceMinor },
    });
  }

  async updateSettings(data: any) {
    return this.prisma.businessSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });
  }
}

