import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum QuestionSetSort {
  Popular = 'popular',
  Latest = 'latest',
  Rating = 'rating',
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
    example: 'algebra',
    description: 'Search in title and description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: ['Literature', 'Science'],
    description: 'Filter by tags',
    required: false,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 10, description: 'Minimum number of questions', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minQuestions?: number;

  @ApiProperty({ example: 25, description: 'Maximum number of questions', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxQuestions?: number;

  @ApiProperty({ example: 4.0, description: 'Minimum rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({ example: 5.0, description: 'Maximum rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  maxRating?: number;

  @ApiProperty({
    enum: QuestionSetSort,
    example: QuestionSetSort.Rating,
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
