import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import catalogReducer, { fetchProducts, Product } from './catalogSlice';

jest.mock('axios');

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

  it('should handle fetchProducts.rejected without message', () => {
    const action = { type: fetchProducts.rejected.type, error: {} };
    const state = catalogReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error al cargar productos');
  });

  it('fetchProducts thunk dispatches fulfilled when axios succeeds', async () => {
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
    (axios.get as jest.Mock).mockResolvedValue({ data: products });

    const store = configureStore({ reducer: { catalog: catalogReducer } });
    await (store.dispatch(fetchProducts() as any));

    const state = store.getState() as any;
    expect(state.catalog.products).toEqual(products);
    expect(state.catalog.loading).toBe(false);
  });
});
