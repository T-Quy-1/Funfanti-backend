import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { NotificationSchedulerService } from './notification-scheduler.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, NotificationSchedulerService],
})
export class UsersModule {}
