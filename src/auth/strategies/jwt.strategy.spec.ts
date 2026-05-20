import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate an existing JWT subject', async () => {
    const user = {
      id: 'user-uuid',
      email: 'test@example.com',
      displayName: 'Test User',
    };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    await expect(strategy.validate({ sub: 'user-uuid' })).resolves.toBe(user);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-uuid' },
    });
  });

  it('should reject a JWT subject for a missing user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'missing-user' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
