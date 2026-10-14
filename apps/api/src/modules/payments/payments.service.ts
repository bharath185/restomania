import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async initiatePayment(restaurantId: string, orderId: string, method: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, restaurantId },
      include: { payments: true },
    });

    if (!order) throw new BadRequestException('Order not found');

    if (method === 'cash') {
      return { method: 'cash', status: 'pending', message: 'Pay at counter' };
    }

    if (method === 'razorpay') {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID ?? '',
          key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
        });

        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(Number(order.totalAmount) * 100),
          currency: 'INR',
          receipt: order.orderNumber,
        });

        await this.prisma.payment.updateMany({
          where: { orderId, restaurantId },
          data: { gatewayOrderId: razorpayOrder.id, gateway: 'razorpay' },
        });

        return {
          method: 'razorpay',
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        };
      } catch (err) {
        this.logger.error('Razorpay error', err);
        throw new BadRequestException('Payment initiation failed. Use cash.');
      }
    }

    throw new BadRequestException(`Unsupported payment method: ${method}`);
  }

  async handleRazorpayWebhook(payload: string, signature: string): Promise<{ verified: boolean }> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      this.logger.warn('Invalid Razorpay webhook signature');
      return { verified: false };
    }

    const event = JSON.parse(payload) as {
      event: string;
      payload: { payment: { entity: { order_id: string; id: string; status: string } } };
    };

    if (event.event === 'payment.captured') {
      const { order_id, id: paymentId } = event.payload.payment.entity;

      await this.prisma.payment.updateMany({
        where: { gatewayOrderId: order_id },
        data: {
          status: 'paid',
          gatewayPaymentId: paymentId,
          paidAt: new Date(),
        },
      });
    }

    return { verified: true };
  }

  async getPaymentStatus(restaurantId: string, paymentId: string) {
    return this.prisma.payment.findFirst({
      where: { id: paymentId, restaurantId },
    });
  }
}
