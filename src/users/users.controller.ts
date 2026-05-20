import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import {
  UserDeletionResponseDto,
  UserProfileDto,
} from './dto/user-profile.dto';
import { BookmarkResponseDto } from './dto/bookmark-response.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ScheduleResponseDto,
} from './dto/notification-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
};

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return user profile.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileDto> {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserProfileDto> {
    return this.usersService.uploadAvatar(user.id, file);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({
    status: 200,
    description: 'Preferences successfully updated.',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updatePreferences(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account and associated data' })
  @ApiResponse({
    status: 200,
    description: 'User account deleted.',
    type: UserDeletionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDeletionResponseDto> {
    return this.usersService.deleteMe(user.id);
  }

  // --- Bookmarks ---
  @Get('me/bookmarks')
  @ApiOperation({ summary: 'Get current user bookmarks' })
  @ApiResponse({
    status: 200,
    description: 'List of bookmarked question sets.',
    type: [BookmarkResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBookmarks(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BookmarkResponseDto[]> {
    return this.usersService.getBookmarks(user.id);
  }

  // --- Activity ---
  @Get('me/activity')
  @ApiOperation({ summary: 'Get current user activity history' })
  @ApiResponse({
    status: 200,
    description: 'List of quiz sessions.',
    type: [ActivityResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getActivity(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityResponseDto[]> {
    return this.usersService.getActivity(user.id);
  }

  // --- Notification Schedules ---
  @Get('me/schedules')
  @ApiOperation({ summary: 'Get current user notification schedules' })
  @ApiResponse({
    status: 200,
    description: 'List of notification schedules.',
    type: [ScheduleResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSchedules(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ScheduleResponseDto[]> {
    return this.usersService.getSchedules(user.id);
  }

  @Post('me/schedules')
  @ApiOperation({ summary: 'Create a new notification schedule' })
  @ApiBody({ type: CreateScheduleDto })
  @ApiResponse({
    status: 201,
    description: 'Schedule created.',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.usersService.createSchedule(user.id, dto);
  }

  @Put('me/schedules/:scheduleId')
  @ApiOperation({ summary: 'Update a notification schedule' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated.',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Schedule not found.' })
  async updateSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    return this.usersService.updateSchedule(user.id, scheduleId, dto);
  }

  @Delete('me/schedules/:scheduleId')
  @ApiOperation({ summary: 'Delete a notification schedule' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Schedule deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Schedule not found.' })
  async deleteSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
  ) {
    return this.usersService.deleteSchedule(user.id, scheduleId);
  }
}
