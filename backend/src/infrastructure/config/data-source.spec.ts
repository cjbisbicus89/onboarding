import { DataSource } from 'typeorm';

describe('data-source', () => {
  it('loadsDataSource', async () => {
    const { AppDataSource } = await import('./data-source');

    expect(AppDataSource).toBeInstanceOf(DataSource);
    expect(AppDataSource.options.type).toBe('postgres');
    expect(AppDataSource.options.synchronize).toBe(false);
  });
});
