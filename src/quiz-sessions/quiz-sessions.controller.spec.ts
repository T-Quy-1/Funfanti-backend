import { Test, TestingModule } from '@nestjs/testing';
import {
  QuestionSetSessionsController,
  QuizSessionsController,
} from './quiz-sessions.controller';
import { QuizSessionsService } from './quiz-sessions.service';

describe('Quiz session controllers', () => {
  let quizSessionsController: QuizSessionsController;
  let questionSetSessionsController: QuestionSetSessionsController;

  const mockQuizSessionsService = {
    submit: jest.fn(),
  };

  const dto = {
    totalTimeMs: 12000,
    responses: [
      {
        questionId: 'question-uuid',
        selectedAnswerId: 'answer-uuid',
        timeTakenMs: 12000,
      },
    ],
  };

  const response = {
    id: 'session-uuid',
    score: 100,
    status: 'COMPLETED',
    totalTimeMs: 12000,
    correctCount: 1,
    totalQuestions: 1,
    percentile: 100,
    analyticsSummary: 'You scored 1/1 (100%) in 12.0s.',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizSessionsController, QuestionSetSessionsController],
      providers: [
        { provide: QuizSessionsService, useValue: mockQuizSessionsService },
      ],
    }).compile();

    quizSessionsController = module.get<QuizSessionsController>(
      QuizSessionsController,
    );
    questionSetSessionsController = module.get<QuestionSetSessionsController>(
      QuestionSetSessionsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(quizSessionsController).toBeDefined();
    expect(questionSetSessionsController).toBeDefined();
  });

  it('should submit through the quiz-sessions route', async () => {
    mockQuizSessionsService.submit.mockResolvedValue(response);

    await expect(
      quizSessionsController.submit({ id: 'user-uuid' }, 'set-uuid', dto),
    ).resolves.toBe(response);
    expect(mockQuizSessionsService.submit).toHaveBeenCalledWith(
      'user-uuid',
      'set-uuid',
      dto,
    );
  });

  it('should submit through the question-set alias route', async () => {
    mockQuizSessionsService.submit.mockResolvedValue(response);

    await expect(
      questionSetSessionsController.submitForQuestionSet(
        { id: 'user-uuid' },
        'set-uuid',
        dto,
      ),
    ).resolves.toBe(response);
    expect(mockQuizSessionsService.submit).toHaveBeenCalledWith(
      'user-uuid',
      'set-uuid',
      dto,
    );
  });
});
