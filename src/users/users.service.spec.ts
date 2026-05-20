import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserTheme } from './dto/update-preferences.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: null,
    passwordHash: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreference = {
    id: 'pref-uuid',
    userId: 'user-uuid',
    theme: 'dark',
    hapticsEnabled: true,
    notificationOverlay: false,
    lockScreenTiming: null,
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userPreference: {
      upsert: jest.fn(),
    },
    bookmark: {
      findMany: jest.fn(),
    },
    quizSession: {
      findMany: jest.fn(),
    },
    notificationSchedule: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user profile with preferences', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        preference: mockPreference,
      });

      const result = await service.getProfile('user-uuid');

      expect(result.id).toBe('user-uuid');
      expect(result.email).toBe('test@example.com');
      expect(result.preference).toBeDefined();
      expect(result.preference!.theme).toBe('dark');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update display name', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        displayName: 'New Name',
        preference: mockPreference,
      });

      const result = await service.updateProfile('user-uuid', { displayName: 'New Name' });

      expect(result.displayName).toBe('New Name');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-uuid' },
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('unknown', { displayName: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar and update user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockCloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/avatar.jpg',
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: 'https://res.cloudinary.com/test/avatar.jpg',
        preference: mockPreference,
      });

      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const result = await service.uploadAvatar('user-uuid', mockFile);

      expect(result.avatarUrl).toBe('https://res.cloudinary.com/test/avatar.jpg');
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile, 'funfanti/avatars');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;

      await expect(service.uploadAvatar('unknown', mockFile)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(service.uploadAvatar('user-uuid', undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updatePreferences', () => {
    it('should upsert preferences', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userPreference.upsert.mockResolvedValue({
        ...mockPreference,
        theme: 'light',
      });

      const result = await service.updatePreferences('user-uuid', { theme: UserTheme.Light });

      expect(result.preference!.theme).toBe('light');
      expect(mockPrismaService.userPreference.upsert).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePreferences('unknown', { theme: UserTheme.Dark }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookmarks', () => {
    it('should return bookmarks with question set data', async () => {
      const mockBookmarks = [
        {
          id: 'bm-1',
          createdAt: new Date(),
          questionSet: {
            id: 'qs-1',
            title: 'Math Quiz',
            description: 'Test math skills',
            topic: 'math',
            mediaUrl: null,
            isFeatured: true,
          },
        },
      ];
      mockPrismaService.bookmark.findMany.mockResolvedValue(mockBookmarks);

      const result = await service.getBookmarks('user-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].questionSet.title).toBe('Math Quiz');
    });
  });

  describe('deleteMe', () => {
    it('should delete the user account', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteMe('user-uuid');

      expect(result.message).toBe('User account deleted successfully');
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
      });
    });

    it('should throw NotFoundException when deleting an unknown user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteMe('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActivity', () => {
    it('should return activity history', async () => {
      const mockSessions = [
        {
          id: 'sess-1',
          score: 80,
          status: 'COMPLETED',
          totalTimeMs: 15000,
          createdAt: new Date(),
          questionSet: {
            id: 'qs-1',
            title: 'Math Quiz',
            topic: 'math',
          },
        },
      ];
      mockPrismaService.quizSession.findMany.mockResolvedValue(mockSessions);

      const result = await service.getActivity('user-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(80);
      expect(result[0].questionSet.title).toBe('Math Quiz');
    });
  });

  describe('Notification Schedules', () => {
    const mockSchedule = {
      id: 'sched-1',
      userId: 'user-uuid',
      dailyTime: '08:00',
      frequency: 'daily',
      isActive: true,
      createdAt: new Date(),
    };

    it('should get schedules', async () => {
      mockPrismaService.notificationSchedule.findMany.mockResolvedValue([mockSchedule]);

      const result = await service.getSchedules('user-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].dailyTime).toBe('08:00');
    });

    it('should create a schedule', async () => {
      mockPrismaService.notificationSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.createSchedule('user-uuid', { dailyTime: '08:00' });

      expect(result.dailyTime).toBe('08:00');
    });

    it('should update a schedule', async () => {
      mockPrismaService.notificationSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.notificationSchedule.update.mockResolvedValue({
        ...mockSchedule,
        dailyTime: '12:00',
      });

      const result = await service.updateSchedule('user-uuid', 'sched-1', { dailyTime: '12:00' });

      expect(result.dailyTime).toBe('12:00');
    });

    it('should throw NotFoundException when updating non-existent schedule', async () => {
      mockPrismaService.notificationSchedule.findFirst.mockResolvedValue(null);

      await expect(
        service.updateSchedule('user-uuid', 'unknown', { dailyTime: '12:00' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete a schedule', async () => {
      mockPrismaService.notificationSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.notificationSchedule.delete.mockResolvedValue(mockSchedule);

      const result = await service.deleteSchedule('user-uuid', 'sched-1');

      expect(result.message).toBe('Schedule deleted successfully');
    });

    it('should throw NotFoundException when deleting non-existent schedule', async () => {
      mockPrismaService.notificationSchedule.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteSchedule('user-uuid', 'unknown'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
