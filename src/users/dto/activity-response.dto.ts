import { ApiProperty } from '@nestjs/swagger';

export class ActivityQuestionSetDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Geography Basics' })
  title!: string;

  @ApiProperty({ example: 'geography' })
  topic!: string;
}

export class ActivityResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 80, nullable: true })
  score!: number | null;

  @ApiProperty({ example: 'COMPLETED' })
  status!: string;

  @ApiProperty({ example: 15000, nullable: true })
  totalTimeMs!: number | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: ActivityQuestionSetDto })
  questionSet!: ActivityQuestionSetDto;
}
