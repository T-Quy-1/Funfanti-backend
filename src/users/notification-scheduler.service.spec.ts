import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { PrismaService } from '../common/prisma.service';
import { NotificationFrequency } from './dto/notification-schedule.dto';

describe('NotificationSchedulerService', () => {
  let service: NotificationSchedulerService;

  const mockPrismaService = {
    notificationSchedule: {
      findMany: jest.fn(),
    },
  };

  const baseSchedule = {
    id: 'schedule-uuid',
    userId: 'user-uuid',
    dailyTime: '08:00',
    isActive: true,
    createdAt: new Date(),
    user: {
      id: 'user-uuid',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSchedulerService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationSchedulerService>(
      NotificationSchedulerService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should poll active schedules matching the current HH:mm', async () => {
    mockPrismaService.notificationSchedule.findMany.mockResolvedValue([
      { ...baseSchedule, id: 'daily', frequency: NotificationFrequency.Daily },
      {
        ...baseSchedule,
        id: 'weekday',
        frequency: NotificationFrequency.Weekdays,
      },
      {
        ...baseSchedule,
        id: 'weekend',
        frequency: NotificationFrequency.Weekends,
      },
    ]);

    const triggered = await service.pollDueSchedules(
      new Date(2026, 4, 20, 8, 0),
    );

    expect(triggered).toBe(2);
    expect(
      mockPrismaService.notificationSchedule.findMany,
    ).toHaveBeenCalledWith({
      where: {
        isActive: true,
        dailyTime: '08:00',
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
  });

  it('should only trigger weekend schedules on Saturday or Sunday', async () => {
    mockPrismaService.notificationSchedule.findMany.mockResolvedValue([
      { ...baseSchedule, frequency: NotificationFrequency.Weekends },
    ]);

    const triggered = await service.pollDueSchedules(
      new Date(2026, 4, 23, 8, 0),
    );

    expect(triggered).toBe(1);
  });

  it('should skip unknown frequencies', async () => {
    mockPrismaService.notificationSchedule.findMany.mockResolvedValue([
      { ...baseSchedule, frequency: 'monthly' },
    ]);

    const triggered = await service.pollDueSchedules(
      new Date(2026, 4, 20, 8, 0),
    );

    expect(triggered).toBe(0);
  });
});
