import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { AppModule } from './app.module';

describe('AppModule', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PORT: '3000',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      PAYMENT_PROVIDER_BASE_URL: 'https://api.example.com',
      PAYMENT_PROVIDER_PUBLIC_KEY: 'pub-key',
      PAYMENT_PROVIDER_PRIVATE_KEY: 'prv-key',
      PAYMENT_PROVIDER_INTEGRITY_SECRET: 'integrity-secret',
      PAYMENT_PROVIDER_EVENTS_KEY: 'events-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('module_compiles', async () => {
    const mockRepository = {};
    const mockDataSource = {
      manager: {},
      options: { type: 'postgres' },
      entityMetadatas: {
        find: jest.fn().mockReturnValue({}),
      },
      createEntityManager: jest.fn().mockReturnValue({}),
      getRepository: jest.fn().mockReturnValue(mockRepository),
      getTreeRepository: jest.fn().mockReturnValue(mockRepository),
      getMongoRepository: jest.fn().mockReturnValue(mockRepository),
      initialize: jest.fn().mockResolvedValue({}),
    } as unknown as DataSource;

    const mockEntityManager = {} as unknown as EntityManager;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .overrideProvider(EntityManager)
      .useValue(mockEntityManager)
      .compile();

    expect(module).toBeDefined();
  });
});
