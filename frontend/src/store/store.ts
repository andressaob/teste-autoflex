import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import rawMaterialReducer from './rawMaterialSlice';

/**
 * Redux Store Configuration.
 * Combines reducers for Products and Raw Materials.
 */
export const store = configureStore({
  reducer: {
    products: productReducer,
    rawMaterials: rawMaterialReducer,
  },
});

/** Root State type for useSelector hooks */
export type RootState = ReturnType<typeof store.getState>;
/** App Dispatch type for useDispatch hooks */
export type AppDispatch = typeof store.dispatch;
