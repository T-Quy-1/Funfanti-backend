import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsOptional } from 'class-validator';

export enum UserTheme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export class UpdatePreferencesDto {
  @ApiProperty({
    enum: UserTheme,
    example: UserTheme.Dark,
    description: 'UI theme preference',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserTheme)
  theme?: UserTheme;

  @ApiProperty({
    example: true,
    description: 'Enable/disable haptic feedback',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hapticsEnabled?: boolean;

  @ApiProperty({
    example: true,
    description: 'Enable/disable lock-screen overlay',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  notificationOverlay?: boolean;

  @ApiProperty({
    example: { morning: '08:00', lunch: '12:30' },
    description: 'JSON describing lock-screen schedule',
    required: false,
  })
  @IsOptional()
  @IsObject()
  lockScreenTiming?: Record<string, any>;
}
