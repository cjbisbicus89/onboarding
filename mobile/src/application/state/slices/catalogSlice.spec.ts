import catalogReducer, { fetchProducts, Product } from './catalogSlice';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('catalogSlice', () => {
  const initialState = {
    products: [],
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(catalogReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle fetchProducts.pending', () => {
    const action = { type: fetchProducts.pending.type };
    const state = catalogReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchProducts.fulfilled', () => {
    const products: Product[] = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        imageUrl: 'img1',
        priceCentavos: 100,
        currency: 'USD',
        stock: 10,
      },
    ];
    const action = { type: fetchProducts.fulfilled.type, payload: products };
    const state = catalogReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.products).toEqual(products);
  });

  it('should handle fetchProducts.rejected', () => {
    const action = { type: fetchProducts.rejected.type, error: { message: 'Fetch error' } };
    const state = catalogReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Fetch error');
  });
});
