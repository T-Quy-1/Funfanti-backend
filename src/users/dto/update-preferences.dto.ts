import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ example: 'dark', description: 'UI Theme (light, dark, system)', required: false })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ example: true, description: 'Enable/disable haptic feedback', required: false })
  @IsOptional()
  @IsBoolean()
  hapticsEnabled?: boolean;

  @ApiProperty({ example: true, description: 'Enable/disable lock-screen overlay', required: false })
  @IsOptional()
  @IsBoolean()
  notificationOverlay?: boolean;

  @ApiProperty({ example: { morning: '08:00', lunch: '12:30' }, description: 'JSON describing lock-screen schedule', required: false })
  @IsOptional()
  @IsObject()
  lockScreenTiming?: Record<string, any>;
}
