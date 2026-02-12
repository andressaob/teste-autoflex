import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosInstance';
import { RawMaterial } from '../types';

/**
 * State shape for Raw Materials slice.
 */
interface RawMaterialState {
    items: RawMaterial[];
    loading: boolean;
    error: string | null;
}

const initialState: RawMaterialState = {
    items: [],
    loading: false,
    error: null,
};

// --- Async Thunks ---

/** Fetch all raw materials */
export const fetchRawMaterials = createAsyncThunk('rawMaterials/fetchRawMaterials', async () => {
    const response = await api.get<RawMaterial[]>('/raw-materials');
    return response.data;
});

/** Create a new raw material */
export const createRawMaterial = createAsyncThunk('rawMaterials/createRawMaterial', async (material: RawMaterial) => {
    const response = await api.post<RawMaterial>('/raw-materials', material);
    return response.data;
});

/** Delete a raw material by ID */
export const deleteRawMaterial = createAsyncThunk('rawMaterials/deleteRawMaterial', async (id: number) => {
    await api.delete(`/raw-materials/${id}`);
    return id;
});

// --- Slice Definition ---

const rawMaterialSlice = createSlice({
    name: 'rawMaterials',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchRawMaterials.pending, (state) => { state.loading = true; })
            .addCase(fetchRawMaterials.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            // Create
            .addCase(createRawMaterial.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Delete
            .addCase(deleteRawMaterial.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export default rawMaterialSlice.reducer;
