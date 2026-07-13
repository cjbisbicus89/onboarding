import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { CONFIG } from '../../../infrastructure/api/config';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCentavos: number;
  currency: string;
  stock: number;
}

export interface CatalogState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('catalog/fetchProducts', async () => {
  const response = await axios.get<Product[]>(`${CONFIG.API_BASE_URL}/products`);
  return response.data;
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos';
      });
  },
});

export default catalogSlice.reducer;
