import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizSessionsService } from './quiz-sessions.service';

@ApiTags('Quiz Sessions')
@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit completed quiz session' })
  async submit(@Param('id') questionSetId: string, @Body() dto: any) {
    return { message: 'Submit session skeleton' };
  }
}
