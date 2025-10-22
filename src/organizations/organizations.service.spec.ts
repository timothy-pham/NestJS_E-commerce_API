import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrganizationsService } from './organizations.service';
import { Organization } from './organization.schema';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let mockOrganizationModel: any;

  beforeEach(async () => {
    mockOrganizationModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      constructor: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getModelToken(Organization.name),
          useValue: mockOrganizationModel,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of organizations', async () => {
      const mockOrganizations = [{ name: 'Test Org' }];
      mockOrganizationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganizations),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockOrganizations);
      expect(mockOrganizationModel.find).toHaveBeenCalled();
    });
  });
});
