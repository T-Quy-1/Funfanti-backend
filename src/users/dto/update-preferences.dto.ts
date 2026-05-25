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
    example: {
      intervals: [{ startTime: '08:00', endTime: '12:00' }],
      checkIntervalMinutes: 15,
    },
    description:
      'JSON describing lock-screen popup windows. Legacy exact-time keys are accepted for backward compatibility.',
    required: false,
  })
  @IsOptional()
  @IsObject()
  lockScreenTiming?: Record<string, any>;
}
