import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionSetsService } from './question-sets.service';
import { QuestionSetResponseDto, QuestionSetPayloadDto, QuestionDto } from './dto/question-sets.dto';

@ApiTags('Question Sets')
@Controller('question-sets')
export class QuestionSetsController {
  constructor(private readonly questionSetsService: QuestionSetsService) {}

  @Get()
  @ApiOperation({ summary: 'Discover question sets with filters' })
  @ApiQuery({ name: 'topic', required: false, description: 'Filter by topic' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (e.g., popular, latest)' })
  @ApiResponse({ status: 200, description: 'List of question sets.', type: [QuestionSetResponseDto] })
  async findAll(@Query('topic') topic?: string, @Query('sort') sort?: string): Promise<QuestionSetResponseDto[]> {
    return this.questionSetsService.findAll(topic, sort);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question set details' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({ status: 200, description: 'Question set metadata.', type: QuestionSetResponseDto })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  async findOne(@Param('id') id: string): Promise<QuestionSetResponseDto> {
    return this.questionSetsService.findOne(id);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'Get aggregated questions payload for a specific set' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({ status: 200, description: 'Aggregated payload of questions and choices.', type: QuestionSetPayloadDto })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  async getQuestions(@Param('id') id: string): Promise<QuestionSetPayloadDto> {
    return this.questionSetsService.getQuestions(id);
  }

  @Post(':id/bookmark')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark a question set' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({ status: 201, description: 'Bookmark created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async bookmark(@Param('id') id: string) {
    // To be implemented by developers
    return { message: 'Bookmark skeleton' };
  }
}
