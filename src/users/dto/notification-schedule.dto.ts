import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export enum NotificationFrequency {
  Daily = 'daily',
  Weekdays = 'weekdays',
  Weekends = 'weekends',
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateScheduleDto {
  @ApiProperty({
    example: '08:00',
    description: 'Daily notification time in HH:mm format',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'dailyTime must use 24-hour HH:mm format' })
  dailyTime!: string;

  @ApiProperty({
    enum: NotificationFrequency,
    example: NotificationFrequency.Daily,
    description: 'Notification frequency',
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationFrequency)
  frequency?: NotificationFrequency;

  @ApiProperty({
    example: true,
    description: 'Whether the schedule is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateScheduleDto {
  @ApiProperty({
    example: '12:30',
    description: 'Daily notification time in HH:mm format',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'dailyTime must use 24-hour HH:mm format' })
  dailyTime?: string;

  @ApiProperty({
    enum: NotificationFrequency,
    example: NotificationFrequency.Weekdays,
    description: 'Notification frequency',
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationFrequency)
  frequency?: NotificationFrequency;

  @ApiProperty({
    example: false,
    description: 'Whether the schedule is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ScheduleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '08:00' })
  dailyTime!: string;

  @ApiProperty({ example: 'daily' })
  frequency!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;
}
