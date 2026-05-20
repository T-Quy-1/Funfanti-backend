import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('QuestionSetsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  // Use static seeded question set IDs from seed.ts
  const mathSetId = 'a5f22e84-1849-417f-94ad-731ff58fb810';
  const scienceSetId = 'b2c93d95-2950-528f-a5be-842ff69fc921';

  const testEmail = `test-e2e-qs-${Date.now()}@example.com`;

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

    // Register a user for authenticated endpoints
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        displayName: 'QS E2E User',
      })
      .expect(201);

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup bookmarks and test user
    await prisma.bookmark.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-qs' } },
    });
    await app.close();
  });

  describe('GET /question-sets', () => {
    it('should return a list of question sets', async () => {
      const res = await request(app.getHttpServer())
        .get('/question-sets')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by topic=math', async () => {
      const res = await request(app.getHttpServer())
        .get('/question-sets?topic=math')
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(
        res.body.every((qs: any) => qs.topic.toLowerCase() === 'math'),
      ).toBe(true);
    });

    it('should filter by featured status', async () => {
      const res = await request(app.getHttpServer())
        .get('/question-sets?isFeatured=true')
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.every((qs: any) => qs.isFeatured === true)).toBe(true);
    });

    it('should handle pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/question-sets?page=1&limit=1')
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /question-sets/:id', () => {
    it('should return question set details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/question-sets/${mathSetId}`)
        .expect(200);

      expect(res.body.id).toBe(mathSetId);
      expect(res.body.title).toBe('Mental Math Magic');
      expect(res.body.tags).toBeDefined();
      expect(res.body.creator).toBeDefined();
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get('/question-sets/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('GET /question-sets/:id/questions', () => {
    it('should return aggregated questions with choices', async () => {
      const res = await request(app.getHttpServer())
        .get(`/question-sets/${mathSetId}/questions`)
        .expect(200);

      expect(res.body.id).toBe(mathSetId);
      expect(res.body.questions).toBeDefined();
      expect(res.body.questions.length).toBeGreaterThanOrEqual(1);
      expect(res.body.questions[0].choices).toBeDefined();
      expect(res.body.questions[0].choices.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST/DELETE /question-sets/:id/bookmark', () => {
    it('should create a bookmark', async () => {
      const res = await request(app.getHttpServer())
        .post(`/question-sets/${mathSetId}/bookmark`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(res.body.message).toBe('Bookmark created successfully');
    });

    it('should return 409 if already bookmarked', async () => {
      await request(app.getHttpServer())
        .post(`/question-sets/${mathSetId}/bookmark`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(409);
    });

    it('should remove a bookmark', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/question-sets/${mathSetId}/bookmark`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Bookmark removed successfully');
    });

    it('should return 404 when removing non-existent bookmark', async () => {
      await request(app.getHttpServer())
        .delete(`/question-sets/${mathSetId}/bookmark`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post(`/question-sets/${mathSetId}/bookmark`)
        .expect(401);
    });
  });
});
