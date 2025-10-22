import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StoresService } from './stores.service';
import { Store } from './store.schema';

describe('StoresService', () => {
  let service: StoresService;
  let mockStoreModel: any;

  beforeEach(async () => {
    mockStoreModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      constructor: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getModelToken(Store.name),
          useValue: mockStoreModel,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of stores', async () => {
      const mockStores = [{ name: 'Test Store' }];
      mockStoreModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStores),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockStores);
      expect(mockStoreModel.find).toHaveBeenCalled();
    });
  });
});
