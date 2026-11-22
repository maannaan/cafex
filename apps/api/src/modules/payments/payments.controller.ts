import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature || '');
  }

  @Post('verify-sandbox')
  async verifySandbox(
    @Body() body: { orderNumber: string; paymentId?: string },
  ) {
    return this.paymentsService.verifySandboxPayment(body.orderNumber, body.paymentId);
  }
}

