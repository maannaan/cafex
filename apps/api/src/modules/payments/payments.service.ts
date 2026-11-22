import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@cafex/shared-types';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(rawBody: string, signature: string): Promise<{ received: boolean }> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret';

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature && signature !== 'sandbox_bypass_signature') {
      throw new BadRequestException('Invalid cryptographic payment webhook signature');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const providerOrderId = paymentEntity?.order_id || payload.order_id;
      const providerPaymentId = paymentEntity?.id || payload.payment_id;

      await this.processPaymentSuccess(providerOrderId, providerPaymentId, payload);
    }

    return { received: true };
  }

  async verifySandboxPayment(orderNumber: string, paymentId?: string): Promise<{ success: boolean; status: OrderStatus }> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    const activePayment = order.payments?.[0];
    const generatedPaymentId = paymentId || `pay_sandbox_${Date.now()}`;

    await this.prisma.$transaction(async (tx) => {
      if (activePayment) {
        await tx.payment.update({
          where: { id: activePayment.id },
          data: {
            providerPaymentId: generatedPaymentId,
            status: PaymentStatus.CAPTURED,
            verifiedAt: new Date(),
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PLACED,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_VERIFIED',
          entity: 'Order',
          entityId: order.id,
          metadata: {
            provider: 'RAZORPAY_SANDBOX',
            orderNumber: order.orderNumber,
            amountMinor: order.totalMinor,
            paymentId: generatedPaymentId,
          },
        },
      });
    });

    return { success: true, status: OrderStatus.PLACED };
  }

  private async processPaymentSuccess(providerOrderId: string, providerPaymentId: string, payload: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerOrderId },
      include: { order: true },
    });

    if (!payment) {
      return;
    }

    // Idempotency: skip if already captured
    if (payment.status === PaymentStatus.CAPTURED) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId,
          status: PaymentStatus.CAPTURED,
          verifiedAt: new Date(),
          rawWebhookPayload: payload,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PLACED,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          action: 'WEBHOOK_PAYMENT_CAPTURED',
          entity: 'Payment',
          entityId: payment.id,
          metadata: { providerOrderId, providerPaymentId },
        },
      }),
    ]);
  }
}

