import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionResponseInputDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Question ID' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Selected Answer ID', required: false })
  @IsOptional()
  @IsUUID()
  selectedAnswerId?: string;

  @ApiProperty({ example: 4500, description: 'Time taken in milliseconds to answer' })
  @IsInt()
  timeTakenMs!: number;
}

export class SubmitSessionDto {
  @ApiProperty({ example: 15000, description: 'Total time taken for the entire quiz in milliseconds' })
  @IsInt()
  totalTimeMs!: number;

  @ApiProperty({ type: [QuestionResponseInputDto], description: 'List of responses for each question' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionResponseInputDto)
  responses!: QuestionResponseInputDto[];
}

export class SessionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 80, description: 'Score achieved in the session' })
  score!: number;

  @ApiProperty({ example: 'COMPLETED' })
  status!: string;

  @ApiProperty({ example: 15000 })
  totalTimeMs!: number;

  @ApiProperty({ example: 'You scored in the top 50%', description: 'Comparative analytics summary', required: false })
  analyticsSummary?: string;
}
