import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotificationFrequency } from './dto/notification-schedule.dto';
import { UserTheme } from './dto/update-preferences.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const user = { id: 'user-uuid' };
  const profile = {
    id: 'user-uuid',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: null,
    preference: {
      theme: UserTheme.System,
      hapticsEnabled: true,
      notificationOverlay: false,
      lockScreenTiming: null,
    },
  };
  const schedule = {
    id: 'schedule-uuid',
    dailyTime: '08:00',
    frequency: NotificationFrequency.Daily,
    isActive: true,
    createdAt: new Date(),
  };

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    updatePreferences: jest.fn(),
    deleteMe: jest.fn(),
    getBookmarks: jest.fn(),
    getActivity: jest.fn(),
    getSchedules: jest.fn(),
    createSchedule: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate profile operations', async () => {
    const file = { buffer: Buffer.from('image') } as Express.Multer.File;
    mockUsersService.getProfile.mockResolvedValue(profile);
    mockUsersService.updateProfile.mockResolvedValue({
      ...profile,
      displayName: 'Updated',
    });
    mockUsersService.uploadAvatar.mockResolvedValue({
      ...profile,
      avatarUrl: 'https://res.cloudinary.com/demo/avatar.jpg',
    });
    mockUsersService.updatePreferences.mockResolvedValue({
      ...profile,
      preference: { ...profile.preference, theme: UserTheme.Dark },
    });
    mockUsersService.deleteMe.mockResolvedValue({
      message: 'User account deleted successfully',
    });

    await expect(controller.getProfile(user)).resolves.toBe(profile);
    await expect(
      controller.updateProfile(user, { displayName: 'Updated' }),
    ).resolves.toEqual({ ...profile, displayName: 'Updated' });
    await expect(controller.uploadAvatar(user, file)).resolves.toEqual({
      ...profile,
      avatarUrl: 'https://res.cloudinary.com/demo/avatar.jpg',
    });
    await expect(
      controller.updatePreferences(user, { theme: UserTheme.Dark }),
    ).resolves.toEqual({
      ...profile,
      preference: { ...profile.preference, theme: UserTheme.Dark },
    });
    await expect(controller.deleteMe(user)).resolves.toEqual({
      message: 'User account deleted successfully',
    });
    expect(mockUsersService.getProfile).toHaveBeenCalledWith('user-uuid');
    expect(mockUsersService.updateProfile).toHaveBeenCalledWith('user-uuid', {
      displayName: 'Updated',
    });
    expect(mockUsersService.uploadAvatar).toHaveBeenCalledWith(
      'user-uuid',
      file,
    );
    expect(mockUsersService.updatePreferences).toHaveBeenCalledWith(
      'user-uuid',
      { theme: UserTheme.Dark },
    );
    expect(mockUsersService.deleteMe).toHaveBeenCalledWith('user-uuid');
  });

  it('should delegate engagement lookups', async () => {
    mockUsersService.getBookmarks.mockResolvedValue([]);
    mockUsersService.getActivity.mockResolvedValue([]);

    await expect(controller.getBookmarks(user)).resolves.toEqual([]);
    await expect(controller.getActivity(user)).resolves.toEqual([]);
    expect(mockUsersService.getBookmarks).toHaveBeenCalledWith('user-uuid');
    expect(mockUsersService.getActivity).toHaveBeenCalledWith('user-uuid');
  });

  it('should delegate schedule operations', async () => {
    mockUsersService.getSchedules.mockResolvedValue([schedule]);
    mockUsersService.createSchedule.mockResolvedValue(schedule);
    mockUsersService.updateSchedule.mockResolvedValue({
      ...schedule,
      isActive: false,
    });
    mockUsersService.deleteSchedule.mockResolvedValue({
      message: 'Schedule deleted successfully',
    });

    await expect(controller.getSchedules(user)).resolves.toEqual([schedule]);
    await expect(
      controller.createSchedule(user, {
        dailyTime: '08:00',
        frequency: NotificationFrequency.Daily,
      }),
    ).resolves.toBe(schedule);
    await expect(
      controller.updateSchedule(user, 'schedule-uuid', { isActive: false }),
    ).resolves.toEqual({ ...schedule, isActive: false });
    await expect(
      controller.deleteSchedule(user, 'schedule-uuid'),
    ).resolves.toEqual({
      message: 'Schedule deleted successfully',
    });
    expect(mockUsersService.getSchedules).toHaveBeenCalledWith('user-uuid');
    expect(mockUsersService.createSchedule).toHaveBeenCalledWith('user-uuid', {
      dailyTime: '08:00',
      frequency: NotificationFrequency.Daily,
    });
    expect(mockUsersService.updateSchedule).toHaveBeenCalledWith(
      'user-uuid',
      'schedule-uuid',
      { isActive: false },
    );
    expect(mockUsersService.deleteSchedule).toHaveBeenCalledWith(
      'user-uuid',
      'schedule-uuid',
    );
  });
});
