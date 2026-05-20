import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionSetsModule } from './question-sets/question-sets.module';
import { QuizSessionsModule } from './quiz-sessions/quiz-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    UsersModule,
    QuestionSetsModule,
    QuizSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
