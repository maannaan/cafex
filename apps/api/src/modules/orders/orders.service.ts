import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QuoteRequestDto,
  QuoteResponseDto,
  CreateOrderDto,
  OrderResponseDto,
  OrderStatus,
  PaymentStatus,
  FulfilmentType,
} from '@cafex/shared-types';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateQuote(dto: QuoteRequestDto): Promise<QuoteResponseDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const businessSettings = await this.prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });
    const taxRate = businessSettings ? Number(businessSettings.taxPercentage) / 100 : 0.05;

    let subtotalMinor = 0;
    const computedItems: QuoteResponseDto['items'] = [];

    for (const item of dto.items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('Item quantity must be greater than zero');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          optionGroups: {
            include: { options: true },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product ID "${item.productId}" not found`);
      }

      if (!product.isAvailable) {
        throw new BadRequestException(`Product "${product.name}" is currently unavailable`);
      }

      let itemUnitPriceMinor = product.basePriceMinor;
      const appliedOptions: Array<{ name: string; priceDeltaMinor: number }> = [];

      if (item.optionIds && item.optionIds.length > 0) {
        for (const optId of item.optionIds) {
          let foundOption = null;
          for (const grp of product.optionGroups) {
            const opt = grp.options.find((o) => o.id === optId);
            if (opt) {
              foundOption = opt;
              break;
            }
          }

          if (!foundOption) {
            throw new BadRequestException(`Option ID "${optId}" is not valid for product "${product.name}"`);
          }

          if (!foundOption.isAvailable) {
            throw new BadRequestException(`Option "${foundOption.name}" is currently unavailable`);
          }

          itemUnitPriceMinor += foundOption.priceDeltaMinor;
          appliedOptions.push({
            name: foundOption.name,
            priceDeltaMinor: foundOption.priceDeltaMinor,
          });
        }
      }

      const lineTotalMinor = itemUnitPriceMinor * item.quantity;
      subtotalMinor += lineTotalMinor;

      computedItems.push({
        productId: product.id,
        productName: product.name,
        unitPriceMinor: itemUnitPriceMinor,
        quantity: item.quantity,
        options: appliedOptions,
        lineTotalMinor,
      });
    }

    // Coupon discount logic
    let discountMinor = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase().trim() },
      });

      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Invalid or inactive coupon code');
      }

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        throw new BadRequestException('Coupon code has expired');
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon code usage limit has been reached');
      }

      if (subtotalMinor < coupon.minSpendMinor) {
        throw new BadRequestException(
          `Minimum order value of ${(coupon.minSpendMinor / 100).toFixed(2)} required for coupon ${coupon.code}`,
        );
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discountMinor = Math.round((subtotalMinor * coupon.discountValue) / 100);
        if (coupon.maxDiscountMinor && discountMinor > coupon.maxDiscountMinor) {
          discountMinor = coupon.maxDiscountMinor;
        }
      } else if (coupon.discountType === 'FIXED') {
        discountMinor = Math.min(coupon.discountValue, subtotalMinor);
      }
    }

    const subtotalAfterDiscount = Math.max(0, subtotalMinor - discountMinor);
    const taxMinor = Math.round(subtotalAfterDiscount * taxRate);
    const deliveryFeeMinor = dto.fulfilmentType === FulfilmentType.DELIVERY ? 5000 : 0; // ₹50.00 delivery fee
    const totalMinor = subtotalAfterDiscount + taxMinor + deliveryFeeMinor;

    return {
      subtotalMinor,
      discountMinor,
      taxMinor,
      deliveryFeeMinor,
      totalMinor,
      items: computedItems,
    };
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { items: { include: { selectedOptions: true } }, payments: true },
      });

      if (existing) {
        return this.formatOrderResponse(existing);
      }
    }

    // Authoritative calculation on backend
    const quote = await this.calculateQuote({
      items: dto.items,
      couponCode: dto.couponCode,
      fulfilmentType: dto.fulfilmentType,
    });

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CFX-${dateStr}-${randomSuffix}`;

    const order = await this.prisma.$transaction(async (tx) => {
      if (dto.couponCode && quote.discountMinor > 0) {
        await tx.coupon.update({
          where: { code: dto.couponCode.toUpperCase().trim() },
          data: { usageCount: { increment: 1 } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          fulfilmentType: dto.fulfilmentType,
          status: OrderStatus.PENDING_PAYMENT,
          subtotalMinor: quote.subtotalMinor,
          taxMinor: quote.taxMinor,
          discountMinor: quote.discountMinor,
          deliveryFeeMinor: quote.deliveryFeeMinor,
          totalMinor: quote.totalMinor,
          notes: dto.notes,
          idempotencyKey: dto.idempotencyKey,
          items: {
            create: quote.items.map((it) => ({
              productId: it.productId,
              productName: it.productName,
              quantity: it.quantity,
              unitPriceMinor: it.unitPriceMinor,
              lineTotalMinor: it.lineTotalMinor,
              selectedOptions: {
                create: it.options.map((opt) => ({
                  groupName: 'Selected Option',
                  optionName: opt.name,
                  priceDeltaMinor: opt.priceDeltaMinor,
                })),
              },
            })),
          },
          payments: {
            create: {
              provider: 'RAZORPAY',
              providerOrderId: `order_sandbox_${orderNumber}`,
              amountMinor: quote.totalMinor,
              currency: 'INR',
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: {
          items: { include: { selectedOptions: true } },
          payments: true,
        },
      });

      return createdOrder;
    });

    return this.formatOrderResponse(order);
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { selectedOptions: true } },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderNumber}" not found`);
    }

    return this.formatOrderResponse(order);
  }

  private formatOrderResponse(order: any): OrderResponseDto {
    const activePayment = order.payments?.[0];
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      fulfilmentType: order.fulfilmentType,
      status: order.status,
      subtotalMinor: order.subtotalMinor,
      taxMinor: order.taxMinor,
      discountMinor: order.discountMinor,
      deliveryFeeMinor: order.deliveryFeeMinor,
      totalMinor: order.totalMinor,
      notes: order.notes,
      paymentSession: activePayment
        ? {
            provider: activePayment.provider,
            orderId: activePayment.providerOrderId || `order_sandbox_${order.orderNumber}`,
            amountMinor: activePayment.amountMinor,
            currency: activePayment.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
          }
        : undefined,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
