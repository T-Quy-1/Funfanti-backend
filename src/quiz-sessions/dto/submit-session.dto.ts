import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionResponseInputDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Question ID',
  })
  @IsUUID()
  questionId!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Selected Answer ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  selectedAnswerId?: string;

  @ApiProperty({
    example: 4500,
    description: 'Time taken in milliseconds to answer',
  })
  @IsInt()
  @Min(0)
  timeTakenMs!: number;
}

export class SubmitSessionDto {
  @ApiProperty({
    example: 15000,
    description: 'Total time taken for the entire quiz in milliseconds',
  })
  @IsInt()
  @Min(0)
  totalTimeMs!: number;

  @ApiProperty({
    type: [QuestionResponseInputDto],
    description: 'List of responses for each question',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionResponseInputDto)
  responses!: QuestionResponseInputDto[];
}

export class SessionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 80, description: 'Score achieved (percentage)' })
  score!: number;

  @ApiProperty({ example: 'COMPLETED' })
  status!: string;

  @ApiProperty({ example: 15000 })
  totalTimeMs!: number | null;

  @ApiProperty({ example: 8, description: 'Number of correct answers' })
  correctCount!: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of questions answered',
  })
  totalQuestions!: number;

  @ApiProperty({
    example: 75,
    description: 'Percentile rank compared to other attempts',
  })
  percentile!: number;

  @ApiProperty({
    example:
      'You scored 8/10 (80%) in 15.0s. You scored better than 75% of other attempts.',
    description: 'Comparative analytics summary',
  })
  analyticsSummary!: string;
}
