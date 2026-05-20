import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    };

    it('should successfully register a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'uuid',
        email: registerDto.email,
        displayName: registerDto.displayName,
        avatarUrl: null,
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid',
        email: loginDto.email,
        passwordHash: hashedPassword,
        displayName: 'Test User',
        avatarUrl: null,
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('test-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid',
        email: loginDto.email,
        passwordHash: 'wrong-hash',
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
