import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

  const testEmail = `test-e2e-users-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

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

    // Register a user and get the token
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        displayName: 'E2E User',
      })
      .expect(201);

    accessToken = res.body.accessToken;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e-users' } },
    });
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should return the current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe(testEmail);
      expect(res.body.preference).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('PUT /users/me', () => {
    it('should update the display name', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ displayName: 'Updated Name' })
        .expect(200);

      expect(res.body.displayName).toBe('Updated Name');
    });
  });

  describe('PUT /users/me/preferences', () => {
    it('should update preferences', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/me/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ theme: 'dark', hapticsEnabled: false })
        .expect(200);

      expect(res.body.preference.theme).toBe('dark');
      expect(res.body.preference.hapticsEnabled).toBe(false);
    });

    it('should reject an unsupported theme', async () => {
      await request(app.getHttpServer())
        .put('/users/me/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ theme: 'neon' })
        .expect(400);
    });
  });

  describe('GET /users/me/bookmarks', () => {
    it('should return empty bookmarks initially', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /users/me/activity', () => {
    it('should return empty activity initially', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me/activity')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('Notification Schedules', () => {
    let scheduleId: string;

    it('should create a notification schedule', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/me/schedules')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyTime: '08:00', frequency: 'daily' })
        .expect(201);

      expect(res.body.dailyTime).toBe('08:00');
      expect(res.body.isActive).toBe(true);
      scheduleId = res.body.id;
    });

    it('should reject invalid notification time format', async () => {
      await request(app.getHttpServer())
        .post('/users/me/schedules')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyTime: '25:99', frequency: 'daily' })
        .expect(400);
    });

    it('should list notification schedules', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me/schedules')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].dailyTime).toBe('08:00');
    });

    it('should update a notification schedule', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/me/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dailyTime: '12:00', isActive: false })
        .expect(200);

      expect(res.body.dailyTime).toBe('12:00');
      expect(res.body.isActive).toBe(false);
    });

    it('should delete a notification schedule', async () => {
      await request(app.getHttpServer())
        .delete(`/users/me/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/users/me/schedules')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('DELETE /users/me', () => {
    it('should delete the current user account', async () => {
      const deleteEmail = `test-e2e-users-delete-${Date.now()}@example.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: deleteEmail,
          password: testPassword,
          displayName: 'Delete Me',
        })
        .expect(201);

      const deleteToken = registerRes.body.accessToken;

      const deleteRes = await request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(200);

      expect(deleteRes.body.message).toBe('User account deleted successfully');

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(401);
    });
  });
});
