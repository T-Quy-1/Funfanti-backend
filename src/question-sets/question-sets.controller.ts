import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuestionSetsService } from './question-sets.service';
import {
  BookmarkMutationResponseDto,
  MessageResponseDto,
  QuestionSetPayloadDto,
  QuestionSetResponseDto,
} from './dto/question-sets.dto';
import { QueryQuestionSetsDto } from './dto/query-question-sets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
};

@ApiTags('Question Sets')
@Controller('question-sets')
export class QuestionSetsController {
  constructor(private readonly questionSetsService: QuestionSetsService) {}

  @Get()
  @ApiOperation({ summary: 'Discover question sets with filters' })
  @ApiQuery({ name: 'topic', required: false, description: 'Filter by topic' })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order (popular, latest)',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Filter featured content',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of question sets.',
    type: [QuestionSetResponseDto],
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query() query: QueryQuestionSetsDto,
    @CurrentUser() user?: AuthenticatedUser | null,
  ) {
    if (user) {
      return this.questionSetsService.findAll(query, user.id);
    }
    return this.questionSetsService.findAll(query);
  }

  @Get('tags')
  @ApiOperation({ summary: 'List available question set tags' })
  @ApiResponse({
    status: 200,
    description: 'Available tags for question set filtering.',
    type: [String],
  })
  async findTags() {
    return this.questionSetsService.findTags();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question set details' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({
    status: 200,
    description: 'Question set metadata.',
    type: QuestionSetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthenticatedUser | null,
  ) {
    if (user) {
      return this.questionSetsService.findOne(id, user.id);
    }
    return this.questionSetsService.findOne(id);
  }

  @Get(':id/questions')
  @ApiOperation({
    summary: 'Get aggregated questions payload for a specific set',
  })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({
    status: 200,
    description: 'Aggregated payload of questions and choices.',
    type: QuestionSetPayloadDto,
  })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  async getQuestions(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionSetsService.getQuestions(id);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark a question set' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({
    status: 201,
    description: 'Bookmark created.',
    type: BookmarkMutationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  @ApiResponse({ status: 409, description: 'Already bookmarked.' })
  async bookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionSetsService.bookmark(user.id, id);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove bookmark from a question set' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark removed.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Bookmark not found.' })
  async removeBookmark(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionSetsService.removeBookmark(user.id, id);
  }
}
