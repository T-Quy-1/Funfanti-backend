import { Module } from '@nestjs/common';
import { QuestionSetsService } from './question-sets.service';
import { QuestionSetsController } from './question-sets.controller';

@Module({
  controllers: [QuestionSetsController],
  providers: [QuestionSetsService],
})
export class QuestionSetsModule {}
