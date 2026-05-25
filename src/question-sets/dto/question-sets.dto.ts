import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnswerChoiceDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Paris' })
  text!: string;

  @ApiProperty({ example: true, description: 'Whether this answer is correct' })
  isCorrect!: boolean;
}

export class QuestionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'What is the capital of France?' })
  text!: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../image.jpg',
    required: false,
  })
  mediaUrl?: string;

  @ApiProperty({ example: 'Paris is the capital of France.', required: false })
  explanationText?: string;

  @ApiProperty({ example: 1 })
  orderIndex!: number;

  @ApiProperty({ type: [AnswerChoiceDto] })
  choices!: AnswerChoiceDto[];
}

export class QuestionSetCreatorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Creator User' })
  displayName!: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../avatar.jpg',
    nullable: true,
  })
  avatarUrl?: string | null;
}

export class QuestionSetResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Geography Basics' })
  title!: string;

  @ApiProperty({ example: 'Learn about countries and capitals.' })
  description!: string;

  @ApiProperty({ example: 'A short introduction to geography basics.' })
  summary!: string;

  @ApiProperty({ example: 'geography' })
  topic!: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../image.jpg',
    nullable: true,
  })
  mediaUrl?: string | null;

  @ApiProperty({ example: true })
  isFeatured!: boolean;

  @ApiProperty({ example: ['world', 'capitals'] })
  tags!: string[];

  @ApiPropertyOptional({ type: () => QuestionSetCreatorDto })
  creator?: QuestionSetCreatorDto;

  @ApiPropertyOptional({ example: 10 })
  questionCount?: number;

  @ApiPropertyOptional({ example: 42 })
  sessionCount?: number;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  createdAt?: Date;
}

export class QuestionSetPayloadDto extends QuestionSetResponseDto {
  @ApiProperty({
    type: [QuestionDto],
    description: 'Aggregated payload of questions and choices',
  })
  questions!: QuestionDto[];
}

export class BookmarkMutationResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174999' })
  questionSetId!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: 'Bookmark created successfully' })
  message!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Bookmark removed successfully' })
  message!: string;
}
