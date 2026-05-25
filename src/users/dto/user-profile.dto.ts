import { ApiProperty } from '@nestjs/swagger';

export class UserPreferenceDto {
  @ApiProperty()
  theme!: string;

  @ApiProperty()
  hapticsEnabled!: boolean;

  @ApiProperty()
  notificationOverlay!: boolean;

  @ApiProperty({
    required: false,
    example: {
      intervals: [{ startTime: '08:00', endTime: '12:00' }],
      checkIntervalMinutes: 15,
    },
  })
  lockScreenTiming?: unknown;
}

export class UserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  displayName?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({ type: UserPreferenceDto, required: false })
  preference?: UserPreferenceDto;
}

export class UserDeletionResponseDto {
  @ApiProperty({ example: 'User account deleted successfully' })
  message!: string;
}
