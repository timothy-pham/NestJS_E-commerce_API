import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRolesService } from '../../user-roles/user-roles.service';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let userRolesService: UserRolesService;
  let reflector: Reflector;

  const mockUserRolesService = {
    getUserPermissions: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: UserRolesService,
          useValue: mockUserRolesService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    userRolesService = module.get<UserRolesService>(UserRolesService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user?: any, storeId?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          storeId,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockExecutionContext({ userId: '123' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockUserRolesService.getUserPermissions).not.toHaveBeenCalled();
  });

  it('should allow access when no roles are specified', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockExecutionContext({ userId: '123' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockUserRolesService.getUserPermissions).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not authenticated', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockExecutionContext(); // No user

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated');
  });

  it('should allow access when user has required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['store_manager']);
    mockUserRolesService.getUserPermissions.mockResolvedValue({
      roles: ['store_manager', 'staff'],
      permissions: [],
    });

    const context = createMockExecutionContext({ userId: '123' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockUserRolesService.getUserPermissions).toHaveBeenCalledWith('123', undefined);
  });

  it('should allow access when user has one of multiple required roles', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['super_admin', 'store_owner', 'store_manager']);
    mockUserRolesService.getUserPermissions.mockResolvedValue({
      roles: ['store_manager'],
      permissions: [],
    });

    const context = createMockExecutionContext({ userId: '123' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user does not have required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['super_admin']);
    mockUserRolesService.getUserPermissions.mockResolvedValue({
      roles: ['customer'],
      permissions: [],
    });

    const context = createMockExecutionContext({ userId: '123' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('Access denied. Required roles: super_admin');
  });

  it('should pass storeId to getUserPermissions when available', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['store_manager']);
    mockUserRolesService.getUserPermissions.mockResolvedValue({
      roles: ['store_manager'],
      permissions: [],
    });

    const context = createMockExecutionContext({ userId: '123' }, 'store456');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockUserRolesService.getUserPermissions).toHaveBeenCalledWith('123', 'store456');
  });

  it('should handle user with multiple roles', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['organization_admin']);
    mockUserRolesService.getUserPermissions.mockResolvedValue({
      roles: ['organization_admin', 'store_owner', 'store_manager'],
      permissions: [],
    });

    const context = createMockExecutionContext({ userId: '123' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});
