import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PermissionsService } from './permissions.service';
import { Permission } from './permission.schema';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockPermissionModel: any;

  beforeEach(async () => {
    mockPermissionModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      constructor: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getModelToken(Permission.name),
          useValue: mockPermissionModel,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const mockPermissions = [{ name: 'Test Permission' }];
      mockPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockPermissions);
      expect(mockPermissionModel.find).toHaveBeenCalled();
    });
  });
});
