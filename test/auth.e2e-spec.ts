import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/auth/../../src/app.module';
import { PrismaService } from './../src/common/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-e2e' } },
    });
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const email = `test-e2e-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Password123!',
          displayName: 'E2E Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(email);
    });

    it('should fail if email already exists', async () => {
      const email = `test-duplicate@example.com`;
      
      // Ensure user exists
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          passwordHash: 'dummy',
          displayName: 'Existing User',
          preference: { create: {} }
        }
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Password123!',
          displayName: 'New User',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    const email = `login-test@example.com`;
    const password = 'Password123!';

    beforeAll(async () => {
      // Register user manually for login test
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          displayName: 'Login User',
        });
    });

    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        })
        .expect(200); 

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });
});
