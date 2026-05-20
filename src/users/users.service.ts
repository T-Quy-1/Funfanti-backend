import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import {
  CreateScheduleDto,
  NotificationFrequency,
  UpdateScheduleDto,
} from './dto/notification-schedule.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      preference: user.preference
        ? {
            theme: user.preference.theme,
            hapticsEnabled: user.preference.hapticsEnabled,
            notificationOverlay: user.preference.notificationOverlay,
            lockScreenTiming: user.preference.lockScreenTiming,
          }
        : undefined,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      include: { preference: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
      preference: updated.preference
        ? {
            theme: updated.preference.theme,
            hapticsEnabled: updated.preference.hapticsEnabled,
            notificationOverlay: updated.preference.notificationOverlay,
            lockScreenTiming: updated.preference.lockScreenTiming,
          }
        : undefined,
    };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Avatar file is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.cloudinary.uploadImage(file, 'funfanti/avatars');

    if (!('secure_url' in result) || !result.secure_url) {
      throw new BadRequestException(
        'Avatar upload did not return a secure URL',
      );
    }

    const avatarUrl = result.secure_url;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: { preference: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
      preference: updated.preference
        ? {
            theme: updated.preference.theme,
            hapticsEnabled: updated.preference.hapticsEnabled,
            notificationOverlay: updated.preference.notificationOverlay,
            lockScreenTiming: updated.preference.lockScreenTiming,
          }
        : undefined,
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preference = await this.prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        theme: dto.theme ?? 'system',
        hapticsEnabled: dto.hapticsEnabled ?? true,
        notificationOverlay: dto.notificationOverlay ?? false,
        lockScreenTiming: dto.lockScreenTiming ?? undefined,
      },
      update: {
        ...(dto.theme !== undefined && { theme: dto.theme }),
        ...(dto.hapticsEnabled !== undefined && {
          hapticsEnabled: dto.hapticsEnabled,
        }),
        ...(dto.notificationOverlay !== undefined && {
          notificationOverlay: dto.notificationOverlay,
        }),
        ...(dto.lockScreenTiming !== undefined && {
          lockScreenTiming: dto.lockScreenTiming,
        }),
      },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      preference: {
        theme: preference.theme,
        hapticsEnabled: preference.hapticsEnabled,
        notificationOverlay: preference.notificationOverlay,
        lockScreenTiming: preference.lockScreenTiming,
      },
    };
  }

  async deleteMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User account deleted successfully' };
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        questionSet: {
          select: {
            id: true,
            title: true,
            description: true,
            topic: true,
            mediaUrl: true,
            isFeatured: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      questionSet: b.questionSet,
    }));
  }

  async getActivity(userId: string) {
    const sessions = await this.prisma.quizSession.findMany({
      where: { userId },
      include: {
        questionSet: {
          select: {
            id: true,
            title: true,
            topic: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      score: s.score,
      status: s.status,
      totalTimeMs: s.totalTimeMs,
      createdAt: s.createdAt,
      questionSet: s.questionSet,
    }));
  }

  // Notification Schedule CRUD
  async getSchedules(userId: string) {
    return this.prisma.notificationSchedule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSchedule(userId: string, dto: CreateScheduleDto) {
    return this.prisma.notificationSchedule.create({
      data: {
        userId,
        dailyTime: dto.dailyTime,
        frequency: dto.frequency ?? NotificationFrequency.Daily,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateSchedule(
    userId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
  ) {
    const schedule = await this.prisma.notificationSchedule.findFirst({
      where: { id: scheduleId, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.notificationSchedule.update({
      where: { id: scheduleId },
      data: {
        ...(dto.dailyTime !== undefined && { dailyTime: dto.dailyTime }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteSchedule(userId: string, scheduleId: string) {
    const schedule = await this.prisma.notificationSchedule.findFirst({
      where: { id: scheduleId, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.prisma.notificationSchedule.delete({
      where: { id: scheduleId },
    });

    return { message: 'Schedule deleted successfully' };
  }
}
