import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: any) {
    // To be implemented by developers
    return { message: 'Register skeleton' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT' })
  async login(@Body() dto: any) {
    // To be implemented by developers
    return { message: 'Login skeleton' };
  }
}
