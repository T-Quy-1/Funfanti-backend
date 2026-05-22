import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('QuizSessionsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  // Use static seeded question set
  const mathSetId = 'a5f22e84-1849-417f-94ad-731ff58fb810';
  let question1Id: string;
  let question2Id: string;

  const testEmail = `test-e2e-quiz-${Date.now()}@example.com`;

  let correctAnswer1Id: string;
  let correctAnswer2Id: string;
  let wrongAnswer1Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Register a user
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        displayName: 'Quiz E2E User',
      })
      .expect(201);

    accessToken = res.body.accessToken;

    const questions = await prisma.question.findMany({
      where: { questionSetId: mathSetId },
      orderBy: { orderIndex: 'asc' },
    });

    question1Id = questions[0].id;
    question2Id = questions[1].id;

    // Fetch correct answer IDs from seeded data
    const choices1 = await prisma.answerChoice.findMany({
      where: { questionId: question1Id },
    });
    correctAnswer1Id = choices1.find((c) => c.isCorrect)!.id;
    wrongAnswer1Id = choices1.find((c) => !c.isCorrect)!.id;

    const choices2 = await prisma.answerChoice.findMany({
      where: { questionId: question2Id },
    });
    correctAnswer2Id = choices2.find((c) => c.isCorrect)!.id;
  });

  afterAll(async () => {
    // Cleanup quiz sessions and test user
    await prisma.questionResponse.deleteMany({
      where: { session: { user: { email: testEmail } } },
    });
    await prisma.quizSession.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-quiz' } },
    });
    await app.close();
  });

  describe('POST /quiz-sessions/:id/submit', () => {
    it('should submit a quiz with all correct answers and return 100% score', async () => {
      const res = await request(app.getHttpServer())
        .post(`/quiz-sessions/${mathSetId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          totalTimeMs: 12000,
          responses: [
            {
              questionId: question1Id,
              selectedAnswerId: correctAnswer1Id,
              timeTakenMs: 6000,
            },
            {
              questionId: question2Id,
              selectedAnswerId: correctAnswer2Id,
              timeTakenMs: 6000,
            },
          ],
        })
        .expect(201);

      expect(res.body.score).toBe(100);
      expect(res.body.correctCount).toBe(2);
      expect(res.body.totalQuestions).toBe(2);
      expect(res.body.status).toBe('COMPLETED');
      expect(res.body.analyticsSummary).toBeDefined();
      expect(res.body.percentile).toBeDefined();
    });

    it('should submit a quiz with mixed answers and return 50% score', async () => {
      const res = await request(app.getHttpServer())
        .post(`/quiz-sessions/${mathSetId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          totalTimeMs: 10000,
          responses: [
            {
              questionId: question1Id,
              selectedAnswerId: wrongAnswer1Id,
              timeTakenMs: 5000,
            },
            {
              questionId: question2Id,
              selectedAnswerId: correctAnswer2Id,
              timeTakenMs: 5000,
            },
          ],
        })
        .expect(201);

      expect(res.body.score).toBe(50);
      expect(res.body.correctCount).toBe(1);
      expect(res.body.totalQuestions).toBe(2);
    });

    it('should include comparative analytics in subsequent submissions', async () => {
      const res = await request(app.getHttpServer())
        .post(`/quiz-sessions/${mathSetId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          totalTimeMs: 8000,
          responses: [
            {
              questionId: question1Id,
              selectedAnswerId: correctAnswer1Id,
              timeTakenMs: 4000,
            },
            {
              questionId: question2Id,
              selectedAnswerId: correctAnswer2Id,
              timeTakenMs: 4000,
            },
          ],
        })
        .expect(201);

      expect(res.body.analyticsSummary).toContain('better than');
    });

    it('should support the question-set session submission alias', async () => {
      const res = await request(app.getHttpServer())
        .post(`/question-sets/${mathSetId}/sessions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          totalTimeMs: 9000,
          responses: [
            {
              questionId: question1Id,
              selectedAnswerId: correctAnswer1Id,
              timeTakenMs: 4500,
            },
            {
              questionId: question2Id,
              selectedAnswerId: correctAnswer2Id,
              timeTakenMs: 4500,
            },
          ],
        })
        .expect(201);

      expect(res.body.score).toBe(100);
      expect(res.body.analyticsSummary).toBeDefined();
    });

    it('should reject duplicate question responses', async () => {
      await request(app.getHttpServer())
        .post(`/quiz-sessions/${mathSetId}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          totalTimeMs: 5000,
          responses: [
            {
              questionId: question1Id,
              selectedAnswerId: correctAnswer1Id,
              timeTakenMs: 2500,
            },
            {
              questionId: question1Id,
              selectedAnswerId: correctAnswer1Id,
              timeTakenMs: 2500,
            },
          ],
        })
        .expect(400);
    });

    it('should return 404 for non-existent question set', async () => {
      await request(app.getHttpServer())
        .post('/quiz-sessions/00000000-0000-0000-0000-000000000000/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          totalTimeMs: 5000,
          responses: [
            {
              questionId: question1Id,
              selectedAnswerId: correctAnswer1Id,
              timeTakenMs: 5000,
            },
          ],
        })
        .expect(404);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post(`/quiz-sessions/${mathSetId}/submit`)
        .send({
          totalTimeMs: 5000,
          responses: [],
        })
        .expect(401);
    });

    it('should show activity in user history after submission', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me/activity')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].status).toBe('COMPLETED');
      expect(res.body[0].questionSet).toBeDefined();
    });
  });
});
