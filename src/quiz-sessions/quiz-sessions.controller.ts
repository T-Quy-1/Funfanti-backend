import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuizSessionsService } from './quiz-sessions.service';
import { SubmitSessionDto, SessionResponseDto } from './dto/submit-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

type AuthenticatedUser = {
  id: string;
};

@ApiTags('Quiz Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit completed quiz session' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiBody({ type: SubmitSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session submitted and analytics returned.',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid submission data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  async submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) questionSetId: string,
    @Body() dto: SubmitSessionDto,
  ): Promise<SessionResponseDto> {
    return this.quizSessionsService.submit(user.id, questionSetId, dto);
  }
}

@ApiTags('Quiz Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('question-sets')
export class QuestionSetSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  @Post(':id/sessions')
  @ApiOperation({ summary: 'Submit completed quiz session for a question set' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiBody({ type: SubmitSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session submitted and analytics returned.',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid submission data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Question set not found.' })
  async submitForQuestionSet(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) questionSetId: string,
    @Body() dto: SubmitSessionDto,
  ): Promise<SessionResponseDto> {
    return this.quizSessionsService.submit(user.id, questionSetId, dto);
  }
}
