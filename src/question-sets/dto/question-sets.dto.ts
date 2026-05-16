import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'https://res.cloudinary.com/.../image.jpg', required: false })
  mediaUrl?: string;

  @ApiProperty({ example: 'Paris is the capital of France.', required: false })
  explanationText?: string;

  @ApiProperty({ example: 1 })
  orderIndex!: number;

  @ApiProperty({ type: [AnswerChoiceDto] })
  choices!: AnswerChoiceDto[];
}

export class QuestionSetResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Geography Basics' })
  title!: string;

  @ApiProperty({ example: 'Learn about countries and capitals.' })
  description!: string;

  @ApiProperty({ example: 'geography' })
  topic!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../image.jpg', required: false })
  mediaUrl?: string;

  @ApiProperty({ example: true })
  isFeatured!: boolean;

  @ApiProperty({ example: ['world', 'capitals'] })
  tags!: string[];
}

export class QuestionSetPayloadDto extends QuestionSetResponseDto {
  @ApiProperty({ type: [QuestionDto], description: 'Aggregated payload of questions and choices' })
  questions!: QuestionDto[];
}
