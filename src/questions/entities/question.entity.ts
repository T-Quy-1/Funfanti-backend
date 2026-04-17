import { ApiProperty } from '@nestjs/swagger';

export class Question {
  @ApiProperty({
    example: '6f859a8d-9f53-4f92-a37b-f6a4d2d8f0af',
    description: 'Question unique identifier (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'Science',
    description: 'Topic of the question',
  })
  topic!: string;

  @ApiProperty({
    example: 'Which planet is known as the Red Planet?',
    description: 'Question content',
  })
  questionText!: string;

  @ApiProperty({
    example: ['Mars', 'Jupiter', 'Venus', 'Earth'],
    description: 'Exactly 4 possible answers',
  })
  options!: string[];

  @ApiProperty({
    example: 'Mars',
    description: 'Correct answer value',
  })
  correctAnswer!: string;

  @ApiProperty({
    example: 'Mars looks red because its surface contains iron oxide (rust).',
    description: 'Explanation shown after answering',
  })
  explanation!: string;
}
