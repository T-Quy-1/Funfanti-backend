import { ApiProperty } from '@nestjs/swagger';

export class BookmarkQuestionSetDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Geography Basics' })
  title!: string;

  @ApiProperty({ example: 'Learn about countries and capitals.' })
  description!: string;

  @ApiProperty({ example: 'geography' })
  topic!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../image.jpg', required: false })
  mediaUrl?: string | null;

  @ApiProperty({ example: true })
  isFeatured!: boolean;
}

export class BookmarkResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: BookmarkQuestionSetDto })
  questionSet!: BookmarkQuestionSetDto;
}
