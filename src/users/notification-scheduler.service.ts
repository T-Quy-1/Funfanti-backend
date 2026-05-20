import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { NotificationFrequency } from './dto/notification-schedule.dto';

type DueSchedule = {
  id: string;
  userId: string;
  dailyTime: string;
  frequency: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
};

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueSchedulePoll() {
    try {
      const triggeredCount = await this.pollDueSchedules();

      if (triggeredCount > 0) {
        this.logger.log(
          `Triggered ${triggeredCount} due notification schedule(s)`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to poll notification schedules', error);
    }
  }

  async pollDueSchedules(referenceDate = new Date()): Promise<number> {
    const dailyTime = this.toDailyTime(referenceDate);
    const schedules = await this.prisma.notificationSchedule.findMany({
      where: {
        isActive: true,
        dailyTime,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    const dueSchedules = schedules.filter((schedule) =>
      this.matchesFrequency(schedule.frequency, referenceDate),
    ) as DueSchedule[];

    for (const schedule of dueSchedules) {
      this.emitLockScreenScheduleEvent(schedule, referenceDate);
    }

    return dueSchedules.length;
  }

  private matchesFrequency(frequency: string, referenceDate: Date): boolean {
    const day = referenceDate.getDay();
    const normalizedFrequency = frequency as NotificationFrequency;

    if (normalizedFrequency === NotificationFrequency.Weekdays) {
      return day >= 1 && day <= 5;
    }

    if (normalizedFrequency === NotificationFrequency.Weekends) {
      return day === 0 || day === 6;
    }

    return normalizedFrequency === NotificationFrequency.Daily;
  }

  private emitLockScreenScheduleEvent(
    schedule: DueSchedule,
    referenceDate: Date,
  ) {
    this.logger.log(
      `Lock-screen schedule ${schedule.id} due for user ${schedule.userId} at ${this.toDailyTime(
        referenceDate,
      )}`,
    );
  }

  private toDailyTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
}
