import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Jane Doe', description: 'The new display name', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../avatar.jpg', description: 'The new avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
