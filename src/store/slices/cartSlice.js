import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        total: 0
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existingItem = state.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.cantidad += 1;
            } else {
                state.items.push({ ...product, cantidad: 1 });
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item) item.cantidad = quantity;
        },
        clearCart: (state) => {
            state.items = [];
        }
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;