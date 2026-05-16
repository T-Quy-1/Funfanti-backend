import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizSessionsService } from './quiz-sessions.service';
import { PrismaService } from '../common/prisma.service';
import { SubmitSessionDto, SessionResponseDto } from './dto/submit-session.dto';

@ApiTags('Quiz Sessions')
@ApiBearerAuth()
@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(
    private readonly quizSessionsService: QuizSessionsService,
    private readonly prisma: PrismaService
  ) {}

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit completed quiz session' })
  @ApiParam({ name: 'id', description: 'Question Set ID' })
  @ApiBody({ type: SubmitSessionDto })
  @ApiResponse({ status: 201, description: 'Session submitted and analytics returned.', type: SessionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid submission data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async submit(@Param('id') questionSetId: string, @Body() dto: SubmitSessionDto): Promise<SessionResponseDto> {
    // TEMPORARY: Mock authenticated user until AuthGuard is ready
    const user = await this.prisma.user.findFirst();
    if (!user) {
      throw new Error('No mock user found in DB');
    }

    return this.quizSessionsService.submit(user.id, questionSetId, dto);
  }
}
