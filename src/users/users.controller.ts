import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile() {
    return { message: 'Get profile skeleton' };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Body() dto: any) {
    return { message: 'Update profile skeleton' };
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  async updatePreferences(@Body() dto: any) {
    return { message: 'Update preferences skeleton' };
  }
}
