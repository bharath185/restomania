import { Controller, Post, Get, Body, Param, Req, UseGuards, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  initiate(
    @CurrentTenant() tenantId: string,
    @Body() body: { orderId: string; method: string },
  ) {
    return this.paymentsService.initiatePayment(tenantId, body.orderId, body.method);
  }

  @Public()
  @Post('webhook/razorpay')
  razorpayWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['x-razorpay-signature'] as string;
    const payload = req.body ? JSON.stringify(req.body) : '{}';
    return this.paymentsService.handleRazorpayWebhook(payload, signature);
  }

  @ApiBearerAuth()
  @Get(':id')
  getStatus(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.paymentsService.getPaymentStatus(tenantId, id);
  }
}
