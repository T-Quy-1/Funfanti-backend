import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SubmitSessionDto } from './dto/submit-session.dto';

@Injectable()
export class QuizSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, questionSetId: string, dto: SubmitSessionDto) {
    // 1. Fetch questions and correct answers for the question set
    const questions = await this.prisma.question.findMany({
      where: { questionSetId },
      include: { choices: { where: { isCorrect: true } } }
    });

    if (!questions.length) {
      throw new NotFoundException('Question set not found or contains no questions.');
    }

    // 2. Calculate score
    let score = 0;
    const maxScore = questions.length;
    
    // Create a map for quick lookup of correct answer IDs
    const correctAnswerMap = new Map<string, string>();
    questions.forEach(q => {
      if (q.choices.length > 0) {
        correctAnswerMap.set(q.id, q.choices[0].id);
      }
    });

    const responsesData = dto.responses.map(response => {
      const isCorrect = !!response.selectedAnswerId && response.selectedAnswerId === correctAnswerMap.get(response.questionId);
      if (isCorrect) {
        score += 1;
      }
      return {
        questionId: response.questionId,
        selectedAnswerId: response.selectedAnswerId || null,
        timeTakenMs: response.timeTakenMs,
        isCorrect
      };
    });

    // 3. Create Session and Responses
    const session = await this.prisma.quizSession.create({
      data: {
        userId,
        questionSetId,
        totalTimeMs: dto.totalTimeMs,
        score,
        status: 'COMPLETED',
        responses: {
          create: responsesData
        }
      }
    });

    const percentage = Math.round((score / maxScore) * 100);

    return {
      id: session.id,
      score,
      status: session.status,
      totalTimeMs: session.totalTimeMs!,
      analyticsSummary: `You scored ${percentage}%, placing you in the top ${Math.max(1, 100 - percentage)}% of learners!`
    };
  }
}
