import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizSessionsService } from './quiz-sessions.service';
import { SubmitSessionDto, SessionResponseDto } from './dto/submit-session.dto';

@ApiTags('Quiz Sessions')
@ApiBearerAuth()
@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit completed quiz session' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiBody({ type: SubmitSessionDto })
  @ApiResponse({ status: 201, description: 'Session submitted and analytics returned.', type: SessionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid submission data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async submit(@Param('id') questionSetId: string, @Body() dto: SubmitSessionDto): Promise<SessionResponseDto> {
    // To be implemented by developers
    return {
      id: 'dummy-session-id',
      score: 80,
      status: 'COMPLETED',
      totalTimeMs: dto.totalTimeMs,
      analyticsSummary: 'You scored in the top 50%'
    };
  }
}
