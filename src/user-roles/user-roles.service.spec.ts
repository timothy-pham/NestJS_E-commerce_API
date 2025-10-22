import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRolesService } from './user-roles.service';
import { UserRole } from './user-role.schema';
import { RolesService } from '../roles/roles.service';

describe('UserRolesService', () => {
  let service: UserRolesService;
  let mockUserRoleModel: any;
  let mockRolesService: any;

  beforeEach(async () => {
    mockUserRoleModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      constructor: jest.fn(),
      save: jest.fn(),
    };

    mockRolesService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        {
          provide: getModelToken(UserRole.name),
          useValue: mockUserRoleModel,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUser', () => {
    it('should return user roles for a user', async () => {
      const userId = 'user123';
      const mockUserRoles = [{ userId, roleId: 'role123' }];
      
      mockUserRoleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUserRoles),
        }),
      });

      const result = await service.findByUser(userId);
      expect(result).toEqual(mockUserRoles);
      expect(mockUserRoleModel.find).toHaveBeenCalledWith({ userId, isActive: true });
    });
  });
});
