import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(): Promise<UserProfileDto> {
    // To be implemented by developers
    return {
      id: 'dummy-id',
      email: 'user@example.com',
      preference: {
        theme: 'system',
        hapticsEnabled: true,
        notificationOverlay: false
      }
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile successfully updated.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProfile(@Body() dto: UpdateProfileDto): Promise<UserProfileDto> {
    // To be implemented by developers
    return {
      id: 'dummy-id',
      email: 'user@example.com',
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl,
    };
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({ status: 200, description: 'Preferences successfully updated.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updatePreferences(@Body() dto: UpdatePreferencesDto): Promise<UserProfileDto> {
    // To be implemented by developers
    return {
      id: 'dummy-id',
      email: 'user@example.com',
      preference: {
        theme: dto.theme || 'system',
        hapticsEnabled: dto.hapticsEnabled ?? true,
        notificationOverlay: dto.notificationOverlay ?? false,
        lockScreenTiming: dto.lockScreenTiming
      }
    };
  }
}
