import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SubmitSessionDto } from './dto/submit-session.dto';

@Injectable()
export class QuizSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, questionSetId: string, dto: SubmitSessionDto) {
    // 1. Validate that the question set exists and get its questions
    const questionSet = await this.prisma.questionSet.findUnique({
      where: { id: questionSetId },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!questionSet) {
      throw new NotFoundException('Question set not found');
    }

    if (dto.responses.length === 0) {
      throw new BadRequestException('At least one response is required');
    }

    // 2. Build a map of questionId -> correct answer(s) for fast lookup
    const questionMap = new Map(
      questionSet.questions.map((q) => [
        q.id,
        {
          answerIds: q.choices.map((c) => c.id),
          correctAnswerIds: q.choices
            .filter((c) => c.isCorrect)
            .map((c) => c.id),
        },
      ]),
    );

    // 3. Process each response and determine correctness
    let correctCount = 0;
    const seenQuestionIds = new Set<string>();
    const processedResponses = dto.responses.map((response) => {
      const questionInfo = questionMap.get(response.questionId);
      if (!questionInfo) {
        throw new BadRequestException(
          `Invalid question ID: ${response.questionId}`,
        );
      }

      if (seenQuestionIds.has(response.questionId)) {
        throw new BadRequestException(
          `Duplicate response for question ID: ${response.questionId}`,
        );
      }
      seenQuestionIds.add(response.questionId);

      if (
        response.selectedAnswerId &&
        !questionInfo.answerIds.includes(response.selectedAnswerId)
      ) {
        throw new BadRequestException(
          `Selected answer ID ${response.selectedAnswerId} does not belong to question ID: ${response.questionId}`,
        );
      }

      const isCorrect = response.selectedAnswerId
        ? questionInfo.correctAnswerIds.includes(response.selectedAnswerId)
        : false;

      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId: response.questionId,
        selectedAnswerId: response.selectedAnswerId || null,
        timeTakenMs: response.timeTakenMs,
        isCorrect,
      };
    });

    // 4. Calculate score as percentage
    const totalQuestions = dto.responses.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // 5. Create the session and all responses in a transaction
    const session = await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.quizSession.create({
        data: {
          userId,
          questionSetId,
          totalTimeMs: dto.totalTimeMs,
          score,
          status: 'COMPLETED',
          responses: {
            create: processedResponses,
          },
        },
      });

      return newSession;
    });

    // 6. Calculate comparative analytics (percentile ranking)
    const allSessions = await this.prisma.quizSession.findMany({
      where: {
        questionSetId,
        status: 'COMPLETED',
      },
      select: { score: true },
    });

    const totalSessions = allSessions.length;
    const sessionsWithLowerScore = allSessions.filter(
      (s) => (s.score ?? 0) < score,
    ).length;

    const percentile =
      totalSessions > 1
        ? Math.round((sessionsWithLowerScore / (totalSessions - 1)) * 100)
        : 100; // First session = top 100%

    // 7. Build analytics summary
    const analyticsSummary = `You scored ${correctCount}/${totalQuestions} (${score}%) in ${(dto.totalTimeMs / 1000).toFixed(1)}s. ${
      totalSessions > 1
        ? `You scored better than ${percentile}% of other attempts.`
        : 'You are the first to attempt this quiz!'
    }`;

    return {
      id: session.id,
      score,
      status: session.status,
      totalTimeMs: session.totalTimeMs,
      correctCount,
      totalQuestions,
      percentile,
      analyticsSummary,
    };
  }
}
