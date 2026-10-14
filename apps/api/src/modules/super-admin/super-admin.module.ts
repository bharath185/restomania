import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { OnboardingProcessor } from './onboarding.processor';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'onboarding' }),
    NotificationsModule,
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, OnboardingProcessor],
})
export class SuperAdminModule {}
