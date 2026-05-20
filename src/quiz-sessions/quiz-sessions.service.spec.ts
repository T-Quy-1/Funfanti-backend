import { Test, TestingModule } from '@nestjs/testing';
import { QuizSessionsService } from './quiz-sessions.service';
import { PrismaService } from '../common/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('QuizSessionsService', () => {
  let service: QuizSessionsService;

  const mockQuestionSet = {
    id: 'qs-uuid',
    questions: [
      {
        id: 'q-1',
        choices: [
          { id: 'c-1', isCorrect: false },
          { id: 'c-2', isCorrect: true },
        ],
      },
      {
        id: 'q-2',
        choices: [
          { id: 'c-3', isCorrect: true },
          { id: 'c-4', isCorrect: false },
        ],
      },
    ],
  };

  const mockPrismaService = {
    questionSet: {
      findUnique: jest.fn(),
    },
    quizSession: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizSessionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<QuizSessionsService>(QuizSessionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submit', () => {
    const validDto = {
      totalTimeMs: 10000,
      responses: [
        { questionId: 'q-1', selectedAnswerId: 'c-2', timeTakenMs: 5000 },
        { questionId: 'q-2', selectedAnswerId: 'c-3', timeTakenMs: 5000 },
      ],
    };

    it('should submit a quiz session and return score 100%', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.$transaction.mockImplementation(async (fn) =>
        fn({
          quizSession: {
            create: jest.fn().mockResolvedValue({
              id: 'session-uuid',
              userId: 'user-uuid',
              questionSetId: 'qs-uuid',
              totalTimeMs: 10000,
              score: 100,
              status: 'COMPLETED',
            }),
          },
        }),
      );
      mockPrismaService.quizSession.findMany.mockResolvedValue([
        { score: 100 },
      ]);

      const result = await service.submit('user-uuid', 'qs-uuid', validDto);

      expect(result.score).toBe(100);
      expect(result.correctCount).toBe(2);
      expect(result.totalQuestions).toBe(2);
      expect(result.status).toBe('COMPLETED');
      expect(result.analyticsSummary).toContain('2/2');
    });

    it('should calculate 50% score when one answer is wrong', async () => {
      const halfRightDto = {
        totalTimeMs: 10000,
        responses: [
          { questionId: 'q-1', selectedAnswerId: 'c-1', timeTakenMs: 5000 }, // wrong
          { questionId: 'q-2', selectedAnswerId: 'c-3', timeTakenMs: 5000 }, // correct
        ],
      };

      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.$transaction.mockImplementation(async (fn) =>
        fn({
          quizSession: {
            create: jest.fn().mockResolvedValue({
              id: 'session-uuid',
              userId: 'user-uuid',
              questionSetId: 'qs-uuid',
              totalTimeMs: 10000,
              score: 50,
              status: 'COMPLETED',
            }),
          },
        }),
      );
      mockPrismaService.quizSession.findMany.mockResolvedValue([{ score: 50 }]);

      const result = await service.submit('user-uuid', 'qs-uuid', halfRightDto);

      expect(result.score).toBe(50);
      expect(result.correctCount).toBe(1);
      expect(result.totalQuestions).toBe(2);
    });

    it('should handle unanswered questions (no selectedAnswerId) as incorrect', async () => {
      const unansweredDto = {
        totalTimeMs: 5000,
        responses: [
          { questionId: 'q-1', timeTakenMs: 5000 }, // no answer
          { questionId: 'q-2', selectedAnswerId: 'c-3', timeTakenMs: 5000 },
        ],
      };

      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.$transaction.mockImplementation(async (fn) =>
        fn({
          quizSession: {
            create: jest.fn().mockResolvedValue({
              id: 'session-uuid',
              userId: 'user-uuid',
              questionSetId: 'qs-uuid',
              totalTimeMs: 5000,
              score: 50,
              status: 'COMPLETED',
            }),
          },
        }),
      );
      mockPrismaService.quizSession.findMany.mockResolvedValue([{ score: 50 }]);

      const result = await service.submit(
        'user-uuid',
        'qs-uuid',
        unansweredDto,
      );

      expect(result.score).toBe(50);
      expect(result.correctCount).toBe(1);
    });

    it('should throw NotFoundException if question set not found', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(null);

      await expect(
        service.submit('user-uuid', 'unknown', validDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for empty responses', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );

      await expect(
        service.submit('user-uuid', 'qs-uuid', {
          totalTimeMs: 1000,
          responses: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid question ID', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );

      const badDto = {
        totalTimeMs: 5000,
        responses: [
          {
            questionId: 'invalid-q',
            selectedAnswerId: 'c-1',
            timeTakenMs: 5000,
          },
        ],
      };

      await expect(
        service.submit('user-uuid', 'qs-uuid', badDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for duplicate question responses', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );

      const duplicateDto = {
        totalTimeMs: 5000,
        responses: [
          { questionId: 'q-1', selectedAnswerId: 'c-2', timeTakenMs: 2500 },
          { questionId: 'q-1', selectedAnswerId: 'c-2', timeTakenMs: 2500 },
        ],
      };

      await expect(
        service.submit('user-uuid', 'qs-uuid', duplicateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when an answer belongs to another question', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );

      const crossQuestionAnswerDto = {
        totalTimeMs: 5000,
        responses: [
          { questionId: 'q-1', selectedAnswerId: 'c-3', timeTakenMs: 5000 },
        ],
      };

      await expect(
        service.submit('user-uuid', 'qs-uuid', crossQuestionAnswerDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate percentile correctly with multiple sessions', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.$transaction.mockImplementation(async (fn) =>
        fn({
          quizSession: {
            create: jest.fn().mockResolvedValue({
              id: 'session-uuid',
              userId: 'user-uuid',
              questionSetId: 'qs-uuid',
              totalTimeMs: 10000,
              score: 100,
              status: 'COMPLETED',
            }),
          },
        }),
      );
      // Simulate 4 previous attempts with lower scores + current one
      mockPrismaService.quizSession.findMany.mockResolvedValue([
        { score: 40 },
        { score: 60 },
        { score: 80 },
        { score: 50 },
        { score: 100 }, // current
      ]);

      const result = await service.submit('user-uuid', 'qs-uuid', validDto);

      expect(result.percentile).toBe(100); // 4 out of 4 others scored lower
      expect(result.analyticsSummary).toContain('better than 100%');
    });

    it('should handle first attempt (single session) percentile', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.$transaction.mockImplementation(async (fn) =>
        fn({
          quizSession: {
            create: jest.fn().mockResolvedValue({
              id: 'session-uuid',
              userId: 'user-uuid',
              questionSetId: 'qs-uuid',
              totalTimeMs: 10000,
              score: 100,
              status: 'COMPLETED',
            }),
          },
        }),
      );
      // Only the current session exists
      mockPrismaService.quizSession.findMany.mockResolvedValue([
        { score: 100 },
      ]);

      const result = await service.submit('user-uuid', 'qs-uuid', validDto);

      expect(result.percentile).toBe(100);
      expect(result.analyticsSummary).toContain('first to attempt');
    });
  });
});
