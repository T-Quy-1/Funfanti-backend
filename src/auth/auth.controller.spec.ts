import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authResponse = {
    user: {
      id: 'user-uuid',
      email: 'test@example.com',
      displayName: 'Test User',
      avatarUrl: null,
    },
    accessToken: 'token',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate registration to AuthService', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
    };
    mockAuthService.register.mockResolvedValue(authResponse);

    await expect(controller.register(dto)).resolves.toBe(authResponse);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should delegate login to AuthService', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    mockAuthService.login.mockResolvedValue(authResponse);

    await expect(controller.login(dto)).resolves.toBe(authResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });
});
