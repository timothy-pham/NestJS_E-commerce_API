import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { Role } from './role.schema';
import { PermissionsService } from '../permissions/permissions.service';

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleModel: any;
  let mockPermissionsService: any;

  beforeEach(async () => {
    mockRoleModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      constructor: jest.fn(),
      save: jest.fn(),
    };

    mockPermissionsService = {
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const mockRoles = [{ name: 'Test Role' }];
      mockRoleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRoles),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockRoles);
      expect(mockRoleModel.find).toHaveBeenCalled();
    });
  });
});
