import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { KitchenModule } from '../kitchen/kitchen.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
    KitchenModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
