import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';
import { Product, ProductInput } from '../types';

/**
 * State shape for the Product slice.
 */
interface ProductState {
    items: Product[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    items: [],
    loading: false,
    error: null,
};

// --- Async Thunks (Actions) ---

/**
 * Fetches all products from the backend.
 */
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    const response = await api.get<Product[]>('/products');
    return response.data;
});

/**
 * Creates a new product.
 */
export const createProduct = createAsyncThunk('products/createProduct', async (product: ProductInput) => {
    const response = await api.post<Product>('/products', product);
    return response.data;
});

/**
 * Adds a raw material association to a product.
 * @param productId Product ID.
 * @param rawMaterialId Raw Material ID.
 * @param quantity Quantity needed.
 */
export const addRawMaterialToProduct = createAsyncThunk(
    'products/addRawMaterial',
    async ({ productId, rawMaterialId, quantity }: { productId: number; rawMaterialId: number; quantity: number }) => {
        await api.post(`/products/${productId}/raw-materials`, { rawMaterialId, quantity });
        return { productId, rawMaterialId, quantity }; 
    }
);

/**
 * Deletes a product by ID.
 */
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: number) => {
    await api.delete(`/products/${id}`);
    return id;
});

// --- Slice Definition ---

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch List
            .addCase(fetchProducts.pending, (state) => { state.loading = true; })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Erro ao carregar produtos';
            })
            // Create
            .addCase(createProduct.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Delete
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            // Add Material (Success)
            .addCase(addRawMaterialToProduct.fulfilled, (state) => {
                 // Trigger refetch might be simpler in UI or handle here
            });
    },
});

export default productSlice.reducer;
