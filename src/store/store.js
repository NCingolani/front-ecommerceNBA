import { configureStore } from '@reduxjs/toolkit';
import cartSlice from './slices/cartSlice';
// import counterSlice from './slices/counterSlice';
// import favoriteSlice from './slices/favoriteSlice';

export const store = configureStore({
    reducer: {
        cart: cartSlice,
        // counter: counterSlice, 
        // favorite: favoriteSlice, 
    },
});