import { Module } from '@nestjs/common';
import { QuizSessionsService } from './quiz-sessions.service';
import {
  QuestionSetSessionsController,
  QuizSessionsController,
} from './quiz-sessions.controller';

@Module({
  controllers: [QuizSessionsController, QuestionSetSessionsController],
  providers: [QuizSessionsService],
})
export class QuizSessionsModule {}
