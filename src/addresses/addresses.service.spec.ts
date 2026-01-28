import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { getModelToken } from '@nestjs/sequelize';
import { Address } from './address.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: getModelToken(Address),
          useValue: {
            upsert: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NASA_FIRMS_API_KEY') return 'test_key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
