import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'Science',
    description: 'Question topic, for example Science or History',
  })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({
    example: 'Which planet is known as the Red Planet?',
    description: 'Question content shown to the learner',
  })
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @ApiProperty({
    example: ['Mars', 'Jupiter', 'Venus', 'Earth'],
    description: 'Exactly 4 answer options',
    minItems: 4,
    maxItems: 4,
  })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  options!: string[];

  @ApiProperty({
    example: 'Mars',
    description: 'The correct answer, and it must be one of the options',
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer!: string;

  @ApiProperty({
    example: 'Mars appears red due to iron oxide on its surface.',
    description: 'Explanation shown after the learner submits an answer',
  })
  @IsString()
  @IsNotEmpty()
  explanation!: string;
}
