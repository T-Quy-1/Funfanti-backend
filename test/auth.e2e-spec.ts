import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
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
      where: { email: { contains: 'test-e2e-auth' } },
    });
    await app.close();
  });

  describe('Authentication Flow', () => {
    const email = `test-e2e-auth-${Date.now()}@example.com`;
    const password = 'Password123!';
    const displayName = 'E2E Flow User';

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          displayName,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(email);
    });

    it('should fail to register if the email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Password123!',
          displayName: 'Duplicate User',
        })
        .expect(409);
    });

    it('should login successfully with the registered credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail to login with a wrong password', async () => {
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
