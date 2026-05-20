import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum QuestionSetSort {
  Popular = 'popular',
  Latest = 'latest',
}

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return value;
};

export class QueryQuestionSetsDto {
  @ApiProperty({
    example: 'math',
    description: 'Filter by topic',
    required: false,
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({
    enum: QuestionSetSort,
    example: QuestionSetSort.Popular,
    description: 'Sort order',
    required: false,
  })
  @IsOptional()
  @IsEnum(QuestionSetSort)
  sort?: QuestionSetSort;

  @ApiProperty({
    example: true,
    description: 'Filter featured question sets',
    required: false,
  })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, description: 'Items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
